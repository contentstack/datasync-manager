/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

import { logger } from '../util/logger'
import { lock as lockSync } from './sync'

// 'SIGKILL' cannot have a listener installed, it will unconditionally terminate Node.js on all platforms.
// 'SIGSTOP' cannot have a listener installed.

/**
 * @description Handles process exit. Stops the current application and manages a graceful shutdown
 * @param {String} signal - Process signal
 */
const handleExit = (signal) => {
  lockSync()
  const killDuration = (process.env.KILLDURATION) ? softKill() : 15000
  logger.info(`Received ${signal}. This will shut down the process in ${killDuration}ms..`)
  setInterval(abort, killDuration)
}

/**
 * @description Validates 'process.env.KILLDURATION' time passed
 */
const softKill = () => {
  const killDuration = parseInt(process.env.KILLDURATION, 10)
  if (isNaN(killDuration)) {
    return 15000
  }

  return killDuration
}

/**
 * Aborts the current application
 */
const abort = () => {
  process.abort()
}

process.on('SIGTERM', handleExit)
process.on('SIGINT', handleExit)
