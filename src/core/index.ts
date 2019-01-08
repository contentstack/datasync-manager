/*!
 * Contentstack Sync Manager
 * Copyright © 2019 Contentstack LLC
 * MIT Licensed
 */

import { init as initAPI } from '../api'
import { Q } from './q'
import { start } from './sync'

/**
 * Core's primary. This is where it starts..
 * @param {Object} connector - Content connector instance
 * @param {Object} config - Application config
 */
export const init = (connector, config) => {
  return new Promise((resolve, reject) => {
    const QInstance = new Q(connector, config)
    initAPI(config.contentstack)

    return start(QInstance).then(resolve).catch(reject)
  })
}
