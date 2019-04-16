/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { EventEmitter } from 'events'
import { cloneDeep } from 'lodash'
import { buildReferences, buildContentReferences, getOrSetRTEMarkdownAssets } from '../util/index'
import { lock, unlock } from '.'
import { logger } from '../util/logger'
import { map } from '../util/promise.map'
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
  private detectRteMarkdownAssets: any
  private iLock: boolean
  private inProgress: boolean
  private pluginInstances: any
  private assetStore: any
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
      this.detectRteMarkdownAssets = (config.contentStore && typeof config.contentStore.enableRteMarkdownDownload === 'boolean') ? config.contentStore.enableRteMarkdownDownload: true
      this.pluginInstances = load(config)
      this.contentStore = contentStore
      this.assetStore = assetStore
      this.config = config
      this.pluginInstances = load(config)
      this.iLock = false
      this.inProgress = false
      this.q = []
      this.config = config
      this.on('next', this.next)
      this.on('error', this.errorHandler)
      instance = this
      debug('Core \'Q\' constructor initiated')
    }

    return instance
  }

  /**
   * @description Enter item into 'Q's queue
   * @param {Object} data - Formatted item from 'sync api's response
   */
  public push(data) {
    this.q.push(data)
    if (this.q.length > this.config.syncManager.queue.pause_threshold) {
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
    const self = this
    logger.error(obj)
    debug(`Error handler called with ${JSON.stringify(obj)}`)
    if (obj.data.checkpoint) {
      return saveToken(obj.data.checkpoint.name, obj.data.checkpoint.token).then(() => {
        saveFailedItems(obj).then(() => {
          self.inProgress = false
          self.emit('next')
        }).catch((error) => {
          debug(`Save failed items failed after saving token!\n${JSON.stringify(error)}`)
          self.inProgress = false
          // fatal error
          self.emit('next')
        })
      }).catch((error) => {
        logger.error('Errorred while saving token')
        logger.error(error)
        self.inProgress = false
        self.emit('next')
      })
    }

    return saveFailedItems(obj).then(() => {
      self.inProgress = false
      self.emit('next')
    }).catch((error) => {
      logger.error('Errorred while saving failed items')
      logger.error(error)
      self.inProgress = false
      self.emit('next')
    })
  }

  /**
   * @description Calls next item in the queue
   */
  private next() {
    if (this.iLock && this.q.length < this.config.syncManager.queue.resume_threshold) {
      unlock(true)
      this.iLock = false
    }
    const self = this
    debug(`Calling 'next'. In progress status is ${this.inProgress}, and Q length is ${this.q.length}`)
    if (!this.inProgress && this.q.length) {
      this.inProgress = true
      const item = this.q.shift()
      if (item.checkpoint) {
        saveToken(item.checkpoint.name, item.checkpoint.token).then(() => {
          self.process(item)
        }).catch((error) => {
          logger.error('Save token failed to save a checkpoint!')
          logger.error(error)
          self.process(item)
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
    const { content_type_uid, uid } = data
    if (content_type_uid === '_content_types') {
      logger.log(
        `${data.action.toUpperCase()}ING: { content_type: '${content_type_uid}', uid: '${uid}'}`)
    } else {
      const { locale } = data
      logger.log(
        `${data.action.toUpperCase()}ING: { content_type: '${content_type_uid}', locale: '${locale}', uid: '${uid}'}`)
    }

    notify(data.action, data)
    switch (data.action) {
    case 'publish':
      const isEntry = ['_assets', '_content_types'].indexOf(data.content_type_uid) === -1
      if (isEntry) {
        data.data = buildContentReferences(data.content_type.schema, data.data)
        data.content_type.references = buildReferences(data.content_type.schema)
      }

      if (isEntry && this.detectRteMarkdownAssets && (!data.pre_processed)) {
        let assets = getOrSetRTEMarkdownAssets(data.content_type.schema, data.data, [], true)
        
        // if no assets were found in the RTE/Markdown
        if (assets.length === 0) {
          this.exec(data, data.action)
          return
        }
        assets = assets.map((asset) => { return this.reStructureAssetObjects(asset, data.locale) })
        const assetBucket = []
        return map(assets, (asset) => {
          return new Promise((resolve, reject) => {
            return this.assetStore.download(asset.data)
              .then((updatedAsset) => {
                asset.data = updatedAsset
                assetBucket.push(asset)
                return resolve()
              })
              .catch(reject)
          })
        }, 1)
        .then(() => {
          data.data = getOrSetRTEMarkdownAssets(data.content_type.schema, data.data, assetBucket, false)
          data.pre_processed = true
          this.q.unshift(data)
          assetBucket.forEach((asset) => {
            if (asset && typeof asset === 'object' && asset.data) {
              this.q.unshift(asset)
            }
          })
          this.inProgress = false
          this.emit('next')
        })
        .catch((error) => {
          this.emit('error', {
            data,
            error
          })
        })
      }
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

  private reStructureAssetObjects(asset, locale) {
    // add locale key to inside of asset
    asset.locale = locale

    return {
      content_type_uid: '_assets',
      data: asset,
      action: this.config.contentstack.actions.publish,
      locale,
      uid: asset.uid
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
    const self = this
    try {
      debug(`Exec called. Action is ${action}`)
      const beforeSyncPlugins = []
      const clonedData = cloneDeep(data)
      this.pluginInstances.beforeSync.forEach((method) => {
        beforeSyncPlugins.push(method(data, action))
      })

      Promise.all(beforeSyncPlugins)
      .then(() => {
        debug('Before action plugins executed successfully!')

        return self.contentStore[action](clonedData)
      }).then(() => {
        debug('Connector instance called successfully!')
        const afterSyncPlugins = []
        self.pluginInstances.afterSync.forEach((method) => {
          afterSyncPlugins.push(method(clonedData))
        })

        return Promise.all(afterSyncPlugins)
      }).then(() => {
        debug('After action plugins executed successfully!')
        const { content_type_uid, uid } = data
        if (content_type_uid === '_content_types') {
          logger.log(
            `${action.toUpperCase()}ED: { content_type: '${content_type_uid}', uid: '${uid}'}`)
        } else {
          const { locale } = data
          logger.log(
            `${action.toUpperCase()}ED: { content_type: '${content_type_uid}', locale: '${locale}', uid: '${uid}'}`)
        }
        self.inProgress = false
        self.emit('next', data)
      }).catch((error) => {
        self.emit('error', {
          data,
          error,
        })
      })
    } catch (error) {
      self.emit('error', {
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