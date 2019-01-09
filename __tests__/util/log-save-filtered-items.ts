import { writeFileSync } from 'fs'
import { cloneDeep, merge } from 'lodash'
import { sync as mkdirpSync } from 'mkdirp'
import { join, resolve } from 'path'
import { sync as rimrafSync } from 'rimraf'
import { setConfig } from '../../src'
import { config as internalConfig } from '../../src/defaults'
import { buildConfigPaths } from '../../src/util/build-paths'
import { saveFilteredItems } from '../../src/util/log/filteredItems'
import { createLogger } from '../../src/util/logger'
import { config } from '../dummy/config'

const configs: any = cloneDeep(merge({}, internalConfig, config))
createLogger()
configs.paths = buildConfigPaths()

describe('save filtered items', () => {
  afterAll(() => {
    const filterItemDir = resolve(join(__dirname, '..', '..', 'test-filteritems'))
    rimrafSync(filterItemDir)
  })
  test('invoke save filter, when filter items file exists', () => {
    const filterItemDir = resolve(join(__dirname, '..', '..', 'test-filteritems'))
    const filterItemPath = join(filterItemDir, 'filtered-items.json')
    const filteredData = [
      {
        key: 'random data',
      },
    ]
    configs.paths.filteredItems = filterItemPath
    setConfig(configs)
    mkdirpSync(filterItemDir)
    writeFileSync(filterItemPath, JSON.stringify(filteredData))

    return saveFilteredItems(filteredData, 'mocked-name', 'mocked-token', configs.paths).then((output) => {
      expect(output).toBeUndefined()
    }).catch((error) => {
      expect(error).toBeNull()
    })
  })
})
