/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { merge } from 'lodash'
import { init } from './core'
import { poke } from './core/sync'
import { config as internalConfig } from './defaults'
import { buildConfigPaths } from './util/build-paths'

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

export const setContentConnector = (instance) => {
  debug('Content connector instance registered successfully')
  // do something with connector instance
  contentConnector = instance
}

export const setAssetConnector = (instance) => {
  debug('Asset connector instance registered successfully')
  // do something with connector instance
  assetConnector = instance
}

export const setListener = (instance) => {
  validateListener(instance)
  debug('Listener instance registered successfully')
  // do something with listener instance
  listener = instance
}

export const setConfig = (config) => {
  validateConfig(config)
  debug('Config set successfully!')
  appConfig = config
}

export const getConfig = () => {
  return appConfig
}

export const start = (config = {}) => {
  return new Promise((resolve, reject) => {
    try {
      validateInstances(assetConnector, contentConnector, listener)
      appConfig = merge(internalConfig, appConfig, config)
      validateConfig(appConfig)
      appConfig.paths = buildConfigPaths()
      // console.log(stringify(appConfig.paths))
      debug('App validations passed.')

      return assetConnector.start(appConfig).then((assetInstance) => {
        debug(`Asset connector instance ${assetInstance}`)
        validateAssetConnector(assetInstance)
        debug('Asset connector initiated successfully')

        return contentConnector.start(appConfig, assetInstance)
      }).then((connectorInstance) => {
        // debug(`Content connector instance ${JSON.stringify(connectorInstance)}`)
        validateContentConnector(connectorInstance)
        debug('Content connector initiated successfully')

        return init(connectorInstance, appConfig)
      }).then(() => {
        debug('Sync Manager initiated successfully!')
        listener.register(poke)

        return listener.start(appConfig)
      }).then(() => {
        return resolve({status: 'App started successfully!'})
      }).catch(reject)
    } catch (error) {
      // do something with error
      return reject(error)
    }
  })
}
