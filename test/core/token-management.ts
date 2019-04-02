import { writeFileSync } from 'fs'
import { cloneDeep } from 'lodash'
import mkdirp from 'mkdirp'
import { join, resolve } from 'path'
import rimraf from 'rimraf'
import { setConfig } from '../../src'
import { getToken } from '../../src/core/token-management'
import { buildConfigPaths } from '../../src/util/build-paths'
import { setLogger } from '../../src/util/logger'
import { config } from '../dummy/config'

describe('token management', () => {
  beforeAll(() => {
    setLogger()
  })

  test('get token by type should work without errors', () => {
    const tokenData = {
      name: 'sync_token',
      timestamp: 'ts-one',
      token: 'token-one',
    }
    const configs: any = cloneDeep(config)
    configs.paths = buildConfigPaths()
    const tknPath = resolve(join(__dirname, '..', 'testing'))
    mkdirp.sync(tknPath)
    configs.paths.checkpoint = resolve(join(tknPath, '.checkpoint'))
    configs.paths.ledger = resolve(join(__dirname, 'testing', '..', '.ledger'))
    setConfig(configs)

    writeFileSync(configs.paths.checkpoint, JSON.stringify(tokenData))

    return getToken().then((tokenDetails) => {
      expect(tokenDetails).toMatchObject(tokenData)
      rimraf.sync(tknPath)
    }).catch((error) => {
      expect(error).toBeNull()
    })
  })
})
