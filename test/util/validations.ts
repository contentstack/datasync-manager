import { cloneDeep, merge } from 'lodash'
import { config as internalConfig } from '../../src/config'
import { buildConfigPaths } from '../../src/util/build-paths'
import { setLogger } from '../../src/util/logger'

import {
  validateConfig,
  validateItemStructure,
  validateListener,
  validateLogger,
} from '../../src/util/validations'

import { item as deletedAsset } from '../dummy/api-responses/delete-asset'
import { item as deletedContentType } from '../dummy/api-responses/delete-content-type'
import { item as deletedEntry } from '../dummy/api-responses/delete-entry'
import { item as publishedAsset } from '../dummy/api-responses/publish-asset'
import { item as publishedEntry } from '../dummy/api-responses/publish-entry'
import { item as unpublishedAsset } from '../dummy/api-responses/unpublish-asset'
import { item as unpublishedEntry } from '../dummy/api-responses/unpublish-entry'

import { config } from '../dummy/config'
import { /* assetConnector, contentConnector,  */listener } from '../dummy/connector-listener-instances'

describe('validations', () => {
  beforeAll(() => {
    setLogger()
  })
  describe('validate config for errors', () => {
    test('contentstack config key is undefined', () => {
      const configs: any = cloneDeep(merge({}, internalConfig, config))
      configs.paths = buildConfigPaths()
      delete configs.contentstack
      expect(() => {
        validateConfig(configs)
      }).toThrowError(/^Config 'contentstack' key cannot be undefined$/)
    })

    test('config contentstack does not have required - apiKey', () => {
      const configs: any = cloneDeep(merge({}, internalConfig, config))
      configs.paths = buildConfigPaths()
      configs.contentstack = {}
      expect(() => {
        validateConfig(configs)
      }).toThrowError(/^Config 'contentstack' should be of type object and have 'apiKey' and 'token'$/)
    })

    test('config contentstack does not have required - token', () => {
      const configs: any = cloneDeep(merge({}, internalConfig, config))
      configs.paths = buildConfigPaths()
      delete configs.contentstack.deliveryToken
      expect(() => {
        validateConfig(configs)
      }).toThrowError(/^Config 'contentstack' should be of type object and have 'apiKey' and 'token'$/)
    })
  })

  describe('validate instance methods', () => {

    test('listener does not have register()', () => {
      const listenerClone = cloneDeep(listener)
      delete listenerClone.register
      expect(() => {
        validateListener(listenerClone)
      }).toThrowError("Missing required methods! Listener is missing 'register()'!")
    })

    test('custom logger', () => {
      // tslint:disable-next-line: no-empty
      // const logger = () => {}
      function logger () {}
      // tslint:disable-next-line: no-empty
      logger.prototype.info = () => {}
      // tslint:disable-next-line: no-empty
      logger.prototype.warn = () => {}
      // tslint:disable-next-line: no-empty
      logger.prototype.log = () => {}
      // tslint:disable-next-line: no-empty
      logger.prototype.error = () => {}
      // tslint:disable-next-line: no-empty
      logger.prototype.debug = () => {}
      const loggerInstance = new logger()
      expect(validateLogger(loggerInstance)).toEqual(true)
    })
  })

  describe('asset: content structure testing', () => {
    test('proper: asset publish structure', () => {
      expect(validateItemStructure(publishedAsset)).toEqual(true)
    })
    test('improper: asset publish structure', () => {
      const publishedAssetClone = cloneDeep(publishedAsset)
      delete publishedAssetClone.content_type_uid
      expect(validateItemStructure(publishedAssetClone)).toEqual(false)
    })

    test('asset unpublish structure', () => {
      expect(validateItemStructure(unpublishedAsset)).toEqual(true)
    })
    test('improper: asset unpublish structure', () => {
      const unpublishedAssetClone = cloneDeep(unpublishedAsset)
      delete unpublishedAssetClone.content_type_uid
      expect(validateItemStructure(unpublishedAssetClone)).toEqual(false)
    })

    test('asset delete structure', () => {
      expect(validateItemStructure(deletedAsset)).toEqual(true)
    })
    test('improper: asset delete structure', () => {
      const deletedAssetClone = cloneDeep(deletedAsset)
      delete deletedAssetClone.content_type_uid
      expect(validateItemStructure(deletedAssetClone)).toEqual(false)
    })
  })

  describe('entry: content structure testing', () => {
    test('proper: entry publish structure', () => {
      expect(validateItemStructure(publishedEntry)).toEqual(true)
    })
    test('improper: entry publish structure', () => {
      const publishedEntryClone = cloneDeep(publishedEntry)
      delete publishedEntryClone.content_type_uid
      expect(validateItemStructure(publishedEntryClone)).toEqual(false)
    })

    test('entry unpublish structure', () => {
      expect(validateItemStructure(unpublishedEntry)).toEqual(true)
    })
    test('improper: entry unpublish structure', () => {
      const unpublishedEntryClone = cloneDeep(unpublishedEntry)
      delete unpublishedEntryClone.content_type_uid
      expect(validateItemStructure(unpublishedEntryClone)).toEqual(false)
    })

    test('entry delete structure', () => {
      expect(validateItemStructure(deletedEntry)).toEqual(true)
    })
    test('improper: entry delete structure', () => {
      const deletedEntryClone = cloneDeep(deletedEntry)
      delete deletedEntryClone.content_type_uid
      expect(validateItemStructure(deletedEntryClone)).toEqual(false)
    })
  })

  describe('content type: content structure testing', () => {
    test('proper: content_type delete structure', () => {
      expect(validateItemStructure(deletedContentType)).toEqual(true)
    })
    test('improper: content_type delete structure', () => {
      delete deletedContentType.content_type_uid
      expect(validateItemStructure(deletedContentType)).toEqual(false)
    })
    test('improper: object structure', () => {
      delete deletedContentType.type
      expect(validateItemStructure(deletedContentType)).toEqual(false)
    })

  })
})
