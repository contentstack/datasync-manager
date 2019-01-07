/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { EventEmitter } from 'events'
import { saveFailedItems } from '../util/log/failedItems'
import { parse } from '../util/parse'
import { stringify } from '../util/stringify'
import { load } from './plugins'
import { saveToken } from './token-management'

const debug = Debug('sm:core-q')
let instance = null

export class Q extends EventEmitter {
  private inProgress: boolean
  private pluginInstances: any
  private connectorInstance: any
  private q: any

  constructor(connector, config) {
    if (!instance && connector && config) {
      super()
      this.pluginInstances = load(config)
      this.connectorInstance = connector
      this.inProgress = false
      this.q = []
      this.on('next', this.next)
      this.on('error', this.errorHandler)
      instance = this
      debug('Core \'Q\' constructor initiated')
    }

    return instance
  }

  public push(data) {
    this.q.push(data)
    debug(`Content type '${data.content_type_uid}' received for '${data.action}'`)
    this.next()
  }

  public errorHandler(obj) {
    debug(`Error handler called with ${stringify(obj)}`)
    if (obj.data.checkpoint) {
      return saveToken(obj.data.checkpoint.name, obj.data.checkpoint.token, 'checkpoint').then(() => {
        return saveFailedItems(obj).then(this.next).catch((error) => {
          debug(`Save failed items failed after saving token!\n${stringify(error)}`)
          // fatal error
          this.next()
        })
      }).catch((error) => {
        debug(`Save token failed!\n${stringify(error)}`)
        // error saving token
        this.next()
      })
    }

    return saveFailedItems(obj).then(this.next).catch((error) => {
      debug(`Save failed items failed!\n${stringify(error)}`)
      // fatal error
      this.next()
    })
  }

  private next() {
    debug(`Calling 'next'. In progress status is ${this.inProgress} and Q length is ${this.q.length}`)
    if (!this.inProgress && this.q.length) {
      this.inProgress = true
      const item = this.q.shift()
      // debug(`Sending ${stringify(item)} for processing`)
      if (item.checkpoint) {
        saveToken(item.checkpoint.name, item.checkpoint.token, 'checkpoint').then(() => {
          this.process(item)
        }).catch((error) => {
          debug(`Save token failed to save a checkpoint!\n${stringify(error)}`)
          // error saving token
          this.process(item)
        })
      }
      this.process(item)
    }
  }

  private process(data) {
    debug(`Process called on '${data.action}'`)
    switch (data.action) {
    case 'publish':
      this.exec(data, data.action, 'beforePublish', 'afterPublish')
      break
    case 'unpublish':
      this.exec(data, data.action, 'beforeUnpublish', 'afterUnpublish')
      break
    case 'delete':
      this.exec(data, data.action, 'beforeDelete', 'afterDelete')
      break
    default:
      // undefined action invoked
      break
    }
  }

  private exec(data, action, beforeAction, afterAction) {
    try {
      debug(`Exec called. Action is ${action}`)
      const promisifiedBucket = []
      const clonedData = parse(stringify(data))
      this.pluginInstances[beforeAction].forEach((action1) => {
        promisifiedBucket.push(action1(data))
      })

      Promise.all(promisifiedBucket)
      .then(() => {
        debug('Before action plugins executed successfully!')

        return this.connectorInstance[action](clonedData)
      }).then(() => {
        debug('Connector instance called successfully!')
        const promisifiedBucket2 = []
        this.pluginInstances[afterAction].forEach((action2) => {
          promisifiedBucket2.push(action2(clonedData))
        })

        return Promise.all(promisifiedBucket2)
      }).then(() => {
        debug('After action plugins executed successfully!')
        this.inProgress = false
        this.emit('next', data)
      }).catch((error) => {
        // do something on publish error
        throw error
      })
    } catch (error) {
      this.emit('error', {
        data,
        error,
      })
    }
  }
}
