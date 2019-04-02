const assetStore = require('@contentstack/datasync-asset-store-filesystem')
// const assetStore = require('./mock/asset-store')
const contentStore = require('@contentstack/datasync-content-store-mongodb')
const listener = require('@contentstack/webhook-listener')
const syncManager = require('../dist/index')
const config = require('./mock/config')

syncManager.setAssetStore(assetStore)
syncManager.setContentStore(contentStore)
syncManager.setListener(listener)
syncManager.setConfig(config)

syncManager.start().then(() => {
  console.log('Sync utility started successfully!')
}).catch(console.error)

syncManager.notifications
  .on('publish', (obj) => {
    // console.log('SYNC-PUBLISH: ', obj)
  })
  .on('unpublish', (obj) => {
    // console.log('SYNC-UNPUBLISH: ', obj)
  })
  .on('delete', (obj) => {
    // console.log('SYNC-DELETE: ', obj)
  })
  .on('error', (obj) => {
    // console.log('SYNC-ERROR: ', obj)
  })
