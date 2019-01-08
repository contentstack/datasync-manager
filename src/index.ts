/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { merge } from 'lodash'
import { init } from './core'
import { poke } from './core/sync'
import { config as internalConfig } from './defaults'
import { buildConfigPaths } from './util/build-paths'

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
 * Set the application's config
 * @param {Object} config - Application config
 */
export const setConfig = (config) => {
  validateConfig(config)
  debug('Config set successfully!')
  appConfig = config
}

/**
 * Returns the application's configuration
 * @returns {Object} - Application config
 */
export const getConfig = () => {
  return appConfig
}

/**
 * Starts the sync manager utility
 * @param {Object} config - Optional application config.
 */
export const start = (config = {}) => {
  return new Promise((resolve, reject) => {
    try {
      validateInstances(assetConnector, contentConnector, listener)
      appConfig = merge(internalConfig, appConfig, config)
      validateConfig(appConfig)
      appConfig.paths = buildConfigPaths()
      debug('App validations passed.')

      return assetConnector.start(appConfig).then((assetInstance) => {
        debug(`Asset connector instance ${JSON.stringify(assetInstance)} returned successfully!`)
        validateAssetConnector(assetInstance)

        return contentConnector.start(appConfig, assetInstance)
      }).then((connectorInstance) => {
        debug(`Content connector instance ${JSON.stringify(connectorInstance)} returned successfully!`)
        validateContentConnector(connectorInstance)

        return init(connectorInstance, appConfig)
      }).then(() => {
        debug('Sync Manager initiated successfully!')
        listener.register(poke)

        return listener.start(appConfig)
      }).then(() => {
        return resolve({status: 'App started successfully!'})
      }).catch(reject)
    } catch (error) {
      return reject(error)
    }
  })
}
