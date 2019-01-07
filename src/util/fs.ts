/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

import Debug = require('debug')
import { existsSync, readFile as rf, readFileSync as rFS, stat } from 'fs'
import mkdirp from 'mkdirp'
import { dirname } from 'path'
import writeFileAtomic from 'write-file-atomic'
import { stringify } from './stringify'

export { existsSync }
const debug = Debug('sm:util-fs')

export const writeFile = (filePath, data) => {
  debug(`Write file called on ${filePath}`)

  return new Promise((resolve, reject) => {
    try {
      const fileDirectory = dirname(filePath)

      if (!existsSync(fileDirectory)) {
        mkdirp.sync(fileDirectory)
      }

      return writeFileAtomic(filePath, (typeof data === 'object') ? stringify(data) : data, (wfError) => {
        if (wfError) {
          return reject(wfError)
        }

        return resolve()
      })
    } catch (writeFileError) {
      if (writeFileError.code === 'ENOENT') {
        return mkdirp(dirname(filePath), (createDirError) => {
          if (createDirError) {
            return reject(createDirError)
          }

          return writeFile(data, filePath).then(resolve).catch(reject)
        })
      }

      return reject(writeFileError)
    }
  })
}

export const readFile = (filePath) => {
  debug(`Read file called on ${filePath}`)

  return new Promise((resolve, reject) => {
    try {
      return stat(filePath, (error, stats) => {
        if (error) {
          return reject(error)
        } else if (stats.isFile) {
          return rf(filePath, (rfError, data) => {
            if (rfError) {
              return reject(rfError)
            }

            return resolve(data)
          })
        }
        const err: any = new Error(`Invalid 'read' operation on file. Expected ${filePath} to be of type 'file'!`)
        err.code = 'IOORF'

        return reject(err)
      })
    } catch (error) {
      return reject(error)
    }
  })
}

export const readFileSync = (filePath) => {
  debug(`Read file sync called on ${filePath}`)
  if (existsSync(filePath)) {
    return rFS(filePath)
  }
  const err: any = new Error(`Invalid 'read' operation on file. Expected ${filePath} to be of type 'file'!`)
  err.code = 'IOORFS'
  throw err
}

export const mkdir = (path) => {
  debug(`mkdir called on ${path}`)

  return new Promise((resolve, reject) => {
    try {
      return mkdirp(path, (error) => {
        if (error) {
          return reject(error)
        }

        return resolve()
      })
    } catch (error) {
      return reject(error)
    }
  })
}
