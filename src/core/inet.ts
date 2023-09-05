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
  debug(`inet initiated - waiting ${currentTimeout} before checking connectivity.`)
  // start checking for net connectivity, 30 seconds after the app has started
  setTimeout(checkNetConnectivity, currentTimeout)
}

export const checkNetConnectivity = () => {
  const socket = dnsSocket({
    retries: sm.inet.retries,
    timeout: sm.inet.timeout,
  })
  debug('checking network connectivity')
  socket.query(query, port, dns, (err) => {
    if (err) {
      debug(`errorred.. ${err}`)
      disconnected = true

      return socket.destroy(() => {
        debug('socket destroyed')
        emitter.emit('disconnected', currentTimeout += sm.inet.retryIncrement)
      })
    } else if (disconnected) {
      poke()
    }
    disconnected = false

    return socket.destroy(() => {
      debug('socket destroyed')
      emitter.emit('ok')
    })
  })
}

export const netConnectivityIssues = (error) => {
  if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
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
