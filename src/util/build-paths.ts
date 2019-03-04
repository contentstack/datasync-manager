/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import { join, resolve } from 'path'

/**
 * @description Builds application's config paths where data is stored
 * @returns {Object} Returns config paths
 */
export const buildConfigPaths = () => {
  const baseDir = resolve(join(__dirname, '..', '..', '..', '..'))
  const tokenBasePath = process.env.TOKEN_PATH || baseDir

  const paths = {
    baseDir: resolve(join(__dirname, '..', '..')),
    checkpoint: resolve(join(tokenBasePath, '.checkpoint')),
    failed: resolve(join(baseDir, 'unprocessible', 'failed')),
    filtered: resolve(join(baseDir, 'unprocessible', 'filtered')),
    ledger: resolve(join(tokenBasePath, '.ledger')),
    plugin: resolve(join((process.env.PLUGIN_PATH || baseDir), 'plugins')),
    token: resolve(join(tokenBasePath, '.token')),
    unprocessibleDir: resolve(join(baseDir, 'unprocessible')),
  }

  return paths
}
