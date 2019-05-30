/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { existsSync } from 'fs'
import { hasIn } from 'lodash'
import { join, resolve } from 'path'
import { logger } from '../util/logger'

const debug = Debug('plugins')
const pluginMethods = ['beforeSync', 'afterSync']

/**
 * @description Load registered plugins
 * @param {Object} config - Application config
 * @returns {Object} pluginInstance - An instance of plugins, with valid registered methods
 */
export const load = (config) => {
  debug('Plugins load called')
  const pluginInstances = {
    internal: {},
    external: {}
  }
  const plugins = config || {}
  pluginMethods.forEach((pluginMethod) => {
    pluginInstances.external[pluginMethod] = pluginInstances[pluginMethod] || []
    pluginInstances.internal[pluginMethod] = pluginInstances[pluginMethod] || []
  })

  for (const pluginName of Object.keys(plugins)) {
    const slicedName = pluginName.slice(0, 13)
    let pluginPath
    if (slicedName === '_cs_internal_') {
      // load internal plugins
      pluginPath = join(__dirname, '..', 'plugins', pluginName.slice(13), 'index.js')
    } else {
      // external plugins
      pluginPath = resolve(join(config.paths.plugin, pluginName, 'index.js'))
    }

    if (existsSync(pluginPath)) {
      const Plugin = require(pluginPath)
      const pluginConfig = plugins[pluginName]
      // execute/initiate plugin
      Plugin(pluginConfig)
      
      pluginMethods.forEach((pluginMethod) => {
        if (hasIn(Plugin, pluginMethod)) {
          if (slicedName === '_cs_internal_') {
            if (!(pluginConfig.disabled)) {
              pluginInstances.internal[pluginMethod].push(Plugin[pluginMethod])
            }
          } else {
            pluginInstances.external[pluginMethod].push(Plugin[pluginMethod])
          }
          debug(`${pluginMethod} loaded from ${pluginName} successfully!`)
        } else {
          debug(`${pluginMethod} not found in ${pluginName}`)
        }
      })
    } else {
      logger.warn(`Unable to load ${pluginName} plugin since ${pluginPath} was not found!`)
    }
  }
  debug('Plugins loaded successfully!')

  return pluginInstances
}
