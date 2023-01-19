/*!
 * Contentstack DataSync Manager
 * Copyright (c) 2019 Contentstack LLC
 * MIT Licensed
 */

import Debug from 'debug'
import {
  cloneDeep,
  find,
  isEmpty,
  map,
  merge,
  remove,
} from 'lodash'
import marked from 'marked'
import {
  isAbsolute,
  join,
  resolve,
} from 'path'
import {
  getConfig,
} from '../index'
import {
  existsSync,
  mkdirpSync,
  stat,
} from './fs'
import {
  logger,
} from './logger'
import {
  saveFilteredItems,
} from './unprocessible'
import {
  validateItemStructure,
} from './validations'

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
  const locales = map(config.locales, 'code')
  const filteredObjects = remove(response.items, (item) => {
    // validate item structure. If the structure is not as expected, filter it out
    if (!(validateItemStructure(item))) {

      return item
    }
    // To handle content-type.
    if (!(item as any).data) {
      return false;
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
    return
  }

  // do something with filteredObjects
  let name
  if (response.pagination_token) {
    name = 'pagination_token'
  } else {
    name = 'sync_token'
  }

  await saveFilteredItems(filteredObjects, name, response[name])

  return
}

export const formatSyncFilters = (config) => {
  if (config.syncManager.filters && typeof config.syncManager.filters === 'object') {
    const filters = config.syncManager.filters
    for (const filter in filters) {
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
    } else {
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
  for (let i = 0, j = items.length; i < j; i++) {
    switch (items[i].type) {
      case 'asset_published':
        delete items[i].type
        items[i]._content_type_uid = formattedAssetType
        items[i]._type = config.contentstack.actions.publish
        // extra keys
        items[i]._synced_at = time
        items[i] = merge(items[i], items[i].data)
        items[i].locale = items[i].data.publish_details.locale
        break
      case 'asset_unpublished':
        delete items[i].type
        items[i]._content_type_uid = formattedAssetType
        items[i]._type = config.contentstack.actions.unpublish
        items[i] = merge(items[i], items[i].data)
        break
      case 'asset_deleted':
        delete items[i].type
        items[i]._content_type_uid = formattedAssetType
        items[i]._type = config.contentstack.actions.delete
        items[i] = merge(items[i], items[i].data)
        break
      case 'entry_published':
        delete items[i].type
        items[i]._type = config.contentstack.actions.publish
        items[i]._content_type_uid = items[i].content_type_uid
        // extra keys
        items[i]._synced_at = time
        items[i] = merge(items[i], items[i].data)
        items[i].locale = items[i].data.publish_details.locale
        break
      case 'entry_unpublished':
        delete items[i].type
        items[i]._content_type_uid = items[i].content_type_uid
        items[i]._type = config.contentstack.actions.unpublish
        items[i] = merge(items[i], items[i].data)
        break
      case 'entry_deleted':
        delete items[i].type
        items[i]._content_type_uid = items[i].content_type_uid
        items[i]._type = config.contentstack.actions.delete
        items[i] = merge(items[i], items[i].data)
        break
      case 'content_type_deleted':
        delete items[i].type
        items[i]._type = config.contentstack.actions.delete
        items[i].uid = items[i].content_type_uid
        items[i]._content_type_uid = formattedContentType
        break
      default:
        logger.error('Item\'s type did not match any expected case!!')
        logger.error(JSON.stringify(items[i]))
        // remove the element from items[i]s
        items[i].splice(i, 1)
        i--
        break
      }
  }

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
  // tslint:disable-next-line: no-shadowed-variable
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
    const { contentstack } = getConfig()
    const isMarkdown = (schema.field_metadata.markdown) ? true : false
    let matches
    let convertedText
    if (isMarkdown) {
      convertedText = marked.marked(entry)
    } else {
      convertedText = entry
    }

    // tslint:disable-next-line: max-line-length
    const regexp = new RegExp(contentstack.regexp.rte_asset_pattern_1.url, contentstack.regexp.rte_asset_pattern_1.options)
    // tslint:disable-next-line: no-conditional-assignment
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
            // tslint:disable-next-line: max-line-length
            const newRegexp = new RegExp(contentstack.regexp.rte_asset_pattern_2.url, contentstack.regexp.rte_asset_pattern_2.options)
            let urlparts
            // tslint:disable-next-line: no-conditional-assignment
            while ((urlparts = newRegexp.exec(item.url)) !== null) {

              return assetObject.download_id === urlparts[4]
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
        if (subEntry instanceof Array && subEntry.length) {
          subEntry.forEach((subEntryItem, idx) => {
            // tricky!
            if (!(isEmpty(subEntryItem))) {
              findAssets(subEntry, idx, schema, subEntryItem, bucket, findNoteReplace)
            }
            // iterate(schema, subEntryItem, bucket, findNoteReplace, parentKeys)
          })

          return
        } else if (entry !== undefined) {
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
  for (let i = 0, j = schema.length; i < j; i++) {
    if (schema[i].data_type === 'text' && schema[i].field_metadata && (schema[i].field_metadata.allow_rich_text ||
        schema[i].field_metadata.markdown)) {
      parent.push(schema[i].uid)
      iterate(schema[i], entry, bucket, isFindNotReplace, parent)
      parent.pop()
    } else if ((schema[i].data_type === 'group' || schema[i].data_type === 'global_field') && schema[i].schema) {
      parent.push(schema[i].uid)
      getOrSetRTEMarkdownAssets(schema[i].schema, entry, bucket, isFindNotReplace, parent)
      parent.pop()
    } else if (schema[i].data_type === 'blocks') {
      for (let k = 0, l = schema[i].blocks.length; k < l; k++) {
        parent.push(schema[i].uid)
        parent.push(schema[i].blocks[k].uid)
        getOrSetRTEMarkdownAssets(schema[i].blocks[k].schema, entry, bucket, isFindNotReplace, parent)
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

export const filterUnwantedKeys = (action, data) => {
  if (action === 'publish') {
    const contentStore = getConfig().contentStore
    switch (data._content_type_uid) {
      case '_assets':
        data = filterKeys(data, contentStore.unwanted.asset)
        break
      case '_content_types':
        data = filterKeys(data, contentStore.unwanted.contentType)
        break
      default:
        data = filterKeys(data, contentStore.unwanted.entry)
    }
  }

  return data
}

// TODO
// Add option to delete embedded documents
const filterKeys = (data, unwantedKeys) => {
  for (const key in unwantedKeys) {
    // We need _content_type for handling asset published/unpublished events in entry object (Wherever it is referenced).
    if (key === '_content_type') {
      continue;
    }
    if (unwantedKeys[key] && data.hasOwnProperty(key)) {
      delete data[key]
    }
  }

  return data
}

export const getSchema = (action, data) => {
  let schema
  if (action === 'publish' && data._content_type_uid !== '_assets') {
    schema = data._content_type
    schema._content_type_uid = '_content_types'
    schema.event_at = data.event_at
    schema._synced_at = data._synced_at
    schema.locale = data.locale
  }

  return { schema }
}
