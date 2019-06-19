/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import Debug from 'debug'
import { cloneDeep, isEmpty, find, map, merge, remove } from 'lodash'
import marked from 'marked'
import { isAbsolute, join, resolve } from 'path'
import { getConfig } from '../index'
import { existsSync, mkdirpSync, stat } from './fs'
import { logger } from './logger'
import { saveFilteredItems } from './unprocessible'
import { validateItemStructure } from './validations'

const debug = Debug('util:index')
const formattedAssetType = '_assets'
const formattedContentType = '_content_types'
const assetType = 'sys_assets'

/**
 * @description Utility that filters items based on 'locale'.
 * @param {Object} response - SYNC API's response
 * @param {Object} config - Application config
 * @returns {Promise} Returns a promise
 */
export const filterItems = async (response, config) => {
  return new Promise((resolve, reject) => {
    try {
      const locales = map(config.locales, 'code')
      const filteredObjects = remove(response.items, (item) => {
        // validate item structure. If the structure is not as expected, filter it out
        if (!(validateItemStructure(item))) {

          return item
        }
        // for published items
        if ((item as any).data.publish_details) {
          return locales.indexOf((item as any).data.publish_details.locale) !== -1
        // for unpublished items || deleted items
        } else if ((item as any).data.locale) {
          return locales.indexOf((item as any).data.locale) !== -1
        }

        return false
      })

      if (filteredObjects.length === 0) {
        return resolve()
      }

      // do something with filteredObjects
      let name
      if (response.pagination_token) {
        name = 'pagination_token'
      } else {
        name = 'sync_token'
      }

      return saveFilteredItems(filteredObjects, name, response[name])
        .then(resolve)
        .catch(reject)
    } catch (error) {
      return reject(error)
    }
  })
}

export const formatSyncFilters = (config) => {
  if (config.syncManager.filters && typeof config.syncManager.filters === 'object') {
    const filters = config.syncManager.filters
    for (let filter in filters) {
      if (filters[filter] && filters[filter] instanceof Array && filters[filter].length) {
        const filtersData = filters[filter]
        filtersData.forEach((element, index) => {
          if (typeof element !== 'string' || element.length === 0) {
            filtersData.splice(index, 1)
          }
        })

        // if length = 0, remove it from filters
        if (filtersData.length === 0) {
          delete config.syncManager.filters[filter]
        }
      }
    }
  }

  return config
}

/**
 * @description Groups items based on their content type
 * @param {Array} items - An array of SYNC API's item
 * @returns {Object} Returns an 'object' who's keys are content type uids
 */
export const groupItems = (items) => {
  const bucket = {}
  items.forEach((item) => {
    if (item._content_type_uid === assetType) {
      item._content_type_uid = formattedAssetType
    }
    if (bucket.hasOwnProperty(item._content_type_uid)) {
      bucket[item._content_type_uid].push(item)
    } else  {
      bucket[item._content_type_uid] = [item]
    }
  })

  return bucket
}

/**
 * @description Formats SYNC API's items into defined standard
 * @param {Array} items - SYNC API's items
 * @param {Object} config - Application config
 */
export const formatItems = (items, config) => {
  const time = new Date().toISOString()
  items.forEach((item) => {
    switch (item.type) {
      case 'asset_published':
        item._content_type_uid = formattedAssetType
        item.type = config.contentstack.actions.publish
        item.locale = item.data.publish_details.locale
        // extra keys
        item._synced_at = time
        item = merge(item, item.data)
        delete item.data
        delete item.content_type_uid
        break
      case 'asset_unpublished':
        item._content_type_uid = formattedAssetType
        item.type = config.contentstack.actions.unpublish
        item = merge(item, item.data)
        delete item.data
        delete item.content_type_uid
        break
      case 'asset_deleted':
        item._content_type_uid = formattedAssetType
        item.type = config.contentstack.actions.delete
        item = merge(item, item.data)
        delete item.data
        delete item.content_type_uid
        break
      case 'entry_published':
        item.type = config.contentstack.actions.publish
        item._content_type_uid = item.content_type_uid
        item.locale = item.data.publish_details.locale
        // extra keys
        item._synced_at = time
        item = merge(item, item.data)
        delete item.data
        delete item.content_type_uid
        break
      case 'entry_unpublished':
        item._content_type_uid = item.content_type_uid
        item.type = config.contentstack.actions.unpublish
        item = merge(item, item.data)
        delete item.data
        delete item.content_type_uid
        break
      case 'entry_deleted':
        item._content_type_uid = item.content_type_uid
        item.type = config.contentstack.actions.delete
        item = merge(item, item.data)
        delete item.data
        delete item.content_type_uid
        break
      case 'content_type_deleted':
        item.type = config.contentstack.actions.delete
        item.uid = item.content_type_uid
        item._content_type_uid = formattedContentType
        delete item.content_type_uid
        break
      default:
        break
    }
  })

  return items
}

