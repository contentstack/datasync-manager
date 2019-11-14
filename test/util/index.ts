import { cloneDeep, merge } from 'lodash'
import { setConfig } from '../../src'
import { config as internalConfig } from '../../src/config'
import { filterItems, formatItems } from '../../src/util'
import { buildConfigPaths } from '../../src/util/build-paths'
import { setLogger } from '../../src/util/logger'
import { config } from '../dummy/config'
import { response } from '../dummy/filter-items'

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
          action: 'publish',
          content_type_uid: 'sys_assets',
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

      const formattedItem = formatItems(items, configs)[0]
      expect(formattedItem).toHaveProperty('_content_type_uid')
      // expect(formattedItem).not.toHaveProperty('content_type_uid')
      expect(formattedItem).toHaveProperty('_synced_at')
      expect(formattedItem).toHaveProperty('action')
    })

    test('asset unpublish should work without errors', () => {
      const items = [
        {
          action: 'unpublish',
          content_type_uid: 'sys_assets',
          data: {
            locale: 'en-us',
            uid: 'a1',
          },
          type: 'asset_unpublished',
        },
      ]

      const configs = cloneDeep(merge({}, internalConfig, config))
      const formattedItem = formatItems(items, configs)[0]
      expect(formattedItem).toHaveProperty('_content_type_uid')
      // expect(formattedItem).not.toHaveProperty('content_type_uid')
      expect(formattedItem).toHaveProperty('action')
    })

    test('asset delete should work without errors', () => {
      const items = [
        {
          action: 'delete',
          content_type_uid: 'sys_assets',
          data: {
            locale: 'en-us',
            uid: 'a1',
          },
          type: 'asset_deleted',
        },
      ]

      const configs = cloneDeep(merge({}, internalConfig, config))
      const formattedItem = formatItems(items, configs)[0]
      expect(formattedItem).toHaveProperty('_content_type_uid')
      // expect(formattedItem).not.toHaveProperty('content_type_uid')
      expect(formattedItem).toHaveProperty('action')
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
          // tslint:disable-next-line: object-literal-sort-keys
          action: 'publish',
          type: 'entry_published',
        },
      ]
      const configs = cloneDeep(merge({}, internalConfig, config))
      const formattedItem = formatItems(items, configs)[0]
      expect(formattedItem).toHaveProperty('_content_type_uid')
      // expect(formattedItem).not.toHaveProperty('content_type_uid')
      expect(formattedItem).toHaveProperty('_synced_at')
      expect(formattedItem).toHaveProperty('action')
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
      const formattedItem = formatItems(items, configs)[0]
      expect(formattedItem).toHaveProperty('_content_type_uid')
      // expect(formattedItem).not.toHaveProperty('content_type_uid')
    })

    test('entry delete should work without errors', () => {
      const items = [
        {
          action: 'delete',
          content_type_uid: 'ct1',
          data: {
            locale: 'en-us',
            uid: 'e1',
          },
          type: 'entry_deleted',
        },
      ]
      const configs = cloneDeep(merge({}, internalConfig, config))
      const formattedItem = formatItems(items, configs)[0]
      expect(formattedItem).toHaveProperty('_content_type_uid')
      // expect(formattedItem).not.toHaveProperty('content_type_uid')
      expect(formattedItem).toHaveProperty('action')
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
})
