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
  const baseDir = resolve(join(__dirname, '..', '..', '..', '..'))
  let pluginPath, tokenPath

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
    plugin: resolve(join((pluginPath || baseDir), 'plugins')),
    unprocessibleDir: resolve(join(tokenPath || baseDir, 'unprocessible')),
    failed: resolve(join(tokenPath || baseDir, '..', 'unprocessible', 'failed')),
    filtered: resolve(join(tokenPath || baseDir, '..', 'unprocessible', 'filtered')),
    checkpoint: resolve(join(tokenPath || baseDir, '..', '.checkpoint')),ledger: resolve(join(tokenPath || baseDir, '..', '.ledger')),
    token: resolve(join(tokenPath || baseDir, '..', '.token'))
  }

  return paths
}
