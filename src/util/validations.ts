/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import { hasIn, isEmpty, isPlainObject } from 'lodash'

/**
 * @public
 * @method validateConfig
 * @description Check's if the application's config is enough to start the app without errors
 * @param {Object} config - Application config
 */
export const validateConfig = (config) => {
  const keys = ['listener', 'assetStore', 'contentStore', 'syncManager', 'contentstack',
    'locales',
  ]
  keys.forEach((key) => {
    if (config[key] === undefined) {
      throw new Error(`Config '${key}' key cannot be undefined`)
    }
  })
  if (typeof config.contentstack !== 'object' || !config.contentstack.apiKey || !config.contentstack.deliveryToken) {
    throw new Error('Config \'contentstack\' should be of type object and have \'apiKey\' and \'token\'')
  }

  if (config.queue) {
    if (config.queue.resume_threshold >= config.queue.pause_threshold) {
      throw new Error('Queue resume_threshold cannot be higher or equal to, than queue.pause_threshold!')
    }
  }
}

/**
 * @public
 * @method validateAssetStore
 * @description Validates if provided asset store has required methods
 * @param {Object} assetStore - Asset store
 */
export const validateAssetStore = (assetStore) => {
  if (typeof assetStore !== 'object' && typeof assetStore !== 'function') {
    throw new Error('Invalid Type! Asset store is of neither \'object\' or \'function\'!')
  }
  const methods = ['getConfig', 'getAssetLocation', 'setConfig', 'start']
  methods.forEach((method) => {
    if (!(hasIn(assetStore, method)) && typeof assetStore[method] === 'function') {
      throw new Error(`Missing required methods! Asset store is missing '${method}()'!`)
    }
  })
}

/**
 * @public
 * @method validateContentStore
 * @description Validates if provided content store has required methods
 * @param {Object} contentStore - Content store
 */
export const validateContentStore = (contentStore) => {
  if (typeof contentStore !== 'object' && typeof contentStore !== 'function') {
    throw new Error('Invalid Type! Content store is of neither \'object\' or \'function\'!')
  }
  const methods = ['getConfig', 'setConfig', 'setAssetStore', 'start']
  methods.forEach((method) => {
    if (!(hasIn(contentStore, method)) && typeof contentStore[method] === 'function') {
      throw new Error(`Missing required methods! Content store is missing '${method}()'!`)
    }
  })
}

/**
 * @public
 * @method validateListener
 * @description Validates if the provided listener supports required methods
 * @param {Object} listener - Listener instance
 */
export const validateListener = (listener) => {
  if (typeof listener !== 'object' && typeof listener !== 'function') {
    throw new Error('Invalid Type! Listener is of neither \'object\' or \'function\'!')
  }
  const methods = ['getConfig', 'setConfig', 'start', 'register']
  methods.forEach((method) => {
    if (!(hasIn(listener, method)) || typeof listener[method] !== 'function') {
      throw new Error(`Missing required methods! Listener is missing '${method}()'!`)
    }
  })
}

/**
 * @public
 * @method validateContentStoreInstance
 * @description Validates if the registered content store supports required methods
 * @param {Object} instance - Content store instance
 */
export const validateContentStoreInstance = (instance) => {
  const fns = ['publish', 'unpublish', 'delete', 'updateContentType']
  fns.forEach((fn) => {
    if (!(hasIn(instance, fn)) && typeof instance[fn] === 'function') {
      throw new Error(`${instance} content store does not support '${fn}()'`)
    }
  })
}

/**
 * @public
 * @method validateAssetStoreInstance
 * @description Validates if the registered asset store supports required methods
 * @param {Object} instance - Asset store instance
 */
export const validateAssetStoreInstance = (instance) => {
  const fns = ['delete', 'download', 'unpublish']
  fns.forEach((fn) => {
    if (!(hasIn(instance, fn)) && typeof instance[fn] === 'function') {
      throw new Error(`${instance} asset store does not support '${fn}()'`)
    }
  })
}

/**
 * @public
 * @method validateExternalInput
 * @description Validates if the input provided by external method into 'Q' conforms standards
 * @param {Object} data - Input data
 */
export const validateExternalInput = (data) => {
  if (typeof data._content_type_uid !== 'string' || data._content_type_uid.length === 0) {
    throw new Error('data._content_type_uid should be of type string and not empty!')
  }

  if (typeof data.uid !== 'string' || data.uid.length === 0) {
    throw new Error('data.uid should be of type string and not empty!')
  }

  if (typeof data.locale !== 'string' || data.locale.length === 0) {
    throw new Error('data.locale should be of type string and not empty!')
  }

  if (!(isPlainObject(data)) || isEmpty(data)) {
    throw new Error('data should be of type object and not empty!')
  }
}

