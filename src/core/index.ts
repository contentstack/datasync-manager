/*!
 * Contentstack DataSync Manager
 * Copyright (c) 2019 Contentstack LLC
 * MIT Licensed
 */
import * as fs from 'fs'
import * as path from 'path'
import Debug from 'debug'
import { EventEmitter } from 'events'
import { cloneDeep, remove } from 'lodash'
import { getConfig } from '../'
import { get, init as initAPI } from '../api'
import { existsSync, readFileSync } from '../util/fs'
import { filterItems, formatItems, groupItems, markCheckpoint } from '../util/index'
import { logger } from '../util/logger'
import { map } from '../util/promise.map'
import { netConnectivityIssues } from './inet'
import { Q as Queue } from './q'
import { getToken, saveCheckpoint } from './token-management'
import { sanitizePath } from '../plugins/helper'

interface IQueryString {
  init?: true,
  pagination_token?: string,
  sync_token?: string,
}

interface IApiRequest {
  qs: IQueryString,
  path?: string,
}

interface IItem {
  content_type_uid: string,
  data: any,
  event_at: string,
  locale?: string,
}

interface ISyncResponse {
  items: IItem[],
  pagination_token?: string,
  sync_token?: string,
  limit?: number,
}

interface IToken {
  name: string
  token: string
}
interface ICheckpoint {
  enabled: boolean,
  filePath: string,
  preserve:boolean
}

const debug = Debug('sync-core')
const emitter = new EventEmitter()
const formattedAssetType = '_assets'
const formattedContentType = '_content_types'
const flag: any = {
  SQ: false,
  WQ: false,
  lockdown: false,
}
let config
let Contentstack
let Q

/**
 * @description Core's primary. This is where it starts..
 * @param {Object} connector - Content connector instance
 * @param {Object} config - Application config
 */
export const init = (contentStore, assetStore) => {
  config = getConfig()
  Q = new Queue(contentStore, assetStore, config)
  initAPI(config.contentstack)
  debug('Sync core:start invoked')

  return new Promise((resolve, reject) => {
    try {
      Contentstack = config.contentstack
      const checkPointConfig: ICheckpoint = config.checkpoint
      const paths = config.paths
      const environment = Contentstack.environment || process.env.NODE_ENV || 'development'
      debug(`Environment: ${environment}`)
      const request: any = {
        qs: {
          environment,
          limit: config.syncManager.limit,
        },
      }
      loadCheckpoint(checkPointConfig, paths);
      if (typeof Contentstack.sync_token === 'string' && Contentstack.sync_token.length !== 0) {
        request.qs.sync_token = Contentstack.sync_token
      } else if (typeof Contentstack.pagination_token === 'string' && Contentstack.pagination_token.length !== 0) {
        request.qs.pagination_token = Contentstack.pagination_token
      } else if (existsSync(paths.token)) {
        const token = JSON.parse(readFileSync(paths.token))
        request.qs[token.name] = token.token
      } else {
        request.qs.init = true
        if (config.syncManager.filters && typeof config.syncManager.filters === 'object') {
          const filters = config.syncManager.filters
          // tslint:disable-next-line: forin
          for (const filter in filters) {
            request.qs[filter] = filters[filter].join(',')
          }
        }
      }

      return fire(request)
        .then(resolve)
        .catch(reject)
    } catch (error) {
      return reject(error)
    }
  })
}

const loadCheckpoint = (checkPointConfig: ICheckpoint, paths: any): void => {
  if (!checkPointConfig?.enabled) return;

  // Try reading checkpoint from primary path
  let checkpoint = readHiddenFile(paths.checkpoint);

  // Fallback to filePath in config if not found
  if (!checkpoint) {
    const fallbackPath = path.join(
      sanitizePath(__dirname),
      sanitizePath(checkPointConfig.filePath || ".checkpoint")
    );
    checkpoint = readHiddenFile(fallbackPath);
  }

  // Set sync token if checkpoint is found
  if (checkpoint) {
    debug("Found sync token in checkpoint file:", checkpoint);
    Contentstack.sync_token = checkpoint.token;
    debug("Using sync token:", Contentstack.sync_token);
  }
};


