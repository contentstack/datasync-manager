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

  const paths = {
    baseDir: resolve(join(__dirname, '..', '..')),
    failed: resolve(join(baseDir, 'unprocessible', 'failed')),
    filtered: resolve(join(baseDir, 'unprocessible', 'filtered')),
    ledger: resolve(join(baseDir, '.ledger')),
    plugin: resolve(join((process.env.PLUGIN_PATH || baseDir), 'plugins')),
    token: resolve(join(baseDir, '.token')),
    unprocessibleDir: resolve(join(baseDir, 'unprocessible')),
  }

  return paths
}
