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
  const baseDir = resolve(join(__dirname, '..', '..'))
  const paths = {
    baseDir: resolve(join(__dirname, '..', '..')),
    failed: resolve(join(baseDir, 'unprocessible', 'failed')),
    filtered: resolve(join(baseDir, 'unprocessible', 'filtered')),
    plugin: resolve(join((process.env.PLUGIN_PATH || baseDir), 'plugins')),
    token: {
      checkpoint: resolve(join(baseDir, '.tokens', 'checkpoint')),
      current: resolve(join(baseDir, '.tokens', 'current')),
      ledger: resolve(join(baseDir, '.tokens', 'ledger')),
    },
    unprocessibleDir: resolve(join(baseDir, 'unprocessible')),
  }

  return paths
}
