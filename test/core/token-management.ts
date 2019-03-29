import { writeFileSync } from 'fs'
import { cloneDeep } from 'lodash'
import { join, resolve } from 'path'
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
    configs.paths.checkpoint = resolve(join(__dirname, '..', '..', '.checkpoint'))
    configs.paths.ledger = resolve(join(__dirname, '..', '..', '.ledger'))
    setConfig(configs)

    writeFileSync(configs.paths.token, JSON.stringify(tokenData))

    return getToken().then((tokenDetails) => {
      expect(tokenDetails).toMatchObject(tokenData)
    }).catch((error) => {
      console.error(error)
      expect(error).toBeNull()
    })
  })
})
