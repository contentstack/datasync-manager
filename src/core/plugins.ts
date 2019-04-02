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
  const pluginInstances = {}
  const plugins = config.plugins || {}
  pluginMethods.forEach((pluginMethod) => {
    pluginInstances[pluginMethod] = pluginInstances[pluginMethod] || []
  })

  // load internal plugins

  // external plugins
  for (const pluginName of Object.keys(plugins)) {
    const pluginPath = resolve(join(config.paths.plugin, pluginName, 'index.js'))
    if (existsSync(pluginPath)) {
      const Plugin = require(pluginPath)
      const pluginConfig = plugins[pluginName]
      Plugin(pluginConfig)
      pluginMethods.forEach((pluginMethod) => {
        if (hasIn(Plugin, pluginMethod)) {
          pluginInstances[pluginMethod].push(Plugin[pluginMethod])
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
