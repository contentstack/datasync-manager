import { readFileSync } from 'fs'
import { cloneDeep, merge } from 'lodash'
import nock from 'nock'
import { join } from 'path'
import { get } from '../src/api'
import { setAssetStore, setConfig, setContentStore, setListener, start } from '../src'
import { config as internalConfig } from '../src/config'
import { setLogger } from '../src/util/logger'
import { contentType as contentTypeSchema } from './dummy/api-responses/content-type'
import { response as deleteResponse } from './dummy/api-responses/delete'
import { response as emptyResponse } from './dummy/api-responses/empty'
import { response as mixedUnpublishResponse } from './dummy/api-responses/entries'
import { contentType as rteSchema } from './dummy/api-responses/markdown-content-type'
import { response as rteEntries } from './dummy/api-responses/markdown-entries'
import { response as publishResponse } from './dummy/api-responses/publish'
import { contentType as referenceSchema } from './dummy/api-responses/references-content-type'
import { contentType as reference2Schema } from './dummy/api-responses/references-content-type-2'
import { response as referencesEntries } from './dummy/api-responses/references-entries'
import { config as testConfig } from './dummy/config'
import { assetConnector, contentConnector, listener } from './dummy/connector-listener-instances'
import { response as contentTypeWithGlobalFieldResponse } from './dummy/api-responses/global-field'

const packageInfo: any = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'))

