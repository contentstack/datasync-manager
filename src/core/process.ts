/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

import { lock as lockSync } from './sync'

// 'SIGKILL' cannot have a listener installed, it will unconditionally terminate Node.js on all platforms.
// 'SIGSTOP' cannot have a listener installed.

const handleExit = (/* signal */) => {
  lockSync()
  // console.info(`Received ${signal}. This will shut down the process in 15 seconds..`)
  const killDuration = (process.env.KILLDURATION) ? softKill() : 15000
  setInterval(abort, killDuration)
}

const softKill = () => {
  const killDuration = parseInt(process.env.KILLDURATION, 10)
  if (isNaN(killDuration)) {
    return 15000
  }

  return killDuration
}

const abort = () => {
  process.abort()
}

process.on('SIGTERM', handleExit)
process.on('SIGINT', handleExit)
