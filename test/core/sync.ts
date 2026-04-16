import { cloneDeep, merge } from 'lodash'
import { setConfig } from '../../src'
import { config as internalConfig } from '../../src/config'
import { poke } from '../../src/core'
import { buildConfigPaths } from '../../src/util/build-paths'
import { setLogger } from '../../src/util/logger'
import { config } from '../dummy/config'

const configs: any = cloneDeep(merge({}, internalConfig, config))

beforeAll(() => {
  setConfig(configs)
  configs.paths = buildConfigPaths()
  setLogger()
})

test('Poke should work without errors', () => {
  expect(poke()).toBeUndefined()
})
