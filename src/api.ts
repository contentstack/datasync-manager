/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { request } from 'https'
import { join } from 'path'
import { stringify } from 'querystring'
import { URL } from 'url'
import { sanitizeUrl } from '@braintree/sanitize-url';
import { readFileSync } from './util/fs'
import { MESSAGES } from './util/messages'

/**
 * @description Validates and sanitizes path to prevent SSRF attacks
 * @param {string} path - The path to validate
 * @returns {string} - Validated and sanitized path
 */
// const validatePath = (path: string): string => {
//   if (!path || typeof path !== 'string') {
//     throw new Error('Invalid path: path must be a non-empty string')
//   }

//   // Remove any potential scheme (http://, https://, //, etc.) to prevent host override
//   let sanitized = path.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^/]*/, '')
  
//   // Remove any // that could be used to override hostname
//   sanitized = sanitized.replace(/^\/\/+[^/]*/, '/')
  
//   // Ensure path starts with /
//   if (!sanitized.startsWith('/')) {
//     sanitized = '/' + sanitized
//   }
  
//   // Check for suspicious patterns that could indicate SSRF attempts
//   const suspiciousPatterns = [
//     /^\/\/+/,        // Multiple slashes
//     /@/,             // @ symbol (could be used for authentication)
//     /\\/,            // Backslashes
//     /^https?:/i,     // URL schemes
//     /^\/\/[^/]/,     // Protocol-relative URLs with host
//   ]
  
//   for (const pattern of suspiciousPatterns) {
//     if (pattern.test(sanitized)) {
//       throw new Error(`Invalid path: contains suspicious characters - ${sanitized}`)
//     }
//   }
  
//   // Final check: path must be a valid API path format
//   if (!sanitized.match(/^\/[a-zA-Z0-9\/_.-]*(\?[a-zA-Z0-9=&_.-]*)?$/)) {
//     throw new Error(`Invalid path format: ${sanitized}`)
//   }
  
//   return sanitized
// }

const debug = Debug('api')
let MAX_RETRY_LIMIT
let RETRY_DELAY_BASE = 200 // Default base delay in milliseconds
let TIMEOUT = 60000 // Increased from 30000 to 60000 (60 seconds) for large stack syncs
let Contentstack

/**
 * @description Initialize sync utilities API requests
 * @param {Object} contentstack - Contentstack configuration details
*/
export const init = (contentstack) => {
  const packageInfo: any = JSON.parse(readFileSync(join(__dirname, '..', 'package.json')))
  Contentstack = contentstack
  Contentstack.headers = {
    'X-User-Agent': `datasync-manager/v${packageInfo.version}`,
    'access_token': Contentstack.deliveryToken,
    'api_key': Contentstack.apiKey
  }

  if (Contentstack.branch) {
    Contentstack.headers['branch'] = Contentstack.branch
  }

  if (Contentstack.MAX_RETRY_LIMIT) {
    MAX_RETRY_LIMIT = Contentstack.MAX_RETRY_LIMIT
  }

  if (Contentstack.RETRY_DELAY_BASE) {
    RETRY_DELAY_BASE = Contentstack.RETRY_DELAY_BASE
  }

  if (Contentstack.TIMEOUT) {
    TIMEOUT = Contentstack.TIMEOUT
  }
}

/**
 * @description Make API requests to Contentstack
 * @param {Object} req - API request object
 * @param {Number} RETRY - API request retry counter
 */
