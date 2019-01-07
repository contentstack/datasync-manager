/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

import { join, resolve } from 'path'

export const buildConfigPaths = () => {
  const baseDir = process.cwd()
  const paths = {
    cwd: baseDir,
    failedItems: resolve(join(baseDir, 'logs', 'failedItems.json')),
    filteredItems: resolve(join(baseDir, 'logs', 'filteredItems.json')),
    plugin: resolve(join((process.env.PLUGIN_PATH || baseDir), 'plugins')),
    token: {
      checkpoint: resolve(join(baseDir, '.tokens', 'checkpoint')),
      current: resolve(join(baseDir, '.tokens', 'current')),
      ledger: resolve(join(baseDir, '.tokens', 'ledger')),
    },
  }

  return paths
}
