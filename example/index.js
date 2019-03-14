const assetStore = require('contentstack-asset-store-filesystem')
const contentStore = require('contentstack-content-store-filesystem')
const listener = require('contentstack-webhook-listener')
const syncManager = require('contentstack-sync-manager')
const config = require('./mock/config')

syncManager.setAssetStore(assetStore)
syncManager.setContentStore(contentStore)
syncManager.setListener(listener)
syncManager.setConfig(config)

syncManager.start()
  .then(() => {
    console.log('Contentstack sync started successfully!')
  })
  .catch(console.error)