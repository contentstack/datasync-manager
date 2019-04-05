/*!
 * Contentstack DataSync Manager
 * Copyright (c) 2019 Contentstack LLC
 * MIT Licensed
 */

import Debug from 'debug'
import dnsSocket from 'dns-socket'
import { EventEmitter } from 'events'
import { getConfig } from '../index'
import { lock, unlock } from './index'
import { logger } from '../util/logger'

const emitter = new EventEmitter()
const debug = Debug('inet')
let iLock = false
let sm, query, port, dns, currentTimeout

export const init = () => {
  sm = getConfig().syncManager
  query = {
    questions: [
      {
        type: sm.inet.type,
        name: sm.inet.host
      }
    ]
  }
  port = sm.inet.port
  dns = sm.inet.dns
  currentTimeout = sm.inet.retryTimeout
  debug(`inet initiated - waiting ${currentTimeout} before checking connectivity.`)
  // start checking for net connectivity, 30 seconds after the app has started
  setTimeout(checkNetConnectivity, currentTimeout)
}

export const checkNetConnectivity = () => {
  const socket = dnsSocket({
    retries: sm.inet.retries,
    timeout: sm.inet.timeout
  })
  debug('checking network connectivity')
  return socket.query(query, port, dns, (err) => {
    if (err) {
      debug(`errorred.. ${err}`)
      lock()
      iLock = true
      return socket.destroy(() => {
        debug('socket destroyed')
        emitter.emit('disconnected', currentTimeout += sm.inet.retryIncrement)

        return
      })
    } else if (iLock) {
      unlock(true)
      iLock = false
    }
    
    return socket.destroy(() => {
      debug('socket destroyed')
      emitter.emit('ok')

      return
    })
  })
}

export const netConnectivityIssues = (error) => {
  if (error.code === 'ENOTFOUND') {
    return true
  } else if (error.code === 'ETIMEDOUT') {
    return true
  }

  return false
}

emitter.on('ok', () => {
  currentTimeout = sm.inet.retryTimeout
  debug(`pinging ${sm.inet.host} in ${sm.inet.timeout} ms`)
  setTimeout(checkNetConnectivity, sm.inet.timeout)
})

emitter.on('disconnected', (timeout) => {
  logger.warn('Network disconnected')
  debug(`pinging ${sm.inet.host} in ${timeout} ms`)
  setTimeout(checkNetConnectivity, timeout)
})