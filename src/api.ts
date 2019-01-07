/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import Request from 'request'

import { stringify } from './util/stringify'

const debug = Debug('api:get-requests')

let MAX_RETRY_LIMIT = 5
let Contentstack

export const init = (contentstack) => {
  Contentstack = contentstack
  Contentstack.headers = {
    'X-User-Agent': 'contentstack-sync-manager',
    'access_token': Contentstack.token,
    'api_key': Contentstack.apiKey,
  }
  if (Contentstack.MAX_RETRY_LIMIT) {
    MAX_RETRY_LIMIT = Contentstack.MAX_RETRY_LIMIT
  }
  // rebuild sync API
  Contentstack.syncAPI = `${Contentstack.cdn}${Contentstack.restAPIS.sync}`
}

const validate = (req) => {
  if (typeof req !== 'object') {
    const error: any = new Error(`Invalid params passed for request\n${stringify(req)}`)
    error.code = 'VE'
    throw error
  }
}

const normalize = (req) => {
  if (typeof req.uri === 'undefined' && typeof req.url === 'undefined') {
    req.uri = Contentstack.syncAPI
  }
  if (typeof req.headers === 'undefined') {
    debug(`${req.uri || req.url} had no headers`)
    req.headers = Contentstack.headers
  }
}

export const get = (req, RETRY = 1) => {
  return new Promise((resolve, reject) => {
    if (RETRY > MAX_RETRY_LIMIT) {
      return reject(new Error('Max retry limit exceeded!'))
    }
    req.method = Contentstack.methods.get
    req.json = true
    validate(req)
    normalize(req)
    try {
      debug(`${req.method.toUpperCase()}: ${req.uri || req.url}`)
      let timeDelay

      return Request(req, (error, response, body) => {
        if (error) {
          console.error(error)

          return reject(error)
        }
        debug(`API response received. \nStatus code: ${response.statusCode}.`)
        if (response.statusCode >= 200 && response.statusCode <= 399) {

          return resolve(body)
        } else if (response.statusCode === 429) {
          timeDelay = Math.pow(Math.SQRT2, RETRY) * 200
          debug(`API rate limit exceeded. Retrying ${req.uri || req.url} with ${timeDelay} sec delay`)

          return setTimeout(() => {
            return get(req, RETRY).then(resolve).catch(reject)
          }, timeDelay)
        } else if (response.statusCode >= 500) {
          // retry, with delay
          timeDelay = Math.pow(Math.SQRT2, RETRY) * 200
          debug(`Retrying ${req.uri || req.url} with ${timeDelay} sec delay`)
          RETRY++

          return setTimeout(() => {
            return get(req, RETRY).then(resolve).catch(reject)
          }, timeDelay)
        } else {
          debug(`Request failed\n${stringify(req)}`)
          debug(`Response received\n${stringify(body)}`)

          return reject(body)
        }
      })
    } catch (error) {
      return reject(error)
    }
  })
}
