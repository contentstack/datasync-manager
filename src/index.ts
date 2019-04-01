/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { merge } from 'lodash'
import { init, poke } from './core'
import { checkNetConnectivity } from './core/inet'
import { configure } from './core/process'
import { notifications } from './core/q'
import { config as internalConfig } from './defaults'
import { buildConfigPaths } from './util/build-paths'
import { formatSyncFilters } from './util/core-utilities'
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
let contentStore
let assetStore
let listener

/**
 * @summary Asset store instance interface
 */
interface IAssetConnector {
  download(): any,
  unpublish(): any,
  delete(): any,
}

/**
 * @summary Content store instance interface
 */
interface IContentConnector {
  publish(): any,
  unpublish(): any,
  delete(): any,
}

/**
 * @summary Connector interface
 */
interface IConnector {
  start(): Promise<IAssetConnector | IContentConnector>,
  setLogger(): ILogger
}

/**
 * @summary Application config interface
 */
interface IConfig {
  locales?: any[],
  paths?: any,
  contentstack?: any,
  contentStore?: any,
  syncManager?: any,
  assetStore?: any,
}

/**
 * @summary Logger instance interface
 */
interface ILogger {
  warn(): any,
  info(): any,
  log(): any,
  error(): any,
}

/**
 * @summary Register content store
 * @param {Object} instance - Content store instance
 */
export const setContentStore = (instance: IConnector) => {
  contentStore = instance
}

/**
 * @summary Register asset store
 * @param {Object} instance - Asset store instance
 */
export const setAssetStore = (instance: IConnector) => {
  assetStore = instance
}

/**
 * @summary Register listener
 * @param {Object} instance - Listener instance
 */
export const setListener = (instance: ILogger) => {
  validateListener(instance)
  listener = instance
}

/**
 * @summary Set the application's config
 * @param {Object} config - Application config
 */
export const setConfig = (config: IConfig) => {
  appConfig = config
}

/**
 * @summary Returns the application's configuration
 * @returns {Object} - Application config
 */
export const getConfig = (): IConfig => {
  return appConfig
}

/**
 * @summary Set custom logger for logging
 * @param {Object} instance - Custom logger instance
 */
export { setLogger } from './util/logger'

/**
 * @summary Event emitter object, that allows client notifications on event raised by sync-manager queue
 * @returns an event-emitter object, events raised: publish, unpublish, delete, error
 */
export { notifications }

/**
 * @summary
 *  Starts the sync manager utility
 * @description
 *  Registers, validates asset, content stores and listener instances.
 *  Once done, builds the app's config and logger
 * @param {Object} config - Optional application config.
 */
export const start = (config: IConfig = {}): Promise<{}> => {
  return new Promise((resolve, reject) => {
    try {
      validateInstances(assetStore, contentStore, listener)
      appConfig = merge({}, internalConfig, appConfig, config)
      validateConfig(appConfig)
      appConfig.paths = buildConfigPaths()
      // since logger is singleton, if previously set, it'll return that isnstance!
      setLogger()
      configure()

      return assetStore.start(appConfig).then((assetInstance: IAssetConnector) => {
        debug('Asset store instance has returned successfully!')
        validateAssetConnector(assetInstance)

        return contentStore.start(assetInstance, appConfig)
      }).then((storeInstance) => {
        debug('Content store instance has returned successfully!')
        validateContentConnector(storeInstance)
        appConfig = formatSyncFilters(appConfig)

        return init(storeInstance)
      }).then(() => {
        debug('Sync Manager initiated successfully!')
        listener.register(poke)
        // start checking for inet 10 secs after the app has started
        setTimeout(checkNetConnectivity, 10 * 1000)

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
