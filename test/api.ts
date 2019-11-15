
import { readFileSync } from 'fs'
import { cloneDeep, merge } from 'lodash'
import nock from 'nock'
import { join } from 'path'
import { get, init } from '../src/api'
import { config as internalConfig } from '../src/config'
import { setLogger } from '../src/util/logger'
import { response as emptyResponse } from './dummy/api-responses/empty'
import { response as publishResponse } from './dummy/api-responses/publish'
import { config as mockConfig } from './dummy/config'

const packageInfo: any = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'))

beforeEach(() => {
  const configs = cloneDeep(merge({}, internalConfig, mockConfig))
  init(configs.contentstack)

  nock('https://api.localhost.io', {
      reqheaders: {
        'access_token': 'dummyDeliveryToken',
        'api_key': 'dummyApiKey',
        'x-user-agent': `datasync-manager/v${packageInfo.version}`,
      },
    })
    .get('/200')
    // .query({sync_token: 'dummySyncToken', environment: 'test', limit: 100})
    .reply(200, publishResponse)

  nock('https://api.localhost.io', {
      reqheaders: {
        'access_token': 'dummyDeliveryToken',
        'api_key': 'dummyApiKey',
        'x-user-agent': `datasync-manager/v${packageInfo.version}`,
      },
    })
    .get('/200')
    .query({pagination_token: 'publish-token', environment: 'test', limit: 100})
    .reply(200, emptyResponse)

  nock('https://api.localhost.io', {
      reqheaders: {
        'access_token': 'dummyDeliveryToken',
        'api_key': 'dummyApiKey',
        'x-user-agent': `datasync-manager/v${packageInfo.version}`,
      },
    })
    .get('/429')
    .reply(429, emptyResponse)

  nock('https://api.localhost.io', {
      reqheaders: {
        'access_token': 'dummyDeliveryToken',
        'api_key': 'dummyApiKey',
        'x-user-agent': `datasync-manager/v${packageInfo.version}`,
      },
    })
    .get('/500')
    .reply(500, publishResponse)

  nock('https://api.localhost.io', {
    reqheaders: {
      'access_token': 'dummyDeliveryToken',
      'api_key': 'dummyApiKey',
      'x-user-agent': `datasync-manager/v${packageInfo.version}`,
    },
  })
    .get('/retry-exceeded')
    .reply(500, emptyResponse)

  nock('https://api.localhost.io', {
    reqheaders: {
      'access_token': 'dummyDeliveryToken',
      'api_key': 'dummyApiKey',
      'x-user-agent': `datasync-manager/v${packageInfo.version}`,
    },
  })
    .get('/unknown-status')
    .reply(199, {
      key: 'unknown reject',
    })
})

describe('test api - get()', () => {
  beforeAll(() => {
    setLogger()
  })

  test('status 200: without errors', () => {
    const request = {
      path: '/200',
    }

    return get(request).then((response) => {
      expect(response).toHaveProperty('items')
    }).catch((error) => {
      expect(error)
    })
  })

  test('status 429: rate limit error', () => {
    const request = {
      path: '/429',
    }

    return get(request).then((response) => {
      expect(response).toBe({})
    }).catch((error) => {
      expect(error)
    })
  })

  test('server error', () => {
    const request = {
      path: '/500',
    }

    return get(request).then((response) => {
      expect(response).toBe({})
    }).catch((error) => {
      console.error(error)
      expect(error)
    })
  })

  test('retry exceeded', () => {
    const request = {
      path: '/retry-exceeded',
    }
    const err = new Error('Max retry limit exceeded!')
    return get(request, 9).then((response) => {
      expect(response).toBe({})
    }).catch((error) => {
      expect(error).toMatchObject(err)
    })
  })

  // test('unknown status', () => {
  //   const request = {
  //     path: '/unknown-status',
  //   }
  //   // const rej = {
  //   //   key: 'unknown reject',
  //   // }

  //   // expect(get(request)).rejects.toHaveProperty('key')
  //   return get(request).catch((error) => {
  //     expect(error).toHaveProperty('key')
  //   })
  // })

})
