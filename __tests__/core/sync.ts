import { poke } from '../../src/core/sync'
import { createLogger } from '../../src/util/logger'

beforeAll(() => {
  createLogger()
})

test('Poke should work without errors', () => {
  expect(poke()).toBeUndefined()
})
