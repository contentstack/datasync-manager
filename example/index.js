const assetConnector = require('./mock/assetStore')
// const assetConnector = require('../../contentstack-asset-store-filesystem')
const config = require('./mock/config')
const console = require('./console')
// const contentConnector = require('./mock/contentStore')
const contentConnector = require('../../contentstack-content-store-mongodb')
// const listener = require('./mock/listener')
const listener = require('../../contentstack-webhook-listener')
const syncManager = require('../dist')

syncManager.setAssetStore(assetConnector)
syncManager.setContentStore(contentConnector)
syncManager.setListener(listener)
syncManager.setConfig(config)

syncManager.start().then(() => {
  console.log('Sync utility started successfully!')
}).catch(console.error)

syncManager.notifications
  .on('publish', (obj) => {
    console.log('SYNC-PUBLISH: ', obj)
  })
  .on('unpublish', (obj) => {
    console.log('SYNC-UNPUBLISH: ', obj)
  })
  .on('delete', (obj) => {
    console.log('SYNC-DELETE: ', obj)
  })
  .on('error', (obj) => {
    console.log('SYNC-ERROR: ', obj)
  })