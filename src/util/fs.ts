/*!
* Contentstack DataSync Manager
*   - This module overrides nodejs internal 'fs' module functionalities
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import Debug = require('debug')
import { existsSync, readFile as rf, readFileSync as rFS, stat } from 'fs'
import mkdirp from 'mkdirp'
import { dirname } from 'path'
import writeFileAtomic from 'write-file-atomic'

export { existsSync }
const debug = Debug('sm:util-fs')

/**
 * @description A wrapper around nodejs fs module's 'writeFile()'
 * @param {String} filePath - Path where the data is to be written
 * @param {Object} data - Data that's to be written
 * @returns {Promise} Returns a promise
 */
export const writeFile = (filePath, data) => {
  debug(`Write file called on ${filePath}`)

  return new Promise((resolve, reject) => {
    try {
      const fileDirectory = dirname(filePath)

      if (!existsSync(fileDirectory)) {
        mkdirp.sync(fileDirectory)
      }

      return writeFileAtomic(filePath, (typeof data === 'object') ? JSON.stringify(data) : data, (wfError) => {
        if (wfError) {
          return reject(wfError)
        }

        return resolve('')
      })
    } catch (writeFileError) {

      return reject(writeFileError)
    }
  })
}

/**
 * @description A wrapper around nodejs fs module's 'readFile()'
 * @param {String} filePath - Path from where data is to be read
 * @returns {Promise} Returns a promise
 */
export const readFile = (filePath) => {
  debug(`Read file called on ${filePath}`)

  return new Promise((resolve, reject) => {
    try {
      return stat(filePath, (error, stats) => {
        if (error) {
          return reject(error)
        } else if (stats.isFile) {
          return rf(filePath, { encoding: 'utf-8' }, (rfError, data) => {
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

/**
 * @description A wrapper around nodejs fs module's 'readFileSync()'
 * @param filePath - Path from where data is to be read
 * @returns {String} Returns the data that's been read
 */
export const readFileSync = (filePath) => {
  debug(`Read file sync called on ${filePath}`)
  if (existsSync(filePath)) {
    return rFS(filePath, {encoding: 'utf-8'})
  }
  const err: any = new Error(`Invalid 'read' operation on file. Expected ${filePath} to be of type 'file'!`)
  err.code = 'IOORFS'
  throw err
}

/**
 * @description Safely creats a directory at the specified 'path'
 * @param filePath - Path from where directory is to be created
 * @returns {String} Returns a promise
 */
export const mkdir = (path) => {
  debug(`mkdir called on ${path}`)

  return new Promise((resolve, reject) => {
    try {
      return mkdirp(path, (error) => {
        if (error) {
          return reject(error)
        }

        return resolve('')
      })
    } catch (error) {
      return reject(error)
    }
  })
}

/**
 * @description exports fs.stat
 */
export { stat } from 'fs'

/**
 * @description synchnonous way of creating nested folder directory structure
 */
export { sync as mkdirpSync } from 'mkdirp'
