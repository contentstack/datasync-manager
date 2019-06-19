import { cloneDeep, merge } from 'lodash'
import { join, resolve} from 'path'
import rimraf from 'rimraf'
import { setConfig } from '../../src'
import { config as internalConfig } from '../../src/config'
import { buildConfigPaths } from '../../src/util/build-paths'
import { setLogger } from '../../src/util/logger'
import { saveFilteredItems } from '../../src/util/unprocessible'
import { config as mockConfig } from '../dummy/config'

const config = cloneDeep(merge({}, internalConfig, mockConfig))

describe('filter items', () => {
  beforeAll(() => {
    setLogger()
  })
  afterAll(() => {
    const filteredFilePath = resolve(join(__dirname, '..', '..', 'test-filtered'))
    rimraf.sync(filteredFilePath)
  })

  test('Save filtered items should work without errors', () => {
    const items = [
      {
        key: 'dummy object',
      },
    ]
    const name = 'dummy_token'
    const token = '123'

    const configs: any = cloneDeep(config)
    configs.paths = buildConfigPaths()
    configs.paths.filtered = resolve(join(__dirname, '..', '..', 'test-filtered'))
    setConfig(configs)

    return saveFilteredItems(items, name, token).then((empty) => {
      expect(empty).toBeUndefined()
    }).catch((error) => {
      expect(error).toBeNull()
    })
  })

  test('Save filtered items should throw ENOENT error', () => {
    const items = [
      {
        key: 'dummy object',
      },
    ]
    const name = 'dummy_token'
    const token = '123'

    return saveFilteredItems(items, name, token).then((empty) => {
      expect(empty).toBeUndefined()
    }).catch((error) => {
      expect(error).toBeNull()
    })
  })
})
