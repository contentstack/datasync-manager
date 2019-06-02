/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { EventEmitter } from 'events'
import { cloneDeep } from 'lodash'
import { lock, unlock } from '.'
import { logger } from '../util/logger'
import { series } from '../util/series'
import { saveFailedItems } from '../util/unprocessible'
import { load } from './plugins'
import { saveToken } from './token-management'

const debug = Debug('q')
const notifications = new EventEmitter()

let instance = null

/**
 * @summary Manages sync utilitiy's item queue
 * @description
 *  Handles/processes 'sync' items one at a time, firing 'before' and 'after' hooks
 */
export class Q extends EventEmitter {
  private config: any
  private iLock: boolean
  private inProgress: boolean
  private pluginInstances: any
  private contentStore: any
  private q: any

  /**
   * 'Q's constructor
   * @param {Object} connector - Content connector instance
   * @param {Object} config - Application config
   * @returns {Object} Returns 'Q's instance
   */
  constructor(contentStore, assetStore, config) {
    if (!instance && contentStore && assetStore && config) {
      super()
      this.pluginInstances = load(config)
      this.contentStore = contentStore
      this.config = config.syncManager
      this.iLock = false
      this.inProgress = false
      this.q = []
      this.on('next', this.next)
      this.on('error', this.errorHandler)
      this.on('push', this.push)
      this.on('unshift', this.unshift)
      instance = this
      debug('Core \'Q\' constructor initiated')
    }

    return instance
  }

  public unshift(data) {
    this.q.unshift(data)
    if (this.q.length > this.config.queue.pause_threshold) {
      this.iLock = true
      lock()
    }
    debug(`Content type '${data.content_type_uid}' received for '${data.action}'`)
    this.emit('next')
  }

  /**
   * @description Enter item into 'Q's queue
   * @param {Object} data - Formatted item from 'sync api's response
   */
  public push(data) {
    this.q.push(data)
    if (this.q.length > this.config.queue.pause_threshold) {
      this.iLock = true
      lock()
    }
    debug(`Content type '${data.content_type_uid}' received for '${data.action}'`)
    this.emit('next')
  }

  /**
   * @description Handles errors in 'Q'
   * @param {Object} obj - Errorred item
   */
  public errorHandler(obj) {
    notify('error', obj)
    logger.error(obj)
    debug(`Error handler called with ${JSON.stringify(obj)}`)
    if (obj.data.checkpoint) {
      return saveToken(obj.data.checkpoint.name, obj.data.checkpoint.token).then(() => {
        return saveFailedItems(obj).then(() => {
          this.inProgress = false
          this.emit('next')
        })
      }).catch((error) => {
        logger.error('Errorred while saving token')
        logger.error(error)
        this.inProgress = false
        this.emit('next')
      })
    }

    return saveFailedItems(obj).then(() => {
      this.inProgress = false
      this.emit('next')
    }).catch((error) => {
      logger.error('Errorred while saving failed items')
      logger.error(error)
      this.inProgress = false
      this.emit('next')
    })
  }

  /**
   * @description Calls next item in the queue
   */
  private next() {
    if (this.iLock && this.q.length < this.config.queue.resume_threshold) {
      unlock(true)
      this.iLock = false
    }
    debug(`Calling 'next'. In progress status is ${this.inProgress}, and Q length is ${this.q.length}`)
    if (!this.inProgress && this.q.length) {
      this.inProgress = true
      const item = this.q.shift()
      if (item.checkpoint) {
        saveToken(item.checkpoint.name, item.checkpoint.token).then(() => {
          this.process(item)
        }).catch((error) => {
          logger.error('Save token failed to save a checkpoint!')
          logger.error(error)
          this.process(item)
        })
      } else {
        this.process(item)
      }
    }
  }

  public peek() {
    return this.q
  }

  /**
   * @description Passes and calls the appropriate methods and hooks for item execution
   * @param {Object} data - Current processing item
   */
  private process(data) {
    logger.log(
      `${data.action.toUpperCase()}ING: { content_type: '${data.content_type_uid}', ${(data.locale) ? `locale: '${data.locale}',`: ''} uid: '${data.uid}'}`)

    notify(data.action, data)
    switch (data.action) {
    case 'publish':
      this.exec(data, data.action)
      break
    case 'unpublish':
      this.exec(data, data.action)
      break
    default:
      this.exec(data, data.action)
      break
    }
  }

  /**
   * @description Execute and manager current processing item. Calling 'before' and 'after' hooks appropriately
   * @param {Object} data - Current processing item
   * @param {String} action - Action to be performed on the item (publish | unpublish | delete)
   * @param {String} beforeAction - Name of the hook to execute before the action is performed
   * @param {String} afterAction - Name of the hook to execute after the action has been performed
   * @returns {Promise} Returns promise
   */
  private exec(data, action) {
    try {
      debug(`Exec: ${action}`)
      const beforeSyncInternalPlugins = []
      let transformedItem

      this.pluginInstances.internal.beforeSync.forEach((method) => {
        beforeSyncInternalPlugins.push(() => { return method(data, action) })
      })

      series(beforeSyncInternalPlugins)
        .then(() => {
          if (this.config.pluginTransformations) {
            transformedItem = data
          } else {
            transformedItem = cloneDeep(data)
          }

          // re-initializing everytime with const.. avoids memory leaks
          const beforeSyncPlugins = []

          if (this.config.serializePlugins) {
            this.pluginInstances.external.beforeSync.forEach((method) => {
              beforeSyncPlugins.push(() => { return method(transformedItem, action) })
            })

            return series(beforeSyncPlugins)
          } else {
            this.pluginInstances.external.beforeSync.forEach((method) => {
              beforeSyncPlugins.push(method(transformedItem, action))
            })

            return Promise.all(beforeSyncPlugins)
          }
        })
        .then(() => {
          debug('Before action plugins executed successfully!')

          return this.contentStore[action](data)
        })
        .then(() => {
          debug('Connector instance called successfully!')
          // re-initializing everytime with const.. avoids memory leaks
          const afterSyncPlugins = []

          if (this.config.serializePlugins) {
            this.pluginInstances.external.afterSync.forEach((method) => {
              afterSyncPlugins.push(() => { return method(transformedItem, action) })
            })

            return series(afterSyncPlugins)
          } else {
            this.pluginInstances.external.afterSync.forEach((method) => {
              afterSyncPlugins.push(method(transformedItem, action))
            })

            return Promise.all(afterSyncPlugins)
          }
        })
        .then(() => {
          debug('After action plugins executed successfully!')
          logger.log(
            `${action.toUpperCase()}ING: { content_type: '${data.content_type_uid}', ${(data.locale) ? `locale: '${data.locale}',`: ''} uid: '${data.uid}'}`)
          this.inProgress = false
          this.emit('next', data)
        })
        .catch((error) => {
          this.emit('error', {
            data,
            error,
          })
        })
    } catch (error) {
      this.emit('error', {
        data,
        error,
      })
    }
  }
}

const notify = (event, obj) => {
  notifications.emit(event, obj)
}

export { notifications }