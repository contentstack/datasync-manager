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
})
