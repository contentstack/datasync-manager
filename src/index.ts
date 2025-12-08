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
import { MESSAGES } from './util/messages'

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
        debug(MESSAGES.INDEX.ASSET_STORE_INIT)
        validateAssetStoreInstance(assetInstance)
        assetStoreInstance = assetInstance

        return contentStore.start(assetInstance, appConfig)
      }).then((contentStoreInstance) => {
        debug(MESSAGES.INDEX.CONTENT_STORE_INIT)
        validateContentStoreInstance(contentStoreInstance)
        appConfig = formatSyncFilters(appConfig)

        return init(contentStoreInstance, assetStoreInstance)
      }).then(() => {
        debug(MESSAGES.INDEX.SYNC_MANAGER_INIT)
        listener.register(poke)
        // start checking for inet 10 secs after the app has started
        pinger()

        return listener.start(appConfig)
      }).then((webhookServer) => {
        // Set up webhook listener monitoring and fallback mechanism
        setupWebhookMonitoring(webhookServer)
        
        logger.info(MESSAGES.INDEX.SYNC_UTILITY_STARTED)

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
    debug(MESSAGES.INDEX.NOTIFICATION(action, item))
  }
}

notifications
.on('publish', debugNotifications('publish'))
.on('unpublish', debugNotifications('unpublish'))
.on('delete', debugNotifications('delete'))
.on('error', debugNotifications('error'))

/**
 * Set up webhook listener monitoring and fallback polling mechanism
 * @param {object} webhookServer The webhook server instance
 */
function setupWebhookMonitoring(webhookServer) {
  const FALLBACK_POLL_INTERVAL = 60000 // 1 minute fallback polling
  let fallbackTimer: NodeJS.Timeout | null = null
  let webhookHealthy = true
  
  debug('Webhook monitoring initialized. Server:', !!webhookServer, 'Healthy:', webhookHealthy)
  
  
  // Start fallback polling when webhook is unhealthy
  const startFallbackPolling = () => {
    if (fallbackTimer) return // Already running
    
    logger.info(`Starting fallback polling every ${FALLBACK_POLL_INTERVAL}ms`)
    fallbackTimer = setInterval(() => {
      debug('Fallback polling: triggering sync check')
      try {
        poke().catch((error) => {
          debug('Fallback polling error:', error)
        })
      } catch (error) {
        debug('Fallback polling exception:', error)
      }
    }, FALLBACK_POLL_INTERVAL)
  }
  
  // Stop fallback polling when webhook is healthy
  const stopFallbackPolling = () => {
    if (fallbackTimer) {
      clearInterval(fallbackTimer)
      fallbackTimer = null
      logger.info('Fallback polling stopped')
    }
  }
  
  // Webhook activity is tracked via events, no need to wrap poke function
  
  
  // Handle process cleanup
  const cleanup = () => {
    if (fallbackTimer) {
      clearInterval(fallbackTimer)
      fallbackTimer = null
    }
  }
  
  process.on('SIGINT', cleanup)
  process.on('SIGTERM', cleanup)
  process.on('exit', cleanup)
  
  // Handle webhook server events if available
  if (listener.getEventEmitter) {
    const webhookEmitter = listener.getEventEmitter()
    
    webhookEmitter.on('server-error', (error) => {
      logger.warn('Webhook server error detected:', error.message)
      webhookHealthy = false
      startFallbackPolling()
    })
    
    webhookEmitter.on('reconnect-success', () => {
      logger.info('Webhook server reconnected successfully')
      webhookHealthy = true
      stopFallbackPolling()
    })
  }
}
