/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { EventEmitter } from 'events'
import { cloneDeep } from 'lodash'
import { lock, unlock } from '.'
import { filterUnwantedKeys, getSchema } from '../util/index'
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
  private readonly syncManager: any
  private readonly pluginInstances: any
  private readonly contentStore: any
  private readonly q: any
  private iLock: boolean
  private inProgress: boolean

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
      this.syncManager = config.syncManager
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
    if (this.q.length > this.syncManager.queue.pause_threshold) {
      this.iLock = true
      lock()
    }
    debug(`Content type '${data._content_type_uid}' received for '${data._type}'`)
    this.emit('next')
  }

  /**
   * @description Enter item into 'Q's queue
   * @param {Object} data - Formatted item from 'sync api's response
   */
  public push(data) {
    this.q.push(data)
    if (this.q.length > this.syncManager.queue.pause_threshold) {
      this.iLock = true
      lock()
    }
    debug(`Content type '${data._content_type_uid}' received for '${data._type}'`)
    this.emit('next')
  }

  /**
   * @description Handles errors in 'Q'
   * @param {Object} obj - Errorred item
   */
  public async errorHandler(obj) {
    const that = this
    try {
      notify('error', obj)
      logger.error(obj)
      debug(`Error handler called with ${JSON.stringify(obj)}`)
      if (typeof obj.checkpoint !== 'undefined') {
        await saveToken(obj.checkpoint.name, obj.checkpoint.token)
      }
      await saveFailedItems(obj)
      this.inProgress = false
      this.emit('next')
    } catch (error) {
      // probably, the context could change
      logger.error('Something went wrong in errorHandler!')
      logger.error(error)
      that.inProgress = false
      that.emit('next')
    }
  }

  public peek() {
    return this.q
  }

  /**
   * @description Calls next item in the queue
   */
  private async next() {
    try {
      if (this.iLock && this.q.length < this.syncManager.queue.resume_threshold) {
        unlock(true)
        this.iLock = false
      }
      debug(`Calling 'next'. In progress status is ${this.inProgress}, and Q length is ${this.q.length}`)
      if (!this.inProgress && this.q.length) {
        this.inProgress = true
        const item = this.q.shift()
        this.process(item)
      } 
    } catch (error) {
      logger.error(error)
      this.inProgress = false
      this.emit('next')
    }
  }

  /**
   * @description Passes and calls the appropriate methods and hooks for item execution
   * @param {Object} data - Current processing item
   */
  private process(data) {
    notify(data._type, data)
    switch (data._type) {
    case 'publish':
      this.exec(data, data._type)
      break
    case 'unpublish':
      this.exec(data, data._type)
      break
    default:
      this.exec(data, data._type)
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
  private async exec(data, action) {
    let checkpoint: any
    try {
      const type = data._type.toUpperCase()
      const contentType = data._content_type_uid
      const locale = data.locale
      const uid = data.uid

      if (data.hasOwnProperty('_checkpoint')) {
        checkpoint = data._checkpoint
        delete data._checkpoint
      }
      debug(`Executing: ${JSON.stringify(data)}`)
      const beforeSyncInternalPlugins = []
      // re-initializing everytime with const.. avoids memory leaks
      const beforeSyncPlugins = []
      // re-initializing everytime with const.. avoids memory leaks
      const afterSyncPlugins = []
      let transformedData
      let transformedSchema

      let { schema } = getSchema(action, data)
      data = filterUnwantedKeys(action, data)
      if (typeof schema !== 'undefined') {
        schema = filterUnwantedKeys(action, schema)
      }

      logger.log(
        `${type}: { content_type: '${contentType}', ${
            (locale) ? `locale: '${locale}',` : ''
          } uid: '${uid}'} is in progress`,
        )

      this.pluginInstances.internal.beforeSync.forEach((method) => {
        beforeSyncInternalPlugins.push(() => method(action, data, schema))
      })

      await series(beforeSyncInternalPlugins)
      if (this.syncManager.pluginTransformations) {
        transformedData = data
        transformedSchema = schema
      } else {
        transformedData = cloneDeep(data)
        transformedSchema = cloneDeep(schema)
      }

      if (this.syncManager.serializePlugins) {
        this.pluginInstances.external.beforeSync.forEach((method) => {
          beforeSyncPlugins.push(() => method(action, transformedData, transformedSchema))
        })

        await series(beforeSyncPlugins)
      } else {
        this.pluginInstances.external.beforeSync.forEach((method) => {
          beforeSyncPlugins.push(method(action, transformedData, transformedSchema))
        })

        await Promise.all(beforeSyncPlugins)
      }
      debug('Before action plugins executed successfully!')
      await this.contentStore[action](data)

      debug(`Completed '${action}' on connector successfully!`)
      if (typeof schema !== 'undefined') {
        await this.contentStore.updateContentType(schema)
      }

      debug('Connector instance called successfully!')
      if (this.syncManager.serializePlugins) {
        this.pluginInstances.external.afterSync.forEach((method) => {
          afterSyncPlugins.push(() => method(action, transformedData, transformedSchema))
        })

        await series(afterSyncPlugins)
      } else {
        this.pluginInstances.external.afterSync.forEach((method) => {
          afterSyncPlugins.push(method(action, transformedData, transformedSchema))
        })

        await Promise.all(afterSyncPlugins)
      }

      if (typeof checkpoint !== 'undefined') {
        await saveToken(checkpoint.name, checkpoint.token)
      }

      debug('After action plugins executed successfully!')
      logger.log(
        `${type}: { content_type: '${contentType}', ${
            (locale) ? `locale: '${locale}',` : ''
          } uid: '${uid}'} was completed successfully!`,
        )
      this.inProgress = false
      this.emit('next', data)
    } catch (error) {
      this.emit('error', {
        data,
        error,
        // tslint:disable-next-line: object-literal-sort-keys
        checkpoint,
      })
    }
  }
}

const notify = (event, obj) => {
  notifications.emit(event, obj)
}

export { notifications }
