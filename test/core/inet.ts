import { cloneDeep, merge } from 'lodash'
import { setConfig } from '../../src'
import { config as internalConfig } from '../../src/config'
import { checkNetConnectivity, init, netConnectivityIssues } from '../../src/core/inet'
import { config as mockConfig } from '../dummy/config'

const config = cloneDeep(merge({}, internalConfig, mockConfig))

describe('# inet', () => {
  beforeAll(() => {
    setConfig(config)
    init()
  })
  test('Check for internet connectivity', () => {
    expect(checkNetConnectivity())
      .toBeUndefined()
  })

  test('Check for internet connectivity issue', () => {
    expect(netConnectivityIssues({}))
      .toEqual(false)
  })

  describe('netConnectivityIssues', () => {
    test('returns false for unrelated errors', () => {
      expect(netConnectivityIssues({ message: 'business logic failed' })).toBe(false)
      expect(netConnectivityIssues({ code: 'ICTC' })).toBe(false)
    })

    test('returns true for Request timeout message', () => {
      expect(netConnectivityIssues({ message: 'Request timeout' })).toBe(true)
    })

    test('returns true for ETIMEDOUT and other retryable codes', () => {
      expect(netConnectivityIssues({ code: 'ETIMEDOUT' })).toBe(true)
      expect(netConnectivityIssues({ code: 'ECONNREFUSED' })).toBe(true)
      expect(netConnectivityIssues({ code: 'ENETUNREACH' })).toBe(true)
      expect(netConnectivityIssues({ code: 'EAI_AGAIN' })).toBe(true)
    })

    test('returns true for socket hang up in message', () => {
      expect(netConnectivityIssues({ message: 'socket hang up' })).toBe(true)
    })
  })
})
