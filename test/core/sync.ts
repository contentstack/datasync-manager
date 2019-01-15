import { poke } from '../../src/core'
import { setLogger } from '../../src/util/logger'

beforeAll(() => {
  setLogger()
})

test('Poke should work without errors', () => {
  expect(poke()).toBeUndefined()
})
