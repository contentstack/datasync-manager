// const assetConnector = require('./mock/asset-connector')
const assetConnector = require('../../contentstack-asset-store-filesystem')
const config = require('./mock/config')
const console = require('./console')
// const contentConnector = require('./mock/content-connector')
const contentConnector = require('../../contentstack-mongodb-content-connector/dist')
// const listener = require('./mock/listener')
const listener = require('../../contentstack-webhook-listener/dist')
const syncManager = require('../dist')

syncManager.setAssetConnector(assetConnector)
syncManager.setContentConnector(contentConnector)
syncManager.setListener(listener)
syncManager.setConfig(config)

syncManager.start().then(() => {
  console.log('Sync utility started successfully!')
}).catch(console.error)