function readHiddenFile(filePath: string) {
  try {
    if (!fs.existsSync(filePath)) {
      logger.error("File does not exist:", filePath);
      return;
    }
    const data = fs.readFileSync(filePath, "utf8"); 
    return JSON.parse(data); 
  } catch (err) {
    logger.error("Error reading file:", err);
    return undefined;
  }
}

export const push = (data) => {
  Q.emit('push', data)
}

export const unshift = (data) => {
  Q.emit('push', data)
}

export const pop = () => {
  Q.emit('pop')
}

/**
 * @description Notifies the sync manager utility to wake up and start syncing..
 */
export const poke = async () => {
  try {
    debug('Invoked poke');
    logger.info('Received \'contentstack sync\' notification')
    if (!flag.lockdown) {
      flag.WQ = true
      return await check()
    }
    return null;
  } catch (error) {
    debug('Error [poke]', error);
    throw error;
  }
}

/**
 * @description Check's if the status of the app when a new incoming notification is fired
 * @description Starts processing if the 'SQ: false'
 */
const check = async () => {
  try {
    debug(`Check called. SQ status is ${flag.SQ} and WQ status is ${flag.WQ}`)
    if (!flag.SQ && flag.WQ) {
      flag.WQ = false
      flag.SQ = true
      await sync();
      debug(`Sync completed and SQ flag updated. Cooloff duration is ${config.syncManager.cooloff}`)
      setTimeout(() => {
        flag.SQ = false
        emitter.emit('check')
      }, config.syncManager.cooloff)
    }
  } catch (error) {
    logger.error(error)
    debug('Error [check]', error);
    check().then(() => {
      debug('passed [check] error');
    }).catch((error) => {
      debug('failed [check] error', error);
    });
    throw error;
  }
}

/**
 * @description Gets saved token, builds request object and fires the sync process
 */
const sync = async () => {
  try {
    debug('started [sync]');
    const tokenObject = await getToken();
    debug('tokenObject [sync]', tokenObject);
    const token: IToken = (tokenObject as IToken)
    const request: any = {
      qs: {
        environment: process.env.SYNC_ENV || Contentstack.environment || 'development',
        limit: config.syncManager.limit,
        [token.name]: token.token,
      },
    }
    return await fire(request)
  } catch (error) {
    debug('Error [sync]', error);
    throw error
  }
}

/**
 * @description Used to lockdown the 'sync' process in case of exceptions
 */
export const lock = () => {
  debug('Contentstack sync locked..')
  flag.lockdown = true
}

/**
 * @description Used to unlock the 'sync' process in case of errors/exceptions
 */
export const unlock = (refire?: boolean) => {
  debug('Contentstack sync unlocked..', refire)
  flag.lockdown = false
  if (typeof refire === 'boolean' && refire) {
    flag.WQ = true
    if (flag.requestCache && Object.keys(flag.requestCache)) {
      return fire(flag.requestCache.params)
        .then(flag.requestCache.resolve)
        .catch(flag.requestCache.reject)
    }
  }
  check()
}

/**
 * @description Description required
 * @param {Object} req - Contentstack sync API request object
 */
