/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { merge } from 'lodash'
import { init, poke } from './core'
import { config as internalConfig } from './defaults'
import { buildConfigPaths } from './util/build-paths'
import { logger, setLogger } from './util/logger'

import {
  validateAssetConnector,
  validateConfig,
  validateContentConnector,
  validateInstances,
  validateListener,
} from './util/validations'

const debug = Debug('registration')

let appConfig: any = {}
let contentConnector
let assetConnector
let listener

/**
 * @description Register content connector
 * @param {Object} instance - Content connector instance
 */
export const setContentConnector = (instance) => {
  debug('Content connector instance registered successfully')
  contentConnector = instance
}

/**
 * @description Register asset connector
 * @param {Object} instance - Asset connector instance
 */
export const setAssetConnector = (instance) => {
  debug('Asset connector instance registered successfully')
  assetConnector = instance
}

/**
 * @description Register listener
 * @param {Object} instance - Listener instance
 */
export const setListener = (instance) => {
  validateListener(instance)
  debug('Listener instance registered successfully')
  listener = instance
}

/**
 * @description Set the application's config
 * @param {Object} config - Application config
 */
export const setConfig = (config) => {
  validateConfig(config)
  debug('Config set successfully!')
  appConfig = config
}

/**
 * @description Returns the application's configuration
 * @returns {Object} - Application config
 */
export const getConfig = () => {
  return appConfig
}

/**
 * @description Set custom logger for logging
 * @param {Object} instance - Custom logger instance
 */
export { setLogger } from './util/logger'

/**
 * @summary
 *  Starts the sync manager utility
 * @description
 *  Registers, validates asset, content connectors and listener instances.
 *  Once done, builds the app's config and logger
 * @param {Object} config - Optional application config.
 */
export const start = (config = {}) => {
  return new Promise((resolve, reject) => {
    try {
      validateInstances(assetConnector, contentConnector, listener)
      appConfig = merge({}, internalConfig, appConfig, config)
      validateConfig(appConfig)
      appConfig.paths = buildConfigPaths()
      // since logger is singleton, if previously set, it'll return that isnstance!
      setLogger()
      assetConnector.setLogger(logger)
      contentConnector.setLogger(logger)

      return assetConnector.start(appConfig).then((assetInstance) => {
        debug('Asset connector instance has returned successfully!')
        validateAssetConnector(assetInstance)

        return contentConnector.start(assetInstance, appConfig)
      }).then((connectorInstance) => {
        debug('Content connector instance has returned successfully!')
        validateContentConnector(connectorInstance)

        return init(connectorInstance)
      }).then(() => {
        debug('Sync Manager initiated successfully!')
        listener.register(poke)

        return listener.start(appConfig)
      }).then(() => {
        logger.info('Contentstack sync utility started successfully!')

        return resolve()
      }).catch(reject)
    } catch (error) {
      return reject(error)
    }
  })
}
