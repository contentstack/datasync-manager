import { cloneDeep, merge } from 'lodash'
import nock from 'nock'
import { get, init } from '../src/api'
import { config as internalConfig } from '../src/defaults'
import { setLogger } from '../src/util/logger'
import { response as publishResponse } from './dummy/api-responses/publish'
import { config as mockConfig } from './dummy/config'

beforeEach(() => {
  const configs = cloneDeep(merge({}, internalConfig, mockConfig))
  init(configs.contentstack)
  nock('https://api.localhost.io', {
      reqheaders: {
        'X-User-Agent': 'contentstack-sync-manager/v1.0.0',
        'access_token': 'dummyDeliveryToken',
        'api_key': 'dummyApiKey',
      },
    })
    .get('/200')
    .reply(200, publishResponse)
  nock('https://api.localhost.io', {
      reqheaders: {
        'X-User-Agent': 'contentstack-sync-manager/v1.0.0',
        'access_token': 'dummyDeliveryToken',
        'api_key': 'dummyApiKey',
      },
    })
    .get('/429')
    .reply(429, publishResponse)
  nock('https://api.localhost.io', {
      reqheaders: {
        'X-User-Agent': 'contentstack-sync-manager/v1.0.0',
        'access_token': 'dummyDeliveryToken',
        'api_key': 'dummyApiKey',
      },
    })
    .get('/500')
    .reply(500, publishResponse)
  nock('https://api.localhost.io')
    .get('/retry-exceeded')
    .reply(500, {})
  nock('https://api.localhost.io')
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
    }).catch(console.error)
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

  test('unknown status', () => {
    const request = {
      path: '/unknown-status',
    }
    const rej = {
      key: 'unknown reject',
    }

    expect(get(request)).rejects.toMatchObject(rej)
  })

})