/**
 * @description Validates if the custom logger set supports required methods
 * @param {Object} instance - Custom logger instance
 */
export const validateLogger = (instance) => {
  let flag = false
  if (!instance) {
    return flag
  }
  const requiredFn = ['info', 'warn', 'log', 'error', 'debug']
  requiredFn.forEach((name) => {
    if (typeof instance[name] !== 'function') {
      flag = true
    }
  })

  return !flag
}

export const validateItemStructure = (item: any) => {
  try {
    if (!(item.type) || typeof item.type !== 'string' || !(item.type.length)) {
      item._error = '\'type\' key is missing!'

      return false
    }

    switch (item.type) {
      case 'asset_published':
        return assetPublishedStructure(item)
      case 'asset_unpublished':
        return assetUnpublishedStructure(item)
      case 'asset_deleted':
        return assetDeletedStructure(item)
      case 'entry_published':
        return entryPublishedStructure(item)
      case 'entry_unpublished':
        return entryUnpublishedStructure(item)
      case 'entry_deleted':
        return entryDeletedStructure(item)
      default:
        return contentTypeDeletedStructure(item)
    }
  } catch (error) {
    return false
  }
}

const assetPublishedStructure = (asset) => {
  const requiredKeys = ['content_type_uid', 'data', 'data.uid', 'data.url', 'data.publish_details',
    'data.publish_details.locale', 'data.title',
  ]

  requiredKeys.forEach((key) => {
    if (!(hasIn(asset, key))) {
      asset._error = asset._error || ''
      asset._error += `${key} is missing!\t`
    }
  })

  if (asset._error) {
    return false
  }

  return true
}

export const validatePlugin = (plugin) => {
  if (!plugin.name || typeof plugin.name !== 'string' || plugin.name.length < 1) {
    throw new Error("Invalid plugin config, 'plugin.name' is a required property!")
  }
}

const entryPublishedStructure = (entry) => {
  const requiredKeys = ['content_type_uid', 'data', 'data.uid', 'data.publish_details',
    'data.publish_details.locale',
  ]

  requiredKeys.forEach((key) => {
    if (!(hasIn(entry, key))) {
      entry._error = entry._error || ''
      entry._error += `${key} is missing!`
    }
  })

  if (entry._error) {
    return false
  }

  return true
}

const assetDeletedStructure = (asset) => {
  const requiredKeys = ['content_type_uid', 'data', 'data.uid', 'data.locale']

  requiredKeys.forEach((key) => {
    if (!(hasIn(asset, key))) {
      asset._error = asset._error || ''
      asset._error += `${key} is missing!`
    }
  })

  if (asset._error) {
    return false
  }

  return true
}

const entryDeletedStructure = (entry) => {
  const requiredKeys = ['content_type_uid', 'data', 'data.uid', 'data.locale']

  requiredKeys.forEach((key) => {
    if (!(hasIn(entry, key))) {
      entry._error = entry._error || ''
      entry._error += `${key} is missing!`
    }
  })

  if (entry._error) {
    return false
  }

  return true
}

const assetUnpublishedStructure = (asset) => {
  const requiredKeys = ['content_type_uid', 'data', 'data.uid', 'data.locale']

  requiredKeys.forEach((key) => {
    if (!(hasIn(asset, key))) {
      asset._error = asset._error || ''
      asset._error += `${key} is missing!`
    }
  })

  if (asset._error) {
    return false
  }

  return true
}

const entryUnpublishedStructure = (entry) => {
  const requiredKeys = ['content_type_uid', 'data', 'data.uid', 'data.locale']

  requiredKeys.forEach((key) => {
    if (!(hasIn(entry, key))) {
      entry._error = entry._error || ''
      entry._error += `${key} is missing!`
    }
  })

  if (entry._error) {
    return false
  }

  return true
}

const contentTypeDeletedStructure = (contentType) => {
  const requiredKeys = ['content_type_uid']

  requiredKeys.forEach((key) => {
    if (!(hasIn(contentType, key))) {
      contentType._error = contentType._error || ''
      contentType._error += `${key} is missing!`
    }
  })

  if (contentType._error) {
    return false
  }

  return true
}
