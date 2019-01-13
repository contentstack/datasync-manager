/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { find } from 'lodash'
import { getConfig } from '..'
import { existsSync, readFile, writeFile } from '../util/fs'

const debug = Debug('sm:token-management')

/**
 * @interface ledger interface
 */
interface ITokenLedger {
  name: string,
  type: string,
  timestamp: string,
  token: string,
}

/**
 * @interface token interface
 */
interface IToken {
  name: string,
  timestamp: string,
  token: string,
}

/**
 * @description Returns 'token details' based on 'token type'
 * @param {String} type - Token type (checkpoint | current)
 */
export const getTokenByType = (type) => {
  debug(`Get token invoked with type: ${type}`)

  return new Promise((resolve, reject) => {
    try {
      const config = getConfig()
      const path = config.paths.token.ledger
      if (!existsSync(path)) {
        debug(`Token details do not exist! ${path} not found`)
        const err: any = new Error(`Token path ${path} does not exist`)
        // token not exists
        err.code = 'TNE'

        return reject(err)
      }

      return readFile(path).then((data) => {
        const ledger: ITokenLedger[] = (JSON.parse(data as any))
        const token: any = find(ledger, (tokenItem) => {

          return tokenItem.type === type
        })
        if (typeof token !== 'undefined') {
          return resolve(token)
        }
        debug(`Unable to find any details of ${type} token. Returning the first token we find!`)

        return resolve(ledger[0])
      }).catch(reject)
    } catch (error) {
      return reject(error)
    }
  })
}

/**
 * @description Saves token details
 * @param {String} name - Name of the token
 * @param {String} token - Token value
 * @param {String} type - Token type
 */
export const saveToken = (name, token, type) => {
  debug(`Save token invoked with name: ${name}, token: ${token}, type: ${type}`)

  return new Promise((resolve, reject) => {
    const config = getConfig()
    let path
    if (type === 'checkpoint') {
      path = config.paths.token.checkpoint
    } else {
      path = config.paths.token.current
    }
    const data: IToken = {
      name,
      timestamp: new Date().toISOString(),
      token,
    }

    return writeFile(path, JSON.stringify(data)).then(() => {
      const obj: ITokenLedger = {
        name,
        timestamp: new Date().toISOString(),
        token,
        type,
      }

      if (!existsSync(config.paths.token.ledger)) {
        return writeFile(config.paths.token.ledger, JSON.stringify([obj]))
        .then(resolve)
        .catch(reject)
      }

      return readFile(config.paths.token.ledger).then((ledger) => {
        const ledgerDetails: ITokenLedger[] = JSON.parse(ledger as any)
        ledgerDetails.splice(0, 0, obj)

        return writeFile(config.paths.token.ledger, JSON.stringify(ledgerDetails))
          .then(resolve)
          .catch(reject)
      }).catch(reject)
    }).catch((error) => {
      return reject(error)
    })
  })
}
