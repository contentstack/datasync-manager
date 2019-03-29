import { cloneDeep, merge } from 'lodash'
import { config as internalConfig } from '../../src/defaults'
import { buildConfigPaths } from '../../src/util/build-paths'
import { setLogger } from '../../src/util/logger'

import {
  validateAssetConnector,
  validateConfig,
  validateContentConnector,
  validateInstances,
  validateItemStructure,
  validateListener,
  validateLogger
} from '../../src/util/validations'

import { item as publishedAsset } from '../dummy/api-responses/publish-asset'
import { item as unpublishedAsset } from '../dummy/api-responses/unpublish-asset'
import { item as deletedAsset } from '../dummy/api-responses/delete-asset'
import { item as publishedEntry } from '../dummy/api-responses/publish-entry'
import { item as unpublishedEntry } from '../dummy/api-responses/unpublish-entry'
import { item as deletedEntry } from '../dummy/api-responses/delete-entry'
import { item as deletedContentType } from '../dummy/api-responses/delete-content-type'

import { config } from '../dummy/config'
import { assetConnector, contentConnector, listener } from '../dummy/connector-listener-instances'

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

  describe('validate instances', () => {
    test('asset connector is not defined', () => {
      expect(() => {
        validateInstances(undefined, contentConnector, listener)
        // Question: Why 'regex' does not work here?
      }).toThrowError("Call 'setAssetStore()' before calling sync-manager start!")
    })

    test('content connector is not defined', () => {
      expect(() => {
        validateInstances(assetConnector, undefined, listener)
      }).toThrowError("Call 'setContentStore()' before calling sync-manager start!")
    })

    test('listener is not defined', () => {
      expect(() => {
        validateInstances(assetConnector, contentConnector, undefined)
      }).toThrowError("Call 'setListener()' before calling sync-manager start!")
    })

    test('asset connector does not have start()', () => {
      const assetConnectorClone = cloneDeep(assetConnector)
      delete assetConnectorClone.start
      expect(() => {
        validateInstances(assetConnectorClone, contentConnector, listener)
      }).toThrowError("Connector and listener instances should have 'start()' method")
    })

    test('content connector does not have start()', () => {
      const contentConnectorClone = cloneDeep(contentConnector)
      delete contentConnectorClone.start
      expect(() => {
        validateInstances(assetConnector, contentConnectorClone, listener)
      }).toThrowError("Connector and listener instances should have 'start()' method")
    })

    test('listener does not have start()', () => {
      const listenerClone = cloneDeep(listener)
      delete listenerClone.start
      expect(() => {
        validateInstances(assetConnector, contentConnector, listenerClone)
      }).toThrowError("Connector and listener instances should have 'start()' method")
    })

    test('listener start() is not a funciton', () => {
      const listenerClone = cloneDeep(listener)
      listenerClone.start = ({} as any)
      expect(() => {
        validateInstances(assetConnector, contentConnector, listenerClone)
      }).toThrowError("Connector and listener instances should have 'start()' method")
    })
  })

  describe('validate instance methods', () => {
    test('asset connector does not have download()', () => {
      const assetConnectorClone = cloneDeep(assetConnector)
      delete assetConnectorClone.download
      expect(() => {
        validateAssetConnector(assetConnectorClone)
      }).toThrowError(`${assetConnectorClone} asset store does not support 'download()'`)
    })

    test('content connector does not have publish()', () => {
      const contentConnectorClone = cloneDeep(contentConnector)
      delete contentConnectorClone.publish
      expect(() => {
        validateContentConnector(contentConnectorClone)
      }).toThrowError(`${contentConnectorClone} content store does not support 'publish()'`)
    })

    test('listener does not have register()', () => {
      const listenerClone = cloneDeep(listener)
      delete listenerClone.register
      expect(() => {
        validateListener(listenerClone)
      }).toThrowError(`${listenerClone} listener does not support 'register()'`)
    })

    test('custom logger', () => {
      function logger() {}
      logger.prototype.info = () => {}
      logger.prototype.warn = () => {}
      logger.prototype.log = () => {}
      logger.prototype.error = () => {}
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
