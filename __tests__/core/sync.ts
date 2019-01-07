import { poke } from '../../src/core/sync'

test('Poke should work without errors', () => {
  expect(poke()).toBeUndefined()
})