/**
 * @description Add's checkpoint data on the last item found on the 'SYNC API items' collection
 * @param {Object} groupedItems - Grouped items { groupItems(items) - see above } referred by their content type
 * @param {Object} syncResponse - SYNC API's response
 */
export const markCheckpoint = (groupedItems, syncResponse) => {
  const tokenName = (syncResponse.pagination_token) ? 'pagination_token' : 'sync_token'
  const tokenValue = syncResponse[tokenName]
  const contentTypeUids = Object.keys(groupedItems)
  if (contentTypeUids.length === 1 && contentTypeUids[0] === '_assets') {
    debug(`Only assets found in SYNC API response. Last content type is ${contentTypeUids[0]}`)
    const items = groupedItems[contentTypeUids[0]]
    // find the last item, add checkpoint to it
    items[items.length - 1]._checkpoint = {
      name: tokenName,
      token: tokenValue,
    }
  } else if (contentTypeUids.length === 1 && contentTypeUids[0] === '_content_types') {
    debug(`Only content type events found in SYNC API response. Last content type is ${contentTypeUids[0]}`)
    const items = groupedItems[contentTypeUids[0]]
    // find the last item, add checkpoint to it
    items[items.length - 1]._checkpoint = {
      name: tokenName,
      token: tokenValue,
    }
  } else if (contentTypeUids.length === 2 && (contentTypeUids.indexOf('_assets') !== -1 && contentTypeUids.indexOf(
      '_content_types'))) {
        debug(`Assets & content types found found in SYNC API response. Last content type is ${contentTypeUids[1]}`)
        const items = groupedItems[contentTypeUids[1]]
        // find the last item, add checkpoint to it
        items[items.length - 1]._checkpoint = {
          name: tokenName,
          token: tokenValue,
        }
  } else {
    const lastContentTypeUid = contentTypeUids[contentTypeUids.length - 1]
    debug(`Mixed content types found in SYNC API response. Last content type is ${lastContentTypeUid}`)
    const entries = groupedItems[lastContentTypeUid]
    entries[entries.length - 1]._checkpoint = {
      name: tokenName,
      token: tokenValue,
    }
  }

  return groupedItems
}

/**
 * @description Calcuates filename for ledger and unprocessible files
 * @param {String} file - File to be calculated on
 * @param {Function} rotate - File rotation logic (should return a string)
 * @returns {String} Returns path to a file
 */
export const getFile = (file, rotate) => {
  return new Promise((resolve, reject) => {
    const config = getConfig()
    if (existsSync(file)) {
      return stat(file, (statError, stats) => {
        if (statError) {
          return reject(statError)
        } else if (stats.isFile()) {
          if (stats.size > config.syncManager.maxsize) {
            file = rotate()
          }

          return resolve(file)
        } else {
          return reject(new Error(`${file} is not of type file`))
        }
      })
    } else {
      mkdirpSync(config.paths.unprocessibleDir)

      return resolve(file)
    }
  })
}

const findAssets = (parentEntry, key, schema, entry, bucket, isFindNotReplace) => {
  try {
    let matches, convertedText
    const isMarkdown = (schema.field_metadata.markdown) ? true: false
    if (isMarkdown) {
      convertedText = marked(entry)
    } else {
      convertedText = entry
    }
    const regexp = new RegExp('https://(assets|images).contentstack.io/v3/assets/(.*?)/(.*?)/(.*?)/(.*?)(?=")', 'g')
    while ((matches = regexp.exec(convertedText)) !== null) {
      if (matches && matches.length) {
        const assetObject: any = {}
        assetObject.url = matches[0]
        assetObject.uid = matches[3]
        assetObject.download_id = matches[4]

        if (isFindNotReplace) {
          // no point in adding an object, that has no 'url'
          // even if the 'asset' is found, we do not know its version
          bucket.push(assetObject)
        } else {
          const asset: any = find(bucket, (item) => {
            const newRegexp = new RegExp('https://(assets|images).contentstack.io/v3/assets/(.*?)/(.*?)/(.*?)/(.*?)(.*)', 'g')
            let urlparts
            while ((urlparts = newRegexp.exec(item.url)) !== null) {

              return item.download_id === urlparts[4]
            }
            return undefined
          })
          if (typeof asset !== 'undefined') {
            if (isMarkdown) {
              parentEntry[key] = parentEntry[key].replace(assetObject.url, `${encodeURI(asset._internal_url)}\\n`)
            } else {
              parentEntry[key] = parentEntry[key].replace(assetObject.url, encodeURI(asset._internal_url))
            }
          }
        }
      }
    }
  } catch (error) {
    logger.error(error)
  }
}

