import { writeFileSync } from 'fs'
import { cloneDeep, merge } from 'lodash'
import { sync as mkdirpSync } from 'mkdirp'
import { join, resolve } from 'path'
import { sync as rimrafSync } from 'rimraf'

import { setConfig } from '../../src'
import { config as internalConfig } from '../../src/config'
import { buildConfigPaths } from '../../src/util/build-paths'
import { setLogger } from '../../src/util/logger'
import { saveFilteredItems } from '../../src/util/unprocessible'
import { config } from '../dummy/config'

const configs: any = cloneDeep(merge({}, internalConfig, config))
setLogger()
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

    return saveFilteredItems(filteredData, 'mocked-name', 'mocked-token').then((output) => {
      expect(output).toBeUndefined()
    }).catch((error) => {
      expect(error).toBeNull()
    })
  })
})
