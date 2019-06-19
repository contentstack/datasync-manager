import { cloneDeep, merge } from 'lodash'
import { join, resolve } from 'path'
import rimraf from 'rimraf'
import { config as internalConfig } from '../../src/config'
import { buildConfigPaths } from '../../src/util/build-paths'
import { mkdir, readFile, readFileSync, writeFile } from '../../src/util/fs'
import { setLogger } from '../../src/util/logger'
import { config } from '../dummy/config'

const configs: any = cloneDeep(merge({}, internalConfig, config))

describe('fs utility', () => {
  beforeAll(() => {
    setLogger()
    configs.paths = buildConfigPaths()
  })

  afterAll(() => {
    const fPath = resolve(join(__dirname, '..', '..', 'file.json'))
    rimraf.sync(fPath)
  })

  test('write file should execute without errors', () => {
    const filePath = resolve(join(__dirname, '..', '..', 'file.json'))
    const data = {
      sample: 'data',
    }

    return writeFile(filePath, data).then((result) => {
      expect(result).toBeUndefined()
    }).catch((error) => {
      expect(error).toBeUndefined()
    })
  })

  test('read file should execute without errors', () => {
    const filePath = resolve(join(__dirname, '..', '..', 'file.json'))
    const data = {
      sample: 'data',
    }

    return readFile(filePath).then((result) => {
      const res = JSON.parse((result as any))
      expect(res).toHaveProperty('sample')
      expect(res).toMatchObject(data)
    }).catch((error) => {
      expect(error).toBeUndefined()
    })
  })

  test('read non existent file and throw error', () => {
    const filePath = resolve(join(__dirname, '..', '..', 'file-not-exists.json'))
    const err = `ENOENT: no such file or directory, stat '${filePath}'`

    return readFile(filePath).then((result) => {
      expect(result).toBeUndefined()
    }).catch((error) => {
      expect(error.message).toEqual(err)
    })
  })

  test('read file sync without errors', () => {
    const filePath = resolve(join(__dirname, '..', '..', 'file.json'))
    const data = {
      sample: 'data',
    }

    const obj: any = JSON.parse(readFileSync(filePath).toString())

    expect(obj).toEqual(data)
  })

  test('read non existent file sync with errors', () => {
    const filePath = resolve(join(__dirname, '..', '..', 'file-not-exists.json'))
    const str = `Invalid 'read' operation on file. Expected ${filePath} to be of type 'file'!`
    const err: any = new Error(str)
    err.code = 'IOORFS'
    // expect(readFileSync(filePath)).toThrowError(err)
    expect(() => {
      readFileSync(filePath)
    }).toThrow(/^Invalid 'read' operation on file. Expected (.*) to be of type 'file'!/)
  })

  test('make directory without errors', () => {
    const dirPath = resolve(join(__dirname, '..', '..', '..', 'test-mkdir'))
    // expect(mkdir(dirPath)).resolves.toBeUndefined()

    return mkdir(dirPath).then((result) => {
      expect(result).toBeUndefined()
    })
  })
})
