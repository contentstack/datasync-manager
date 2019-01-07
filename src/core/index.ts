/*!
 * Contentstack Sync Manager
 * Copyright © 2019 Contentstack LLC
 * MIT Licensed
 */

import { init as initAPI } from '../api'
import { Q } from './q'
import { start } from './sync'

// Call this method after building config
export const init = (connector, config) => {
  return new Promise((resolve, reject) => {
    const QInstance = new Q(connector, config)
    initAPI(config.contentstack)

    return start(QInstance).then(resolve).catch(reject)
  })
}
