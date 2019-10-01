/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import { isAbsolute, join, resolve } from 'path'

/**
 * @description Builds application's config paths where data is stored
 * @returns {Object} Returns config paths
 */
export const buildConfigPaths = () => {
  //const baseDir = resolve(join(__dirname, '..', '..', '..', '..'))

  const baseDir = resolve(join(__dirname, '..', '..')) // for development purpose only

  let pluginPath: string
  let tokenPath: string

  if (process.env.PLUGIN_PATH) {
    if (!isAbsolute(process.env.PLUGIN_PATH)) {
      pluginPath = join(baseDir, process.env.PLUGIN_PATH)
    } else {
      pluginPath = process.env.PLUGIN_PATH
    }
  }

  if (process.env.TOKEN_PATH) {
    if (!isAbsolute(process.env.TOKEN_PATH)) {
      tokenPath = join(baseDir, process.env.TOKEN_PATH)
    } else {
      tokenPath = process.env.TOKEN_PATH
    }
  }

  const paths: any = {
    baseDir: resolve(join(__dirname, '..', '..')),
    checkpoint: resolve(join(tokenPath || join(baseDir, '..'), '.checkpoint')),
    failed: resolve(join(tokenPath || join(baseDir, '..'), 'unprocessible', 'failed')),
    filtered: resolve(join(tokenPath || join(baseDir, '..'), 'unprocessible', 'filtered')),
    ledger: resolve(join(tokenPath || join(baseDir, '..'), '.ledger')),
    plugin: resolve(join(pluginPath || join(baseDir, '..'), 'plugins')),
    token: resolve(join(tokenPath || join(baseDir), '.token')),
    unprocessibleDir: resolve(join(tokenPath || baseDir, 'unprocessible')),
  }

  return paths
}
