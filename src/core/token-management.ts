/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { find } from 'lodash'
import { getConfig } from '..'
import { existsSync, readFile, writeFile } from '../util/fs'
import { parse } from '../util/parse'
import { stringify } from '../util/stringify'

const debug = Debug('sm:token-management')

interface ITokenLedger {
  name: string
  type: string
  timestamp: string
  token: string
}

interface IToken {
  name: string
  token: string
}

/**
 * Returns 'token details' based on 'token type'
 * @param {String} type - Token type (checkpoint | current)
 */
export const getTokenByType = (type) => {
  debug(`Get token invoked with type: ${type}`)

  return new Promise((resolve, reject) => {
    try {
      const config = getConfig()
      const path = config.paths.token.ledger
      // let token
      if (!existsSync(path)) {
        debug(`Token details do not exist! ${path} not found`)
        const err: any = new Error(`Token path ${path} does not exist`)
        // token not exists
        err.code = 'TNE'

        return reject(err)
      }

      return readFile(path).then((data) => {
        const ledger: ITokenLedger[] = (parse(data) as any)
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
 * Saves token details
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
      token,
    }

    return writeFile(path, stringify(data)).then(() => {
      const obj: ITokenLedger = {
        name,
        timestamp: new Date().toISOString(),
        token,
        type,
      }

      if (!existsSync(config.paths.token.ledger)) {
        return writeFile(config.paths.token.ledger, stringify([obj]))
        .then(resolve)
        .catch((error) => {
          // unable to update token ledger
          throw error
        })
      }

      return readFile(config.paths.token.ledger).then((ledger) => {
        const ledgerDetails: ITokenLedger[] = parse(ledger)
        ledgerDetails.splice(0, 0, obj)

        return writeFile(config.paths.token.ledger, stringify(ledgerDetails))
          .then(resolve)
          .catch((error) => {
            // unable to update token ledger
            throw error
          })
      }).catch((error) => {
        // unable to read token ledger
        throw error
      })
    }).catch((error) => {
      // do something if token cannot be saved
      return reject(error)
    })
  })
}
