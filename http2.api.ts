/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { connect, constants } from 'http2'
import { stringify } from 'querystring'

const {
  // HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS
} = constants

const debug = Debug('api:get-requests')
let MAX_RETRY_LIMIT = 5
let Contentstack

/**
 * @description Initialize sync utilities API requests
 * @param {Object} contentstack - Contentstack configuration details
 */
export const init = (contentstack) => {
  Contentstack = contentstack
  // Contentstack.headers = {
  //   'X-User-Agent': 'contentstack-sync-manager',
  //   'access_token': Contentstack.token,
  //   'api_key': Contentstack.apiKey,
  // }
  if (Contentstack.MAX_RETRY_LIMIT) {
    MAX_RETRY_LIMIT = Contentstack.MAX_RETRY_LIMIT
  }
  // rebuild sync API
  Contentstack.syncAPI = `${Contentstack.cdn}${Contentstack.restAPIS.sync}`
}

/**
 * @description Make API requests to Contentstack
 * @param {Object} req - API request object
 * @param {Number} RETRY - API request retry counter
 */
export const get = (reqObject, RETRY = 1) => {
  return new Promise((resolve, reject) => {
    if (RETRY > MAX_RETRY_LIMIT) {
      return reject(new Error('Max retry limit exceeded!'))
    }
    if (typeof reqObject.uri === 'undefined' && typeof reqObject.url === 'undefined') {
      reqObject.uri = Contentstack.syncAPI
    }
    if (typeof reqObject.host === 'undefined') {
      reqObject.host = Contentstack.cdn
    }
    reqObject.method = Contentstack.methods.get
    reqObject.json = true
    let client = connect(reqObject.host)
    let requestPath = reqObject.path
    if (reqObject.qs) {
      requestPath += `?${stringify(reqObject.qs)}`
    }
    let data = ''
    let timeDelay
    let status
    const request = client.request({':path': requestPath, api_key: Contentstack.api_key, access_token: Contentstack.access_token})
    request
      .on('response', (headers, flags) => {
        status = headers[HTTP2_HEADER_STATUS]
        console.log(flags)
        for (const name in headers) {
          console.log(`${name}: ${headers[name]}`)
        }
      })
      .setEncoding('utf8')
      .on('data', (chunk) => { data += chunk })
      .on('end', () => {
        console.log('status ->', status)
        // client.close()
        if (status >= 200 && status <= 399) {

          return resolve(JSON.parse(data))
        } else if (status === 429) {
          timeDelay = Math.pow(Math.SQRT2, RETRY) * 200
          debug(`API rate limit exceeded. Retrying ${reqObject.uri || reqObject.url} with ${timeDelay} sec delay`)

          return setTimeout(() => {
            return get(reqObject, RETRY).then(resolve).catch(reject)
          }, timeDelay)
        } else if (status >= 500) {
          // retry, with delay
          timeDelay = Math.pow(Math.SQRT2, RETRY) * 200
          debug(`Retrying ${reqObject.uri || reqObject.url} with ${timeDelay} sec delay`)
          RETRY++

          return setTimeout(() => {
            return get(reqObject, RETRY).then(resolve).catch(reject)
          }, timeDelay)
        } else {
          debug(`Request failed\n${JSON.stringify(reqObject)}`)
          debug(`Response received\n${data}`)

          return reject(JSON.parse(data))
        }
      })
      .end()
    client.on('error', (error) => {
      return reject(error)
    })
  })
}
