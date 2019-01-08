import { writeFileSync } from 'fs'
import { cloneDeep } from 'lodash'
import { sync as mkdirp } from 'mkdirp'
import { join, resolve } from 'path'
import { sync as rimraf } from 'rimraf'
import { setConfig } from '../../src'
import { getTokenByType } from '../../src/core/token-management'
import { buildConfigPaths } from '../../src/util/build-paths'
import { stringify } from '../../src/util/stringify'
import { config } from '../dummy/config'

describe('token management', () => {
  test('get token by type should work without errors', () => {
    const tokenData = [
      {
        name: 'sync_token',
        timestamp: 'ts-one',
        token: 'token-one',
        type: 'checkpoint',
      },
    ]
    const configs: any = cloneDeep(config)
    configs.paths = buildConfigPaths()
    configs.paths.token = {
      ledger: resolve(join(__dirname, '..', '..', '.tokens', 'ledger')),
    }
    setConfig(configs)
    const tokenDirectory = resolve(join(__dirname, '..', '..', '.tokens'))
    const ledgerPath = join(tokenDirectory, 'ledger')
    rimraf(tokenDirectory)
    // throw new Error('hey')
    mkdirp(tokenDirectory)
    writeFileSync(ledgerPath, stringify(tokenData))

    return getTokenByType('checkpoint').then((tokenDetails) => {
      expect(tokenDetails).toMatchObject(tokenData[0])
      // expect(tokenDetails).toBeUndefined()
    }).catch((error) => {
      expect(error).toBeNull()
    })
  })

  test('get token by type should throw error (path does not exist!)', () => {
    const configs: any = cloneDeep(config)
    configs.paths = {
      token: {
        ledger: resolve(join(__dirname, '..', '..', '.tokens', 'ledger')),
      },
    }
    setConfig(configs)
    const tokenDirectory = resolve(join(__dirname, '..', '..', '.tokens'))
    const ledgerPath = join(tokenDirectory, 'ledger')
    rimraf(tokenDirectory)

    return getTokenByType('checkpoint').then((result) => {
      expect(result).toBeUndefined()
    }).catch((error) => {
      expect(error.message).toEqual(`Token path ${ledgerPath} does not exist`)
    })
  })
})
