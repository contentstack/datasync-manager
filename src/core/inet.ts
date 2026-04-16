/*!
 * Contentstack DataSync Manager
 * Copyright (c) 2019 Contentstack LLC
 * MIT Licensed
 */

import Debug from 'debug'
import dnsSocket from 'dns-socket'
import { EventEmitter } from 'events'
import { getConfig } from '../index'
import { logger } from '../util/logger'
import { MESSAGES } from '../util/messages'
import { poke } from './index'

interface ISyncManager {
  inet: {
    host: string,
    type: string,
    port: number,
    dns: string,
    retryTimeout: number,
    retries: number,
    timeout: number,
    retryIncrement: number,
  },
  [propName: string]: any,
}

const emitter = new EventEmitter()
const debug = Debug('inet')
let disconnected = false
let sm: ISyncManager
let query
let port: number
let dns: string
let currentTimeout: number

export const init = () => {
  sm = getConfig().syncManager
  query = {
    questions: [
      {
        name: sm.inet.host,
        type: sm.inet.type,
      },
    ],
  }
  port = sm.inet.port
  dns = sm.inet.dns
  currentTimeout = sm.inet.retryTimeout
  debug(MESSAGES.INET.INITIATED(currentTimeout))
  // start checking for net connectivity, 30 seconds after the app has started
  setTimeout(checkNetConnectivity, currentTimeout)
}

export const checkNetConnectivity = () => {
  const socket = dnsSocket({
    retries: sm.inet.retries,
    timeout: sm.inet.timeout,
  })
  debug(MESSAGES.INET.CHECKING)
  socket.query(query, port, dns, (err) => {
    if (err) {
      debug(MESSAGES.INET.CHECK_FAILED(err))
      disconnected = true

      return socket.destroy(() => {
        debug(MESSAGES.INET.CLEANUP_ERROR)
        emitter.emit('disconnected', currentTimeout += sm.inet.retryIncrement)
      })
    } else if (disconnected) {
      poke()
    }
    disconnected = false

    return socket.destroy(() => {
      debug(MESSAGES.INET.CLEANUP_SUCCESS)
      emitter.emit('ok')
    })
  })
}

export const netConnectivityIssues = (error) => {
  // Include socket hang up and connection reset errors as network connectivity issues
  const networkErrorCodes = ['ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', 'EPIPE', 'EHOSTUNREACH']
  
  if (networkErrorCodes.includes(error.code) || error.message?.includes('socket hang up')) {
    return true
  }

  return false
}

emitter.on('ok', () => {
  currentTimeout = sm.inet.retryTimeout
  debug(MESSAGES.INET.PINGING(sm.inet.host, sm.inet.timeout))
  setTimeout(checkNetConnectivity, sm.inet.timeout)
})

emitter.on('disconnected', (timeout) => {
  logger.warn(MESSAGES.INET.DISCONNECTED)
  debug(MESSAGES.INET.PINGING(sm.inet.host, timeout))
  setTimeout(checkNetConnectivity, timeout)
})
