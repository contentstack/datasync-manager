import { merge } from 'lodash'
import nock from 'nock'
import { get, init } from '../src/api'
import { config as internalConfig } from '../src/defaults'
import { response as publishResponse } from './dummy/api-responses/publish'
import { config } from './dummy/config'

beforeEach(() => {
  const configs = merge({}, config, internalConfig)
  init(configs.contentstack)
  nock('https://api.contentstack.io')
    .get('/200')
    .reply(200, publishResponse)
  nock('https://api.contentstack.io')
    .get('/429')
    .reply(429, publishResponse)
  nock('https://api.contentstack.io')
    .get('/500')
    .reply(500, publishResponse)
  nock('https://api.contentstack.io')
    .get('/retry-exceeded')
    .reply(500, {})
  nock('https://api.contentstack.io')
    .get('/unknown-status')
    .reply(199, {
      key: 'unknown reject',
    })
})

test('without errors', () => {
  const request = {
    headers: {
      'Content-Type': 'application/json',
    },
    uri: 'https://api.contentstack.io/200',
  }

  return get(request).then((response) => {
    expect(response).toHaveProperty('items')
  })
})

test('rate limit error', () => {
  const request = {
    headers: {
      'Content-Type': 'application/json',
    },
    uri: 'https://api.contentstack.io/429',
  }

  return get(request).then((response) => {
    expect(response).toBe({})
  }).catch((error) => {
    expect(error)
  })
})

test('server error', () => {
  const request = {
    headers: {
      'Content-Type': 'application/json',
    },
    uri: 'https://api.contentstack.io/500',
  }

  return get(request).then((response) => {
    expect(response).toBe({})
  }).catch((error) => {
    expect(error)
  })
})

test('retry exceeded', () => {
  const request = {
    headers: {
      'Content-Type': 'application/json',
    },
    uri: 'https://api.contentstack.io/retry-exceeded',
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
    headers: {
      'Content-Type': 'application/json',
    },
    uri: 'https://api.contentstack.io/unknown-status',
  }
  const rej = {
    key: 'unknown reject',
  }

  expect(get(request)).rejects.toMatchObject(rej)
})