describe('core', () => {
  beforeAll(() => {
    setLogger()
  })

  beforeEach(() => {
    nock('https://api.localhost.io', { reqheaders: {
      'access_token': 'dummyDeliveryToken',
      'api_key': 'dummyApiKey',
      'x-user-agent': `datasync-manager/v${packageInfo.version}`,
    }})
      .get('/v3/stacks/sync/publish-success')
      .query({sync_token: 'dummySyncToken', environment: 'test', limit: 100})
      .reply(200, publishResponse)
  })

  beforeEach(() => {
    nock('https://api.localhost.io', { reqheaders: {
      'access_token': 'dummyDeliveryToken',
      'api_key': 'dummyApiKey',
      'x-user-agent': `datasync-manager/v${packageInfo.version}`,
    }})
      .get('/v3/stacks/sync')
      .query({pagination_token: 'publish-token', environment: 'test', limit: 100})
      .reply(200, emptyResponse)
  })

  beforeEach(() => {
    nock('https://api.localhost.io', { reqheaders: {
      'access_token': 'dummyDeliveryToken',
      'api_key': 'dummyApiKey',
      'x-user-agent': `datasync-manager/v${packageInfo.version}`,
    }})
      .get('/v3/stacks/sync/publish-success')
      .query({pagination_token: 'publish-token', environment: 'test', limit: 100})
      .reply(200, emptyResponse)
  })

  beforeEach(() => {
    nock('https://api.localhost.io', { reqheaders: {
      'access_token': 'dummyDeliveryToken',
      'api_key': 'dummyApiKey',
      'x-user-agent': `datasync-manager/v${packageInfo.version}`,
    }})
    // tslint:disable-next-line: max-line-length
    // "url": "https://api.localhost.io/v3/stacks/sync/publish-success?environment=test&limit=100&sync_token=dummySyncToken",

      .get('/v3/stacks/sync')
      .query({sync_token: 'dummySyncToken', environment: 'test', limit: 100})
      .reply(200, publishResponse)
  })

  beforeEach(() => {
    nock('https://api.localhost.io', { reqheaders: {
        'access_token': 'dummyDeliveryToken',
        'api_key': 'dummyApiKey',
        'x-user-agent': `datasync-manager/v${packageInfo.version}`,
      }})
        .get('/v3/stacks/sync/unpublish-success')
        .query({sync_token: 'dummySyncToken', environment: 'test', limit: 100})
        .reply(200, mixedUnpublishResponse)

  })

  beforeEach(() => {
    nock('https://api.localhost.io', { reqheaders: {
      'access_token': 'dummyDeliveryToken',
      'api_key': 'dummyApiKey',
      'x-user-agent': `datasync-manager/v${packageInfo.version}`,
    }})
      .get('/v3/stacks/sync/delete-success')
      .query({pagination_token: 'dummyPaginationToken', environment: 'test', limit: 100})
      .reply(200, deleteResponse)
  })

  beforeEach(() => {
    nock('https://api.localhost.io', { reqheaders: {
      'access_token': 'dummyDeliveryToken',
      'api_key': 'dummyApiKey',
      'x-user-agent': `datasync-manager/v${packageInfo.version}`,
    }})
      .get('/v3/stacks/sync/rte-success')
      .query({sync_token: 'dummyRTEToken', environment: 'test', limit: 100})
      .reply(200, rteEntries)
  })

  beforeEach(() => {
    nock('https://api.localhost.io', { reqheaders: {
      'access_token': 'dummyDeliveryToken',
      'api_key': 'dummyApiKey',
      'x-user-agent': `datasync-manager/v${packageInfo.version}`,
    }})
      .get('/v3/stacks/sync/references-success')
      .query({sync_token: 'dummyReferencesToken', environment: 'test', limit: 100})
      .reply(200, referencesEntries)
  })

  beforeEach(() => {
    nock('https://api.localhost.io', { reqheaders: {
      'access_token': 'dummyDeliveryToken',
      'api_key': 'dummyApiKey',
      'x-user-agent': `datasync-manager/v${packageInfo.version}`,
    }})
      .get('/v3/stacks/sync')
      .query({sync_token: 'dummySyncToken', environment: 'test', limit: 100})
      .reply(200, deleteResponse)
  })

  beforeEach(() => {
    nock('https://api.localhost.io')
      .get('/v3/content_types/authors')
      .query(true)
      .reply(200, contentTypeSchema)
  })

  beforeEach(() => {
    nock('https://api.localhost.io')
      .get('/v3/content_types/sample_three')
      .query(true)
      .reply(200, rteSchema)
  })

  beforeEach(() => {
    nock('https://api.localhost.io')
      .get('/v3/content_types/sample_fourt')
      .query(true)
      .reply(200, referenceSchema)
  })

  beforeEach(() => {
    nock('https://api.localhost.io')
      .get('/v3/content_types/references')
      .query(true)
      .reply(200, reference2Schema)
  })

  beforeEach(() => {
    nock('https://api.localhost.io')
      .get('/v3/stacks/sync/unpublish-success')
      .reply(200, publishResponse)
  })

  beforeEach(() => {
     nock('https://api.localhost.io',{
    reqheaders:{
      'access_token':'dummyDeliveryToken',
      'api_key':'dummyApiKey',
      'x-user-agent':`datasync-manager/v${packageInfo.version}`
    },
  })
    .get('/v3/content_types/test?include_global_field_schema=true')
    .reply(200,contentTypeWithGlobalFieldResponse)  

  })
 
  // afterEach((done) => {
  //   // wait 5 sec before continuing
  //   setTimeout(done, 5000)
  // })

  test('set content connector without errors', () => {
    expect(setContentStore((contentConnector as any))).toBeUndefined()
  })

  test('set asset connector without errors', () => {
    expect(setAssetStore((assetConnector as any))).toBeUndefined()
  })

  test('set listener without errors', () => {
    expect(setListener((listener as any))).toBeUndefined()
  })

  test('set config without errors', () => {
    expect(setConfig(testConfig)).toBeUndefined()
  })

  test('process mixed data without errors', async () => {
    const configs = cloneDeep(merge({}, internalConfig, testConfig))
    const contentstack = configs.contentstack
    contentstack.sync_token = 'dummySyncToken'
    contentstack.host = 'api.localhost.io'
    setContentStore((contentConnector as any))
    setAssetStore((assetConnector as any))
    setListener((listener as any))
    const status = (await start(configs))
    expect(status).toBeUndefined()
    // return start(configs).then((status) => {
    //   expect(status).toBeUndefined()
    // }).catch((error) => {
    //   expect(error).toBeNull()
    // })
  })

  test('process publish data without errors', async () => {
    const configs = cloneDeep(merge({}, internalConfig, testConfig))
    const contentstack = configs.contentstack
    contentstack.sync_token = 'dummySyncToken'
    contentstack.host = 'api.localhost.io'
    contentstack.apis.sync += '/publish-success'
    setContentStore((contentConnector as any))
    setAssetStore((assetConnector as any))
    setListener((listener as any))

    const status = (await start(configs))
    expect(status).toBeUndefined()
    // return start(configs).then((status) => {
    //   expect(status).toBeUndefined()
    // }).catch((error) => {
    //   expect(error).toBeNull()
    // })
  })

  test('process published RTE data without errors', async () => {
    const configs = cloneDeep(merge({}, internalConfig, testConfig))
    const contentstack = configs.contentstack
    contentstack.sync_token = 'dummyRTEToken'
    contentstack.host = 'api.localhost.io'
    contentstack.apis.sync += '/rte-success'
    setContentStore((contentConnector as any))
    setAssetStore((assetConnector as any))
    setListener((listener as any))

    const status = (await start(configs))
    expect(status).toBeUndefined()
    // return start(configs).then((status) => {
    //   expect(status).toBeUndefined()
    // }).catch((error) => {
    //   expect(error).toBeNull()
    // })
  })

  test('process published references data without errors', async () => {
    const configs = cloneDeep(merge({}, internalConfig, testConfig))
    const contentstack = configs.contentstack
    contentstack.sync_token = 'dummyReferencesToken'
    contentstack.host = 'api.localhost.io'
    contentstack.apis.sync += '/references-success'
    setContentStore((contentConnector as any))
    setAssetStore((assetConnector as any))
    setListener((listener as any))

    const status = (await start(configs))
    expect(status).toBeUndefined()
    // return start(configs).then((status) => {
    //   expect(status).toBeUndefined()
    // }).catch((error) => {
    //   expect(error).toBeNull()
    // })
  })

  test('process unpublish data without errors', async () => {
    const configs = cloneDeep(merge({}, internalConfig, testConfig))
    const contentstack = configs.contentstack
    contentstack.sync_token = 'dummySyncToken'
    contentstack.host = 'api.localhost.io'
    contentstack.apis.sync += '/unpublish-success'
    setContentStore((contentConnector as any))
    setAssetStore((assetConnector as any))
    setListener((listener as any))
    const status = (await start(configs))
    expect(status).toBeUndefined()
    // return start(configs).then((status) => {
    //   expect(status).toBeUndefined()
    // }).catch((error) => {
    //   expect(error).toBeNull()
    // })
  })

  test('process deleted data without errors', async () => {
    const configs = cloneDeep(merge({}, internalConfig, testConfig))
    delete configs.plugins
    const contentstack: any = configs.contentstack
    contentstack.pagination_token = 'dummyPaginationToken'
    contentstack.host = 'api.localhost.io'
    contentstack.apis.sync += '/delete-success'
    setContentStore((contentConnector as any))
    setAssetStore((assetConnector as any))
    setListener((listener as any))
    delete contentstack.sync_token
    setConfig(configs)

    const status = (await start(configs))
    expect(status).toBeUndefined()
    // return start(configs).then((status) => {
    //   expect(status).toBeUndefined()
    // }).catch((error) => {
    //   expect(error).toBeNull()
    // })
  })

  test('content-type-schema-with-global-field',()=>{
    const request={
      path:'/v3/content_types/test?include_global_field_schema=true'
    }    
    let expectedGlobalFieldSchema={
      "data_type":"global_field",
      "uid":"global_field",
      "schema":expect.anything()
    }
    return get(request).then((response)=>{
      expect(response['content_type'].schema).toEqual(expect.arrayContaining([
        expect.objectContaining(expectedGlobalFieldSchema)
      ]))
    })
  })
})
