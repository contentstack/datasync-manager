import { setAssetConnector, setConfig, setContentConnector, setListener, start } from '../src'
import { config } from './dummy/config'
import { assetConnector, contentConnector, listener } from './dummy/connector-listener-instances'

test('set content connector without errors', () => {
  expect(setContentConnector(contentConnector)).toBeUndefined()
})

test('set asset connector without errors', () => {
  expect(setAssetConnector(assetConnector)).toBeUndefined()
})

test('set listener without errors', () => {
  expect(setListener(listener)).toBeUndefined()
})

test('set config without errors', () => {
  expect(setConfig(config)).toBeUndefined()
})

// need help here
// test('get config without errors', () => {
//   expect(getConfig())
// })

test('start contentstack sync manager', () => {
  const result = {
    status: 'App started successfully!',
  }
  setContentConnector(contentConnector)
  setAssetConnector(assetConnector)
  setListener(listener)

  return start(config).then((status) => {
    expect(status).toEqual(result)
  })
})