const iterate = (schema, entry, bucket, findNoteReplace, parentKeys) => {
  try {
    for (let index = 0; index < parentKeys.length; index++) {
      const parentKey = parentKeys[index]
      const subEntry = entry[parentKey]

      if (subEntry && !(isEmpty(subEntry)) && index === (parentKeys.length - 1)) {
        if (subEntry && subEntry instanceof Array && subEntry.length) {
          subEntry.forEach((subEntryItem, idx) => {
            // tricky!
            if (!(isEmpty(subEntryItem))) {
              findAssets(subEntry, idx, schema, subEntryItem, bucket, findNoteReplace) 
            }
            // iterate(schema, subEntryItem, bucket, findNoteReplace, parentKeys)
          })

          return
        } else if (entry !== undefined)  {
          findAssets(entry, parentKey, schema, subEntry, bucket, findNoteReplace)
          return 
        }
      } else if (subEntry !== undefined) {
        const subKeys = cloneDeep(parentKeys).splice(index)

        if (subEntry && subEntry instanceof Array && subEntry.length) {
          subEntry.forEach((subEntryItem) => {
            iterate(schema, subEntryItem, bucket, findNoteReplace, cloneDeep(subKeys))
          })

          return
        } else {
          iterate(schema, subEntry, bucket, findNoteReplace, subKeys)
          return 
        }
      }
    }
  } catch (error) {
    logger.error(error)
  }
}

export const getOrSetRTEMarkdownAssets = (schema, entry, bucket = [], isFindNotReplace, parent = []) => {
  for (let i = 0, _i = schema.length; i < _i; i++) {
    if (schema[i].data_type === 'text' && schema[i].field_metadata && (schema[i].field_metadata.allow_rich_text || schema[i].field_metadata.markdown)) {
      parent.push(schema[i].uid)
      iterate(schema[i], entry, bucket, isFindNotReplace, parent)
      parent.pop()
    } else if (schema[i].data_type === 'group') {
      parent.push(schema[i].uid)
      getOrSetRTEMarkdownAssets(schema[i].schema, entry, bucket, isFindNotReplace, parent)
      parent.pop()
    } else if (schema[i].data_type === 'blocks') {
      for (let j = 0, _j = schema[i].blocks.length; j < _j; j++) {
        parent.push(schema[i].uid)
        parent.push(schema[i].blocks[j].uid)
        getOrSetRTEMarkdownAssets(schema[i].blocks[j].schema, entry, bucket, isFindNotReplace, parent)
        parent.pop()
        parent.pop()
      }
    }
  }

  if (isFindNotReplace) {
    return bucket
  }
  return entry
}

export const normalizePluginPath = (config, plugin, isInternal) => {
  let pluginPath
  if (plugin.path && typeof plugin.path === 'string' && plugin.path.length > 0) {
    if (isAbsolute(plugin.path)) {
      if (!existsSync(plugin.path)) {
        throw new Error(`${plugin.path} does not exist!`)
      }

      return plugin.path
    }

    pluginPath = resolve(join(config.paths.baseDir, plugin.name, 'index.js'))

    if (!existsSync(pluginPath)) {
      throw new Error(`${pluginPath} does not exist!`)
    }

    return pluginPath
  }

  if (isInternal) {
    pluginPath = join(__dirname, '..', 'plugins', plugin.name.slice(13), 'index.js')

    if (existsSync(pluginPath)) {
      return pluginPath
    }
  }

  pluginPath = resolve(join(config.paths.plugin, plugin.name, 'index.js'))

  if (!existsSync(pluginPath)) {
    throw new Error(`Unable to find plugin: ${JSON.stringify(plugin)}`)
  }

  return pluginPath
}
