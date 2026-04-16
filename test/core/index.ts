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
    // unlock(true) would run check() -> sync() and requires init(); use unlock(false) to only exercise the gate
    expect(unlock(false)).toBeUndefined()
  })
})
