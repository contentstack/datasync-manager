/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { hasIn } from 'lodash'
import { normalizePluginPath } from '../util/index'
import { validatePlugin } from '../util/validations'

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
    external: {},
    internal: {},
  }
  const plugins = config.plugins || []
  pluginMethods.forEach((pluginMethod) => {
    pluginInstances.external[pluginMethod] = pluginInstances[pluginMethod] || []
    pluginInstances.internal[pluginMethod] = pluginInstances[pluginMethod] || []
  })

  plugins.forEach((plugin) => {
    validatePlugin(plugin)

    const pluginName = plugin.name
    const slicedName = pluginName.slice(0, 13)
    let isInternal = false
    if (slicedName === '_cs_internal_') {
      isInternal = true
    }

    const pluginPath = normalizePluginPath(config, plugin, isInternal)
    const Plugin = require(pluginPath)
    Plugin.options = plugin.options || {}
    // execute/initiate plugin
    Plugin()
    pluginMethods.forEach((pluginMethod) => {
      if (hasIn(Plugin, pluginMethod)) {
        if (plugin.disabled) {
          // do nothing
        } else if (isInternal) {
          pluginInstances.internal[pluginMethod].push(Plugin[pluginMethod])
        } else {
          pluginInstances.external[pluginMethod].push(Plugin[pluginMethod])
        }
        debug(`${pluginMethod} loaded from ${pluginName} successfully!`)
      } else {
        debug(`${pluginMethod} not found in ${pluginName}`)
      }
    })
  })
  debug('Plugins loaded successfully!')

  return pluginInstances
}
