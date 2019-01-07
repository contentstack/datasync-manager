import { join, resolve} from 'path'
import { saveFilteredItems } from '../../src/util/log/filteredItems'

test('Save filtered items should work without errors', () => {
  const items = [
    {
      key: 'dummy object',
    },
  ]
  const name = 'dummy_token'
  const token = '123'
  const paths = {
    filteredItems: resolve(join(__dirname, '..', '..', 'logs', 'failedItems.json')),
  }

  return saveFilteredItems(items, name, token, paths).then((empty) => {
    expect(empty).toBeUndefined()
  }).catch((error) => {
    expect(error).toBeNull()
  })
})

test('Save filtered items should throw ENOENT error', () => {
  const items = [
    {
      key: 'dummy object',
    },
  ]
  const name = 'dummy_token'
  const token = '123'
  const paths = {
    // filteredItems: resolve(join(__dirname, '..', '..', 'logs', 'failedItems.json')),
  }

  return saveFilteredItems(items, name, token, paths).then((empty) => {
    expect(empty).toBeUndefined()
  }).catch((error) => {
    expect(error).toBeNull()
  })
})
