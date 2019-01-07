/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

import { map, remove } from 'lodash'
import { saveFilteredItems } from './log/filteredItems'
import { parse } from './parse'
import { stringify } from './stringify'

const formattedAssetType = '_assets'
const formattedContentType = '_content_types'
const assetType = 'sys_assets'

export const filterItems = async (response, config) => {
  return new Promise((resolve, reject) => {
    try {
      const locales = map(config.locales, 'code')
      const filteredObjects = remove(response.items, (item) => {
        if ((item as any).data.publish_details) {
          return locales.indexOf((item as any).data.publish_details.locale) === -1
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

      return saveFilteredItems(filteredObjects, name, response[name], config.paths)
        .then(resolve).catch(reject)
    } catch (error) {
      return reject(error)
    }
  })
}

export const groupItems = (items) => {
  const bucket = {}
  items.forEach((item) => {
    if (item.content_type_uid === assetType) {
      item.content_type_uid = formattedAssetType
    }
    if (bucket.hasOwnProperty(item.content_type_uid)) {
      bucket[item.content_type_uid].push(item)
    } else  {
      bucket[item.content_type_uid] = [item]
    }
  })

  return bucket
}

export const formatItems = (items, config) => {
  const deletedContentTypes = []
  items.forEach((item) => {
    switch (item.type) {
      case 'asset_published':
        item.content_type_uid = formattedAssetType
        item.action = config.contentstack.actions.publish
        item.locale = item.data.publish_details.locale
        item.uid = item.data.uid
        break
      case 'asset_unpublished':
        item.content_type_uid = formattedAssetType
        item.action = config.contentstack.actions.unpublish
        item.locale = item.data.locale
        item.uid = item.data.uid
        break
      case 'asset_deleted':
        item.content_type_uid = formattedAssetType
        item.action = config.contentstack.actions.delete
        item.locale = item.data.locale
        item.uid = item.data.uid
        break
      case 'entry_published':
        item.action = config.contentstack.actions.publish
        item.locale = item.data.publish_details.locale
        item.uid = item.data.uid
        break
      case 'entry_unpublished':
        item.action = config.contentstack.actions.unpublish
        item.locale = item.data.locale
        item.uid = item.data.uid
        break
      case 'entry_deleted':
        item.action = config.contentstack.actions.delete
        item.locale = item.data.locale
        item.uid = item.data.uid
        break
      case 'content_type_deleted':
        const locales = map(config.locales, 'code')
        locales.forEach((locale) => {
          const clonedItem = parse(stringify(item))
          clonedItem.action = config.contentstack.actions.delete
          clonedItem.locale = locale
          clonedItem.uid = clonedItem.content_type_uid
          clonedItem.content_type_uid = formattedContentType
          deletedContentTypes.push(clonedItem)
        })
        break
      default:
        break
    }
  })
  // remove deleted content types
  remove(items, (item: any) => {
    return item.type === 'content_type_deleted'
  })
  items.concat(deletedContentTypes)
}

export const markCheckpoint = (groupedItems, syncResponse) => {
  const tokenName = (syncResponse.pagination_token) ? 'pagination_token' : 'sync_token'
  const tokenValue = syncResponse[tokenName]
  const contentTypeUids = Object.keys(groupedItems)
  if (contentTypeUids.length === 1 && contentTypeUids[0] === '_assets') {
    const items = groupedItems[contentTypeUids[0]]
    // find the last item, add checkpoint to it
    items[items.length - 1].checkpoint = {
      name: tokenName,
      token: tokenValue,
    }

    return
  } else if (contentTypeUids.length === 1 && contentTypeUids[0] === '_content_types') {
    const items = groupedItems[contentTypeUids[0]]
    // find the last item, add checkpoint to it
    items[items.length - 1].checkpoint = {
      name: tokenName,
      token: tokenValue,
    }

    return
  } else if (contentTypeUids.length === 2 && (contentTypeUids.indexOf('_assets') !== -1 && contentTypeUids.indexOf(
      '_content_types'))) {
        const items = groupedItems[contentTypeUids[1]]
        // find the last item, add checkpoint to it
        items[items.length - 1].checkpoint = {
          name: tokenName,
          token: tokenValue,
        }

        return
  }

  const lastContentTypeUid = contentTypeUids[contentTypeUids.length - 1]
  const entries = groupedItems[lastContentTypeUid]
  entries[entries.length - 1].checkpoint = {
    name: tokenName,
    token: tokenValue,
  }

  return
}
