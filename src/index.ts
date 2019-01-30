/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { merge } from 'lodash'
import { init, poke } from './core'
import { configure } from './core/process'
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
 * @summary Asset connector instance interface
 */
interface IAssetConnector {
  download(): any,
  unpublish(): any,
  delete(): any,
}

/**
 * @summary Content connector instance interface
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
  'content-connector'?: any,
  'sync-manager'?: any,
  'asset-connector'?: any,
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
 * @summary Register content connector
 * @param {Object} instance - Content connector instance
 */
export const setContentConnector = (instance: IConnector) => {
  contentConnector = instance
}

/**
 * @summary Register asset connector
 * @param {Object} instance - Asset connector instance
 */
export const setAssetConnector = (instance: IConnector) => {
  assetConnector = instance
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
 * @summary
 *  Starts the sync manager utility
 * @description
 *  Registers, validates asset, content connectors and listener instances.
 *  Once done, builds the app's config and logger
 * @param {Object} config - Optional application config.
 */
export const start = (config: IConfig = {}): Promise<{}> => {
  return new Promise((resolve, reject) => {
    try {
      validateInstances(assetConnector, contentConnector, listener)
      appConfig = merge({}, internalConfig, appConfig, config)
      validateConfig(appConfig)
      appConfig.paths = buildConfigPaths()
      // since logger is singleton, if previously set, it'll return that isnstance!
      setLogger()
      configure()
      if (assetConnector.setLogger && typeof assetConnector.setLogger === 'function') {
        assetConnector.setLogger(logger)
      }
      if (contentConnector.setLogger && typeof contentConnector.setLogger === 'function') {
        contentConnector.setLogger(logger)
      }

      return assetConnector.start(appConfig).then((assetInstance: IAssetConnector) => {
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
