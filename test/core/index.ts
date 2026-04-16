/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

import { lock, unlock } from '../../src/core'
import { setLogger } from '../../src/util/logger'

describe('check lock-unlock', () => {
  beforeAll(() => {
    setLogger()
  })
  test('lock-unlock', () => {
    expect(lock()).toBeUndefined()
    expect(unlock(true)).toBeUndefined()
  })
})
