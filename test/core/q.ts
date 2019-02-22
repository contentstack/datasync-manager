import { cloneDeep, merge } from 'lodash'
import { setConfig } from '../../src'
import { Q } from '../../src/core/q'
import { config as internalConfig } from '../../src/defaults'
import { buildConfigPaths } from '../../src/util/build-paths'
import { setLogger } from '../../src/util/logger'
import { config } from '../dummy/config'
import { contentConnector, assetConnector } from '../dummy/connector-listener-instances'

const configs: any = cloneDeep(merge({}, internalConfig, config))

beforeAll(() => {
  setLogger()
})

test('error handler should work fine', () => {
  setConfig(configs)
  configs.paths = buildConfigPaths()

  const q = new Q(contentConnector, assetConnector, configs)
  const errorObject = {
    data: {
      checkpoint: {
        name: 'dummyCheckpointName',
        token: 'dummyCheckpointToken',
      },
      uid: '123',
    },
    error: 'dummyError',
  }
  expect(q.errorHandler(errorObject)).toBeUndefined()
})
