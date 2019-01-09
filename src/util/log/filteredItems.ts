/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

import { existsSync, readFile, writeFile } from '../fs'
import { logger } from '../logger'
import { parse } from '../parse'
import { stringify } from '../stringify'

interface IFailedItems {
  items: any[]
  name: string
  token: string
  timestamp: string
}

export const saveFilteredItems = (items, name, token, paths) => {
  return new Promise((resolve) => {
    const path = paths.filteredItems
    const objDetails = {
      items,
      name,
      timestamp: new Date().toISOString(),
      token,
    }
    if (existsSync(path)) {
      return readFile(path).then((data) => {
        const loggedItems: IFailedItems[] = parse(data)
        loggedItems.push(objDetails)

        return writeFile(path, stringify(loggedItems)).then(resolve).catch((error) => {
          // failed to log failed items
          logger.error(`Failed to write ${stringify(loggedItems)} at ${path}`)
          logger.error(error)

          return resolve()
        })
      }).catch((error) => {
        logger.error(`Failed to read file from path ${path}`)
        logger.error(error)

        return resolve()
      })
    }

    return writeFile(path, stringify([objDetails])).then(resolve).catch((error) => {
      logger.error(`Failed while writing ${stringify(objDetails)} at ${path}`)
      logger.error(error)

      return resolve()
    })
  })
}
