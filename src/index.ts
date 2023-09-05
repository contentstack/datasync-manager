/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { merge } from 'lodash'
import { config as internalConfig } from './config'
import { init, poke, pop as popQueue, push as pushQueue, unshift as unshiftQueue } from './core/index'
import { init as pinger } from './core/inet'
import { configure } from './core/process'
import { notifications } from './core/q'
import { buildConfigPaths } from './util/build-paths'
import { formatSyncFilters } from './util/index'
import { logger, setLogger } from './util/logger'

import {
  validateAssetStore,
  validateAssetStoreInstance,
  validateConfig,
  validateContentStore,
  validateContentStoreInstance,
  validateExternalInput,
  validateListener,
} from './util/validations'

const debug = Debug('sm:index')

let assetStoreInstance
let appConfig: any = {}
let contentStore
let assetStore
let listener

/**
 * @public
 * @interface Asset store interface
 * @summary Asset store instance interface
 */
interface IAssetStore {
  download<T>(input: T): Promise<{T}>,
  unpublish<T>(input: T): Promise<{T}>,
  delete<T>(input: T): Promise<{T}>,
}

/**
 * @public
 * @interface Content store interface
 * @summary Content store instance interface
 */
interface IContentStore {
  publish<T>(input: T): Promise<{T}>,
  unpublish<T>(input: T): Promise<{T}>,
  delete<T>(input: T): Promise<{T}>,
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
  debug(): any,
}

interface IInputData {
  _content_type_uid: string,
  uid: string,
  locale: string,
  action: string,
  [propName: string]: any
}

export const push = (data: IInputData) => {
  validateExternalInput(data)

  pushQueue(data)
}

export const unshift = (data: IInputData) => {
  validateExternalInput(data)

  unshiftQueue(data)
}

export const pop = () => {
  popQueue()
}

export const getAssetLocation = (asset) => {
  return new Promise(async (resolve, reject) => {
    try {
      const assetStoreConfig = assetStore.getConfig()
      const assetConfig = (assetStoreConfig.assetStore) ? assetStoreConfig.assetStore : assetStoreConfig
      const location = await assetStore.getAssetLocation(asset, assetConfig)

      return resolve(location)
    } catch (error) {
      return reject(error)
    }
  })
}

/**
 * @public
 * @method setContentStore
 * @summary Register content store
 * @param {object} instance Content store instance
 */
export const setContentStore = (instance: IContentStore) => {
  contentStore = instance
}

/**
 * @public
 * @method setAssetStore
 * @summary Register asset store
 * @param {object} instance Asset store instance
 */
export const setAssetStore = (instance: IAssetStore) => {
  assetStore = instance
}

/**
 * @public
 * @method setListener
 * @summary Register listener
 * @param {object} instance Listener instance
 */
export const setListener = (instance: ILogger) => {
  validateListener(instance)
  listener = instance
}

/**
 * @public
 * @method setConfig
 * @summary Sets the application's configuration
 * @param {object} config Application config
 */
export const setConfig = (config: IConfig) => {
  appConfig = config
}

/**
 * @public
 * @method getConfig
 * @summary Returns the application's configuration
 * @returns {object} Application config
 */
export const getConfig = (): IConfig => {
  return appConfig
}

/**
 * @public
 * @method setLogger
 * @summary Sets custom logger for logging data sync operations
 * @param {object} instance Custom logger instance
 */
export { setLogger } from './util/logger'

/**
 * @public
 * @member notifications
 * @summary Event emitter object, that allows client notifications on event raised by sync-manager queue
 * @returns {EventEmitter} An event-emitter object. Events raised - publish, unpublish, delete, error
 */
export { notifications }

/**
 * @public
 * @method start
 * @summary Starts the sync manager utility
 * @description
 * Registers, validates asset, content stores and listener instances.
 * Once done, builds the app's config and logger
 * @param {object} config Optional application config overrides
 * @returns {Promise} Returns a promise
 */
export const start = (config: IConfig = {}): Promise<{}> => {
  return new Promise((resolve, reject) => {
    try {
      validateAssetStore(assetStore)
      validateContentStore(contentStore)
      validateListener(listener)

      appConfig = merge({}, internalConfig, appConfig, config)
      validateConfig(appConfig)
      appConfig.paths = buildConfigPaths()
      // since logger is singleton, if previously set, it'll return that isnstance!
      setLogger()
      configure()

      return assetStore.start(appConfig).then((assetInstance: IAssetStore) => {
        debug('Asset store instance has returned successfully!')
        validateAssetStoreInstance(assetInstance)
        assetStoreInstance = assetInstance

        return contentStore.start(assetInstance, appConfig)
      }).then((contentStoreInstance) => {
        debug('Content store instance has returned successfully!')
        validateContentStoreInstance(contentStoreInstance)
        appConfig = formatSyncFilters(appConfig)

        return init(contentStoreInstance, assetStoreInstance)
      }).then(() => {
        debug('Sync Manager initiated successfully!')
        listener.register(poke)
        // start checking for inet 10 secs after the app has started
        pinger()

        return listener.start(appConfig)
      }).then(() => {
        logger.info('Contentstack sync utility started successfully!')

        return resolve('')
      }).catch(reject)
    } catch (error) {
      return reject(error)
    }
  })
}

/**
 * @public
 * @method debugNotifications
 * @param {object} item Item being processed
 * @returns {void}
 */
export const debugNotifications = (action) => {
  return (item) => {
    debug(`Notifications: ${action} - ${JSON.stringify(item)}`)
  }
}

notifications
.on('publish', debugNotifications('publish'))
.on('unpublish', debugNotifications('unpublish'))
.on('delete', debugNotifications('delete'))
.on('error', debugNotifications('error'))
