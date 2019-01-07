import { merge } from 'lodash'
import { config as internalConfig } from '../../src/defaults'
import { formatItems } from '../../src/util/core-utilities'
import { config } from '../dummy/config'

test('Format items asset publish should work without errors', () => {
  const items = [
    {
      data: {
        publish_details: {
          locale: 'en-us',
        },
        uid: 'a1',
      },
      type: 'asset_published',
    },
  ]
  const formattedAssetType = '_assets'
  const configs = merge({}, internalConfig, config)
  const modifiedItems = [
    {
      action: configs.contentstack.actions.publish,
      content_type_uid:  formattedAssetType,
      data: {
        publish_details: {
          locale: 'en-us',
        },
        uid: 'a1',
      },
      locale: items[0].data.publish_details.locale,
      type: 'asset_published',
      uid: items[0].data.uid,
    },
  ]
  expect(formatItems(items, configs)).toBeUndefined()
  expect(items[0]).toEqual(modifiedItems[0])
})

test('Format items asset unpublish should work without errors', () => {
  const items = [
    {
      data: {
        locale: 'en-us',
        uid: 'a1',
      },
      type: 'asset_unpublished',
    },
  ]
  const formattedAssetType = '_assets'
  const configs = merge({}, internalConfig, config)
  const modifiedItems = [
    {
      action: configs.contentstack.actions.unpublish,
      content_type_uid:  formattedAssetType,
      data: {
        locale: 'en-us',
        uid: 'a1',
      },
      locale: items[0].data.locale,
      type: 'asset_unpublished',
      uid: items[0].data.uid,
    },
  ]
  expect(formatItems(items, configs)).toBeUndefined()
  expect(items[0]).toEqual(modifiedItems[0])
})

test('Format items asset delete should work without errors', () => {
  const items = [
    {
      data: {
        locale: 'en-us',
        uid: 'a1',
      },
      type: 'asset_deleted',
    },
  ]
  const formattedAssetType = '_assets'
  const configs = merge({}, internalConfig, config)
  const modifiedItems = [
    {
      action: configs.contentstack.actions.delete,
      content_type_uid:  formattedAssetType,
      data: {
        locale: 'en-us',
        uid: 'a1',
      },
      locale: items[0].data.locale,
      type: 'asset_deleted',
      uid: items[0].data.uid,
    },
  ]
  expect(formatItems(items, configs)).toBeUndefined()
  expect(items[0]).toEqual(modifiedItems[0])
})

test('Format items entry publish should work without errors', () => {
  const items = [
    {
      content_type_uid: 'ct1',
      data: {
        publish_details: {
          locale: 'en-us',
        },
        uid: 'e1',
      },
      type: 'entry_published',
    },
  ]
  const configs = merge({}, internalConfig, config)
  const modifiedItems = [
    {
      action: configs.contentstack.actions.publish,
      content_type_uid:  'ct1',
      data: {
        publish_details: {
          locale: 'en-us',
        },
        uid: 'e1',
      },
      locale: items[0].data.publish_details.locale,
      type: 'entry_published',
      uid: items[0].data.uid,
    },
  ]
  expect(formatItems(items, configs)).toBeUndefined()
  expect(items[0]).toEqual(modifiedItems[0])
})

test('Format items entry unpublish should work without errors', () => {
  const items = [
    {
      content_type_uid: 'ct1',
      data: {
        locale: 'en-us',
        uid: 'e1',
      },
      type: 'entry_unpublished',
    },
  ]
  const configs = merge({}, internalConfig, config)
  const modifiedItems = [
    {
      action: configs.contentstack.actions.unpublish,
      content_type_uid:  'ct1',
      data: {
        locale: 'en-us',
        uid: 'e1',
      },
      locale: items[0].data.locale,
      type: 'entry_unpublished',
      uid: items[0].data.uid,
    },
  ]
  expect(formatItems(items, configs)).toBeUndefined()
  expect(items[0]).toEqual(modifiedItems[0])
})

test('Format items entry delete should work without errors', () => {
  const items = [
    {
      content_type_uid: 'ct1',
      data: {
        locale: 'en-us',
        uid: 'e1',
      },
      type: 'entry_deleted',
    },
  ]
  const configs = merge({}, internalConfig, config)
  const modifiedItems = [
    {
      action: configs.contentstack.actions.delete,
      content_type_uid:  'ct1',
      data: {
        locale: 'en-us',
        uid: 'e1',
      },
      locale: items[0].data.locale,
      type: 'entry_deleted',
      uid: items[0].data.uid,
    },
  ]
  expect(formatItems(items, configs)).toBeUndefined()
  expect(items[0]).toEqual(modifiedItems[0])
})
