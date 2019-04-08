import { cloneDeep, merge } from 'lodash'
import { setConfig } from '../../src'
import { config as internalConfig } from '../../src/defaults'
import { buildConfigPaths } from '../../src/util/build-paths'
import { buildContentReferences, filterItems, formatItems } from '../../src/util'
import { setLogger } from '../../src/util/logger'
import { config } from '../dummy/config'
import { response } from '../dummy/filter-items'
import { schema } from '../dummy/references-content-type' 
import { entry as inputEntry } from '../dummy/references-entry'
import { entry as outputEntry } from '../dummy/references-entry-expected'

const formattedAssetType = '_assets'
const conf: any = cloneDeep(merge({}, internalConfig, config))

describe('core-utilities', () => {
  beforeAll(() => {
    setLogger()
    conf.paths = buildConfigPaths()
  })

  describe('# Format items', () => {
    test('format items: asset publish', () => {
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
      const configs = cloneDeep(merge({}, internalConfig, config))
      const modifiedItems = [
        {
          action: configs.contentstack.actions.publish,
          content_type_uid:  formattedAssetType,
          data: {
            locale: 'en-us',
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
      expect(formatItems(items, configs)).toEqual(modifiedItems)
      // expect(items[0]).toEqual(modifiedItems[0])
    })

    test('asset unpublish should work without errors', () => {
      const items = [
        {
          data: {
            locale: 'en-us',
            uid: 'a1',
          },
          type: 'asset_unpublished',
        },
      ]

      const configs = cloneDeep(merge({}, internalConfig, config))
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
      expect(formatItems(items, configs)).toEqual(modifiedItems)
      // expect(items[0]).toEqual(modifiedItems[0])
    })

    test('asset delete should work without errors', () => {
      const items = [
        {
          data: {
            locale: 'en-us',
            uid: 'a1',
          },
          type: 'asset_deleted',
        },
      ]

      const configs = cloneDeep(merge({}, internalConfig, config))
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
      expect(formatItems(items, configs)).toEqual(modifiedItems)
      // expect(items[0]).toEqual(modifiedItems[0])
    })

    test('entry publish should work without errors', () => {
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
      const configs = cloneDeep(merge({}, internalConfig, config))
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
      expect(formatItems(items, configs)).toEqual(modifiedItems)
      // expect(items[0]).toEqual(modifiedItems[0])
    })

    test('entry unpublish should work without errors', () => {
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
      const configs = cloneDeep(merge({}, internalConfig, config))
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
      expect(formatItems(items, configs)).toEqual(modifiedItems)
      // expect(items[0]).toEqual(modifiedItems[0])
    })

    test('entry delete should work without errors', () => {
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
      const configs = cloneDeep(merge({}, internalConfig, config))
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
      expect(formatItems(items, configs)).toEqual(modifiedItems)
      // expect(items[0]).toEqual(modifiedItems[0])
    })
  })

  describe('filter items', () => {
    test('process filtered items (pagination_token)', () => {
      const resp: any = cloneDeep(response)
      // add an item locale that does not exist
      const item = cloneDeep(resp.items[0])
      item.data.publish_details.locale = 'abcd'
      resp.items.push(item)
      setConfig(conf)

      return filterItems(resp, conf).then((output) => {
        expect(output).toBeUndefined()
      }).catch((error) => {
        expect(error).toBeNull()
      })
    })
  })

  describe('buildContentReferences', () => {
    test('building entry references should work without errors', () => {
      expect(buildContentReferences(schema, inputEntry, [])).toEqual(outputEntry)
    })
  })
})
