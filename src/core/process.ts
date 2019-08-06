/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

/**
 * @note 'SIGKILL' cannot have a listener installed, it will unconditionally terminate Node.js on all platforms.
 * @note 'SIGSTOP' cannot have a listener installed.
 */

import { getConfig } from '../index'
import { logger } from '../util/logger'
import { lock, unlock } from './index'

/**
 * @description Handles process exit. Stops the current application and manages a graceful shutdown
 * @param {String} signal - Process signal
 */
const handleExit = (signal) => {
  lock()
  const { syncManager } = getConfig()
  const killDuration = (process.env.KILLDURATION) ? calculateKillDuration() : syncManager.processTimeout
  logger.info(`Received ${signal}. This will shut down the process in ${killDuration}ms..`)
  setTimeout(abort, killDuration)
}

/**
 * https://www.joyent.com/node-js/production/design/errors
 * https://stackoverflow.com/questions/7310521/node-js-best-practice-exception-handling/23368579
 *
 * @description Manage unhandled errors
 * @param {Object} error - Unhandled error object
 */
const unhandledErrors = (error) => {
  logger.error('Unhandled exception caught. Locking down process for 10s to recover..')
  logger.error(error)
  lock()
  setTimeout(() => {
    unlock()
  }, 10000)
}

/**
 * @description Validates 'process.env.KILLDURATION' time passed
 */
const calculateKillDuration = () => {
  const killDuration = parseInt(process.env.KILLDURATION, 10)
  if (isNaN(killDuration)) {
    const { syncManager } = getConfig()

    return syncManager.processTimeout
  }

  return killDuration
}

/**
 * @description Aborts the current application
 */
const abort = () => {
  process.abort()
}

export const configure = () => {
  process.on('SIGTERM', handleExit)
  process.on('SIGINT', handleExit)
  process.on('uncaughtException', unhandledErrors)
  process.on('unhandledRejection', unhandledErrors)
}