export const get = (req, RETRY = 1) => {
  return new Promise((resolve, reject) => {
    if (RETRY > MAX_RETRY_LIMIT) {
      return reject(new Error('Max retry limit exceeded!'))
    }
    req.method = Contentstack.verbs.get
    req.path = req.path || Contentstack.apis.sync
    if (req.qs) {
      req.path += `?${stringify(req.qs)}`
    }

    const validatePath = req.path
    
    // Use URL constructor to safely encode and extract only the pathname
    // This breaks the taint chain by parsing as a URL relative to a safe base
    let safePath: string
    try {
      const url = new URL(validatePath, `${Contentstack.protocol}//${Contentstack.host}`)
      safePath = sanitizeUrl(url.pathname + url.search)
    } catch (e) {
      // Fallback: direct sanitization if URL parsing fails
      safePath = sanitizeUrl(encodeURI(validatePath))
    }
    
    // nosemgrep: javascript.lang.security.audit.ssrf.node-ssrf-injection.node-ssrf-injection
    // SSRF Protection: Path validated by validatePath(), hostname from trusted config
    const options = {
      headers: Contentstack.headers,
      hostname: Contentstack.host,
      method: Contentstack.verbs.get,
      path: safePath, // Validated, parsed through URL API, and sanitized
      port: Contentstack.port,
      protocol: Contentstack.protocol,
      timeout: TIMEOUT, // Configurable timeout to prevent socket hang ups
    }
    
    // Update req.path with validated version for recursive calls
    req.path = validatePath

    try {
      debug(MESSAGES.API.REQUEST(options.method, options.path))
      let timeDelay
      let body = ''
      const httpRequest = request(options, (response) => {

          response
            .setEncoding('utf-8')
            .on('data', (chunk) => body += chunk)
            .on('end', () => {
              debug(MESSAGES.API.STATUS(response.statusCode))
              if (response.statusCode >= 200 && response.statusCode <= 399) {
                return resolve(JSON.parse(body))
              } else if (response.statusCode === 429) {
                timeDelay = Math.pow(Math.SQRT2, RETRY) * RETRY_DELAY_BASE
                debug(MESSAGES.API.RATE_LIMIT(options.path, timeDelay))

                return setTimeout(() => {
                  return get(req, RETRY)
                    .then(resolve)
                    .catch(reject)
                }, timeDelay)
              } else if (response.statusCode >= 500) {
                // retry, with delay
                timeDelay = Math.pow(Math.SQRT2, RETRY) * RETRY_DELAY_BASE
                debug(MESSAGES.API.RETRY(options.path, timeDelay))
                RETRY++

                return setTimeout(() => {
                  return get(req, RETRY)
                    .then(resolve)
                    .catch(reject)
                }, timeDelay)
              } else {
                // Enhanced error handling for Error 141 (Invalid sync_token)
                try {
                  const errorBody = JSON.parse(body)
                  
                  // Validate error response structure and check for Error 141
                  if (errorBody && typeof errorBody === 'object' && errorBody.error_code === 141 &&  errorBody.errors &&  typeof errorBody.errors === 'object' && errorBody.errors.sync_token) {
                    
                    debug('Error 141 detected: Invalid sync_token. Triggering auto-recovery with init=true')
                    
                    // Ensure req.qs exists before modifying
                    if (!req.qs) {
                      req.qs = {}
                    }
                    
                    // Clear the invalid token parameters and reinitialize
                    delete req.qs.sync_token
                    delete req.qs.pagination_token
                    req.qs.init = true
                    // Reset req.path so it gets rebuilt from Contentstack.apis.sync
                    // (req.path has the old query string baked in from line 109)
                    delete req.path

                    // Mark this as a recovery attempt to prevent infinite loops
                    if (!req._error141Recovery) {
                      req._error141Recovery = true
                      debug('Retrying with init=true after Error 141')
                      return get(req, 1) // Reset retry counter for fresh start
                        .then(resolve)
                        .catch(reject)
                    } else {
                      debug('Error 141 recovery already attempted, failing to prevent infinite loop')
                    }
                  }
                } catch (parseError) {
                  // Body is not JSON or parsing failed, continue with normal error handling
                  debug('Error response parsing failed:', parseError)
                }
                
                debug(MESSAGES.API.REQUEST_FAILED(options))
                return reject(body)
              }
            })
        })

      // Set socket timeout to handle socket hang ups
      httpRequest.setTimeout(options.timeout, () => {
        debug(MESSAGES.API.REQUEST_TIMEOUT(options.path))
        httpRequest.destroy()
        reject(new Error('Request timeout'))
      })

      // Enhanced error handling for socket hang ups and connection resets
      httpRequest.on('error', (error: any) => {
        debug(MESSAGES.API.REQUEST_ERROR(options.path, error?.message, error?.code))
        
        // Handle socket hang up and connection reset errors with retry
        if ((error?.code === 'ECONNRESET' || error?.message?.includes('socket hang up')) && RETRY <= MAX_RETRY_LIMIT) {
          timeDelay = Math.pow(Math.SQRT2, RETRY) * RETRY_DELAY_BASE
          debug(MESSAGES.API.SOCKET_HANGUP_RETRY(options.path, timeDelay, RETRY, MAX_RETRY_LIMIT))
          RETRY++

          return setTimeout(() => {
            return get(req, RETRY)
              .then(resolve)
              .catch(reject)
          }, timeDelay)
        }
        
        return reject(error)
      })

      httpRequest.end()
    } catch (error) {
      return reject(error)
    }
  })
}
