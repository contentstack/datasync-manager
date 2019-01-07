/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { existsSync, readFile, writeFile } from '../fs'
import { parse } from '../parse'
import { stringify } from '../stringify'

const DEBUG_ERR = Debug('error:log-filtereditems')

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
          DEBUG_ERR(`Errorred while writing ${stringify(loggedItems)} at ${path} file`)
          DEBUG_ERR(stringify(error))

          return resolve()
        })
      }).catch((error) => {
        // failed to read logged fail items
        DEBUG_ERR(`Errorred while reading ${path} file`)
        DEBUG_ERR(stringify(error))

        return resolve()
      })
    }

    return writeFile(path, stringify([objDetails])).then(resolve).catch((error) => {
      // failed to log failed items
      DEBUG_ERR(`Errorred while writing ${stringify(objDetails)} at ${path} file`)
      DEBUG_ERR(stringify(error))

      return resolve()
    })
  })
}
