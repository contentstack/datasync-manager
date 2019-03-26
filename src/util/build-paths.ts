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

  const paths: any = {
    baseDir: resolve(join(__dirname, '..', '..')),
    failed: resolve(join(baseDir, 'unprocessible', 'failed')),
    filtered: resolve(join(baseDir, 'unprocessible', 'filtered')),
    plugin: resolve(join((process.env.PLUGIN_PATH || baseDir), 'plugins')),
    unprocessibleDir: resolve(join(baseDir, 'unprocessible')),
  }

  if (process.env.TOKEN_PATH && process.env.TOKEN_PATH.length !== 0) {
    paths.checkpoint = resolve(join(process.env.TOKEN_PATH, '.checkpoint'))
    paths.ledger = resolve(join(process.env.TOKEN_PATH, '.ledger'))
    paths.token = resolve(join(process.env.TOKEN_PATH, '.token'))
  } else {
    paths.checkpoint = resolve(join(baseDir, '..', '.checkpoint'))
    paths.ledger = resolve(join(baseDir, '..', '.ledger'))
    paths.token = resolve(join(baseDir, '..', '.token'))
  }

  return paths
}
