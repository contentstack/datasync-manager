/*!
 * Ensures a failed sync (e.g. Request timeout) does not block a later poke().
 */
import { join } from 'path'
import { cloneDeep, merge } from 'lodash'
import { setConfig } from '../../src'
import { config as internalConfig } from '../../src/config'
import { init as initCore, poke } from '../../src/core'
import { buildConfigPaths } from '../../src/util/build-paths'
import { setLogger } from '../../src/util/logger'
import { config as mockConfig } from '../dummy/config'
import { assetConnector, contentConnector } from '../dummy/connector-listener-instances'
import { get, init as initApi } from '../../src/api'

jest.mock('../../src/api', () => {
  const actual = jest.requireActual('../../src/api')

  return {
    ...actual,
    get: jest.fn(),
  }
})

const configs: any = cloneDeep(merge({}, internalConfig, mockConfig))

describe('poke after sync failure', () => {
  beforeAll(async () => {
    configs.paths = buildConfigPaths()
    const testRoot = join(process.cwd(), 'test', 'dummy')
    configs.paths.checkpoint = join(testRoot, '.checkpoint')
    configs.paths.token = join(testRoot, '.token')
    setConfig(configs)
    setLogger()
    initApi(configs.contentstack)
    ;(get as jest.Mock).mockResolvedValue({ items: [], sync_token: 'init-token' })
    await initCore(contentConnector, assetConnector)
  })

  test('second poke calls get again after Request timeout', async () => {
    const g = get as jest.Mock
    g.mockReset()
    g.mockRejectedValueOnce(Object.assign(new Error('Request timeout'), { code: 'ETIMEDOUT' }))
    g.mockResolvedValueOnce({ items: [], sync_token: 'recover-token' })

    await expect(poke()).rejects.toThrow('Request timeout')
    await poke()

    expect(g.mock.calls.length).toBe(2)
  })
})
