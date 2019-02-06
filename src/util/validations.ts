/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import { hasIn } from 'lodash'

/**
 * @description Check's if the application's config is enough to start the app without errors
 * @param {Object} config - Application config
 */
export const validateConfig = (config) => {
  const keys = ['listener', 'asset-connector', 'content-connector', 'sync-manager', 'contentstack',
    'locales',
  ]
  keys.forEach((key) => {
    if (config[key] === undefined) {
      throw new Error(`Config '${key}' key cannot be undefined`)
    }
  })
  if (typeof config.contentstack !== 'object' || !config.contentstack.apiKey || !config.contentstack.token) {
    throw new Error('Config \'contentstack\' should be of type object and have \'apiKey\' and \'token\'')
  }
}

/**
 * @description Validates registered instances
 * @param {Object} assetConnector - Asset connector instance
 * @param {Object} contentConnector - Content connector instance
 * @param {Object} listener - Listener instance
 */
export const validateInstances = (assetConnector, contentConnector, listener) => {
  if (typeof assetConnector === 'undefined') {
    throw new Error('Call \'setAssetConnector()\' before calling sync-manager start!')
  } else if (typeof contentConnector === 'undefined') {
    throw new Error('Call \'setContentConnector()\' before calling sync-manager start!')
  } else if (typeof listener === 'undefined') {
    throw new Error('Call \'setListener()\' before calling sync-manager start!')
  } else if (!assetConnector.start || !contentConnector.start || !listener.start) {
    throw new Error('Connector and listener instances should have \'start()\' method')
  } else if (typeof assetConnector.start !== 'function' || typeof contentConnector.start !== 'function' ||
   typeof listener.start !== 'function') {
    throw new Error('Connector and listener instances should have \'start()\' method')
  } else if (!assetConnector.setLogger || !contentConnector.setLogger || !listener.setLogger) {
    throw new Error('Connector and listener instances should have \'setLogger\' method')
  } else if (typeof assetConnector.setLogger !== 'function' ||
   typeof contentConnector.setLogger !== 'function' || typeof listener.setLogger !== 'function') {
    throw new Error('Connector and listener instances should have \'start()\' method')
  }
}

/**
 * @description Validates if the registered content connector supports required methods
 * @param {Object} instance - Content connector instance
 */
export const validateContentConnector = (instance) => {
  const fns = ['publish', 'unpublish', 'delete']
  fns.forEach((fn) => {
    if (!(hasIn(instance, fn))) {
      throw new Error(`${instance} content connector does not support '${fn}()'`)
    }
  })
}

/**
 * @description Validates if the registered asset connector supports required methods
 * @param {Object} instance - Asset connector instance
 */
export const validateAssetConnector = (instance) => {
  const fns = ['delete', 'download', 'unpublish']
  fns.forEach((fn) => {
    if (!(hasIn(instance, fn))) {
      throw new Error(`${instance} asset connector does not support '${fn}()'`)
    }
  })
}

/**
 * @description Validates if the registered listener supports required methods
 * @param {Object} instance - Listener instance
 */
export const validateListener = (instance) => {
  const fns = ['register']
  fns.forEach((fn) => {
    if (!(hasIn(instance, fn))) {
      throw new Error(`${instance} listener does not support '${fn}()'`)
    }
  })
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
      console.warn(`Unable to register custom logger since '${name}()' does not exist on ${instance}!`)
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
      case 'content_type_deleted':
        return contentTypeDeletedStructure(item)
      default:
        return false
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
