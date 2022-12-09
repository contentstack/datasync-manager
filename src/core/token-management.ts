/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { getConfig } from '../index'
import { existsSync, readFile, writeFile } from '../util/fs'
import { getFile } from '../util/index'

const debug = Debug('token-management')
let counter = 0

/**
 * @interface ledger interface
 */
interface ITokenLedger {
  name: string,
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
export const getToken = () => {

  return new Promise(async (resolve, reject) => {
    try {
      const config = getConfig()
      const checkpoint = config.paths.checkpoint
      const token = config.paths.token
      let data: any = {}
      if (existsSync(checkpoint)) {
        debug(`Checkpoint read: ${checkpoint}`)

        const contents: any = await readFile(checkpoint)
        data = JSON.parse(contents)
      } else if (existsSync(token)) {
        debug(`Token read: ${token}`)

        const contents: any = await readFile(token)
        data = JSON.parse(contents)
      }

      return resolve(data)
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
export const saveToken = (name, token) => {
  debug(`Save token invoked with name: ${name}, token: ${token}`)

  return new Promise(async (resolve, reject) => {
    try {
      const config = getConfig()
      const path = config.paths.token
      const data: IToken = {
        name,
        timestamp: new Date().toISOString(),
        token,
      }

      // write token information @path
      await writeFile(path, JSON.stringify(data))
      const obj: ITokenLedger = {
        name,
        timestamp: new Date().toISOString(),
        token,
      }

      let filename
      if (counter === 0) {
        filename = config.paths.ledger
      } else {
        filename = `${config.paths.ledger}.${counter}`
      }
      const file: string = await (getFile(filename, () => {
        counter++

        return `${config.paths.ledger}-${counter}`
      }) as any)
      debug(`ledger file: ${file} exists?(${existsSync(file)})`)

      if (!existsSync(file)) {
        await writeFile(file, JSON.stringify([obj]))
      } else {
        const ledger = await readFile(file)
        const ledgerDetails: ITokenLedger[] = JSON.parse(ledger as any)
        ledgerDetails.splice(0, 0, obj)
        await writeFile(file, JSON.stringify(ledgerDetails))
      }

      return resolve('')
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
export const saveCheckpoint = async (name, token) => {
  debug(`Save token invoked with name: ${name}, token: ${token}`)
  const config = getConfig()
  const path = config.paths.checkpoint
  const data: IToken = {
    name,
    timestamp: new Date().toISOString(),
    token,
  }

  await writeFile(path, JSON.stringify(data))

  return
}
