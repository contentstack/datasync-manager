import { join } from 'path'
import { cloneDeep, merge } from 'lodash'
import { setConfig } from '../../src'
import { config as internalConfig } from '../../src/config'
import { init as initCore, poke } from '../../src/core'
import { buildConfigPaths } from '../../src/util/build-paths'
import { setLogger } from '../../src/util/logger'
import { config } from '../dummy/config'
import { assetConnector, contentConnector } from '../dummy/connector-listener-instances'
import { get, init as initApi } from '../../src/api'

jest.mock('../../src/api', () => {
  const actual = jest.requireActual('../../src/api')

  return {
    ...actual,
    get: jest.fn(),
  }
})

const configs: any = cloneDeep(merge({}, internalConfig, config))

beforeAll(async () => {
  configs.paths = buildConfigPaths()
  const testRoot = join(process.cwd(), 'test', 'dummy')
  configs.paths.checkpoint = join(testRoot, '.checkpoint')
  configs.paths.token = join(testRoot, '.token')
  setConfig(configs)
  setLogger()
  initApi(configs.contentstack)
  ;(get as jest.Mock).mockResolvedValue({ items: [], sync_token: 'poke-test' })
  await initCore(contentConnector, assetConnector)
})

test('Poke should work without errors', async () => {
  await expect(poke()).resolves.toBeUndefined()
})
