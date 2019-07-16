import { cloneDeep, merge } from 'lodash'
import { setConfig } from '../../src'
import { config as internalConfig } from '../../src/config'
import { notifications, Q } from '../../src/core/q'
import { buildConfigPaths } from '../../src/util/build-paths'
import { setLogger } from '../../src/util/logger'
import { config } from '../dummy/config'
import { assetConnector, contentConnector } from '../dummy/connector-listener-instances'

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
      _checkpoint: {
        name: 'dummyCheckpointName',
        token: 'dummyCheckpointToken',
      },
      uid: '123',
    },
    error: 'dummyError',
  }
  notifications.on('error', (error) => {
    expect(error).toMatchObject(errorObject)
  })

  return q.errorHandler(errorObject)
    .then((result) => {
      expect(result).toBeUndefined()
    })
    .catch((error) => {
      expect(error).toBeNull()
    })
})
