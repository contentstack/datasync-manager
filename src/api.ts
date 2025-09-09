/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { request } from 'https'
import { join } from 'path'
import { stringify } from 'querystring'
import { sanitizeUrl } from '@braintree/sanitize-url';
import { readFileSync } from './util/fs'

const debug = Debug('api')
let MAX_RETRY_LIMIT
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

    const options = {
      headers: Contentstack.headers,
      hostname: Contentstack.host,
      method: Contentstack.verbs.get,
      path: sanitizeUrl(encodeURI(req.path)),
      port: Contentstack.port,
      protocol: Contentstack.protocol,
      timeout: 30000, // 30 second timeout to prevent socket hang ups
    }

    try {
      debug(`${options.method.toUpperCase()}: ${options.path}`)
      let timeDelay
      let body = ''
      const httpRequest = request(options, (response) => {

          response
            .setEncoding('utf-8')
            .on('data', (chunk) => body += chunk)
            .on('end', () => {
              debug(`status: ${response.statusCode}.`)
              if (response.statusCode >= 200 && response.statusCode <= 399) {
                return resolve(JSON.parse(body))
              } else if (response.statusCode === 429) {
                timeDelay = Math.pow(Math.SQRT2, RETRY) * 200
                debug(`API rate limit exceeded. Retrying ${options.path} with ${timeDelay} sec delay`)

                return setTimeout(() => {
                  return get(req, RETRY)
                    .then(resolve)
                    .catch(reject)
                }, timeDelay)
              } else if (response.statusCode >= 500) {
                // retry, with delay
                timeDelay = Math.pow(Math.SQRT2, RETRY) * 200
                debug(`Retrying ${options.path} with ${timeDelay} sec delay`)
                RETRY++

                return setTimeout(() => {
                  return get(req, RETRY)
                    .then(resolve)
                    .catch(reject)
                }, timeDelay)
              } else {
                debug(`Request failed\n${JSON.stringify(options)}`)

                return reject(body)
              }
            })
        })

      // Set socket timeout to handle socket hang ups
      httpRequest.setTimeout(30000, () => {
        debug(`Request timeout for ${options.path}`)
        httpRequest.destroy()
        reject(new Error('Request timeout'))
      })

      // Enhanced error handling for socket hang ups and connection resets
      httpRequest.on('error', (error: any) => {
        debug(`Request error for ${options.path}: ${error.message} (${error.code || 'NO_CODE'})`)
        
        // Handle socket hang up and connection reset errors with retry
        if ((error.code === 'ECONNRESET' || error.message?.includes('socket hang up')) && RETRY <= MAX_RETRY_LIMIT) {
          timeDelay = Math.pow(Math.SQRT2, RETRY) * 200
          debug(`Socket hang up detected. Retrying ${options.path} with ${timeDelay} ms delay (attempt ${RETRY}/${MAX_RETRY_LIMIT})`)
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
