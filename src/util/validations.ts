/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
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
  if (!Array.isArray(config.locales) || config.locales.length === 0) {
    throw new Error('Config \'locales\' should be an array and not empty!')
  }
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
  }
}

/**
 * @description Validates if the registered content connector supports required methods
 * @param {Object} instance - Content connector instance
 */
export const validateContentConnector = (instance) => {
  const fns = ['publish', 'unpublish', 'delete', 'find', 'findOne']
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
