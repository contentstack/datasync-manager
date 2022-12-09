/*!
* Contentstack DataSync Manager
* This module saves filtered/failed items
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import { getConfig } from '../index'
import { existsSync, readFile, writeFile } from './fs'
import { getFile } from './index'
import { logger } from './logger'

const counter = {
  failed: 0,
  filtered: 0,
}

/**
 * TODO
 * This method logs all failed items.
 * Failed items should be 'retried' when app is started Or after a specific interval
 * @param {Object} obj - Contains 'error' and 'data' key
 * @returns {Promise} Returns a promisified object
 */
export const saveFailedItems = (obj) => {
  return new Promise((resolve) => {
    // const path = getConfig().paths.failedItems

    return resolve(obj)
  })
}

interface IFailedItems {
  items: any[]
  name: string
  token: string
  timestamp: string
}

/**
 * @description Saves items filtered from SYNC API response
 * @param {Object} items - Filtered items
 * @param {String} name - Page name where items were filtered
 * @param {String} token - Page token value
 * @returns {Promise} Returns a promise
 */
export const saveFilteredItems = (items, name, token) => {
  return new Promise(async (resolve, reject) => {
    try {
      const config = getConfig()
      let filename
      if (!config.syncManager.saveFilteredItems) {
        return resolve('')
      }
      const objDetails = {
        items,
        name,
        timestamp: new Date().toISOString(),
        token,
      }

      if (counter.filtered === 0) {
        filename = `${config.paths.filtered}.json`
      } else {
        filename = `${config.paths.filtered}-${counter.filtered}.json`
      }
      const file: string = await (getFile(filename, () => {
        counter.filtered++

        return `${config.paths.filtered}-${counter.filtered}.json`
      }) as any)

      if (existsSync(file)) {
        return readFile(file).then((data) => {
          const loggedItems: IFailedItems[] = JSON.parse((data as any))
          loggedItems.push(objDetails)

          return writeFile(file, JSON.stringify(loggedItems)).then(resolve).catch((error) => {
            // failed to log failed items
            logger.error(`Failed to write ${JSON.stringify(loggedItems)} at ${error}`)
            logger.error(error)

            return resolve('')
          })
        }).catch((error) => {
          logger.error(`Failed to read file from path ${fail}`)
          logger.error(error)

          return resolve('')
        })
      }

      return writeFile(file, JSON.stringify([objDetails])).then(resolve).catch((error) => {
        logger.error(`Failed while writing ${JSON.stringify(objDetails)} at ${file}`)
        logger.error(error)

        return resolve('')
      })
    } catch (error) {
      return reject(error)
    }
  })
}