const fire = (req: IApiRequest) => {
  debug(`Fire called with: ${JSON.stringify(req)}`)
  flag.SQ = true

  return new Promise((resolve, reject) => {
    return get(req).then((response: ISyncResponse) => {
      delete req.qs.init
      delete req.qs.pagination_token
      delete req.qs.sync_token
      delete req.path
      const syncResponse: ISyncResponse = response
      debug('Response [fire]', syncResponse.items.length);
      if (syncResponse.items.length) {
        return filterItems(syncResponse, config).then(() => {
          if (syncResponse.items.length === 0) {
            return postProcess(req, syncResponse)
              .then(resolve)
              .catch(reject)
          }
          syncResponse.items = formatItems(syncResponse.items, config)
          let groupedItems = groupItems(syncResponse.items)
          groupedItems = markCheckpoint(groupedItems, syncResponse)
          // send assets data for processing
          if (groupedItems[formattedAssetType]) {
            groupedItems[formattedAssetType].forEach((asset) => {
              Q.push(asset)
            })
            delete groupedItems[formattedAssetType]
          }
          if (groupedItems[formattedContentType]) {
            groupedItems[formattedContentType].forEach((contentType) => {
              Q.push(contentType)
            })
            delete groupedItems[formattedContentType]
          }

          const contentTypeUids = Object.keys(groupedItems)
          remove(contentTypeUids, (contentTypeUid) => {
            const contentType = groupedItems[contentTypeUid]
            if (contentType.length === 1 && !contentType[0].publish_details) {
              Q.push(contentType[0])

              return true
            }

            return false
          })

          return map(contentTypeUids, (uid) => {

            return new Promise((mapResolve, mapReject) => {
              debug(`API called with for content type: ${uid}`)
              return get({
                path: `${Contentstack.apis.content_types}${uid}`,
                qs: {
                  include_global_field_schema: config.contentstack.query.include_global_field_schema,
                },
              }).then((contentTypeSchemaResponse) => {
                const schemaResponse: {
                  content_type: any,
                } = (contentTypeSchemaResponse as any)
                if (schemaResponse.content_type) {
                  const items = groupedItems[uid]
                  items.forEach((entry) => {
                    entry._content_type = cloneDeep(schemaResponse.content_type)
                    Q.push(entry)
                  })

                  return mapResolve('')
                }
                const err: any = new Error('Content type ${uid} schema not found!')
                // Illegal content type call
                err.code = 'ICTC'

                return mapReject(err)
              }).catch((error) => {
                debug('Error [map] fetching content type schema:', error)
                if (netConnectivityIssues(error)) {
                  flag.SQ = false
                }

                return mapReject(error)
              })
            })
          }, 2).then(() => {
            return postProcess(req, syncResponse)
              .then(resolve)
              .catch(reject)
          }).catch((error) => {
            if (netConnectivityIssues(error)) {
              flag.SQ = false
            }
            // Errorred while fetching content type schema
            debug('Error [mapResolve]:', error)
            return reject(error)
          })
        }).catch((processError) => {
          debug('Error [filterItems]:', processError)
          return reject(processError)
        })
      }

      return postProcess(req, syncResponse)
        .then(resolve)
        .catch(reject)
    }).catch((error) => {
      debug('Error [fire]', error);
      if (netConnectivityIssues(error)) {
        flag.SQ = false
      }
      // do something

      return reject(error)
    })
  })
}

/**
 * @description Process data once 'sync' data has been fetched
 * @param {Object} req - Sync API request object
 * @param {Object} resp - Sync API response object
 */
const postProcess = (req, resp) => {

  return new Promise((resolve, reject) => {
    let name
    if (resp.pagination_token) {
      name = 'pagination_token'
    } else {
      name = 'sync_token'
    }

    return saveCheckpoint(name, resp[name])
    .then(() => {
      // re-fire!
      req.qs[name] = resp[name]

      if (flag.lockdown) {
        logger.log('Checkpoint: lockdown has been invoked')
        flag.requestCache = {
          params: req,
          reject,
          resolve,
        }
      } else {
        if (name === 'sync_token') {
          flag.SQ = false

          return resolve('')
        }

        debug(`Re-Fire called with: ${JSON.stringify(req)}`)
        return fire(req)
          .then(resolve)
          .catch(reject);
      }
    })
    .catch(reject)
  })
}

emitter.on('check', check)
