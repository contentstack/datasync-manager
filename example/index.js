const assetConnector = require('./mock/asset-connector')
const config = require('./mock/config')
const console = require('./console')
// const contentConnector = require('./mock/content-connector')
const contentConnector = require('../../contentstack-mongodb-content-connector/dist')
const listener = require('../../contentstack-webhook-listener/dist')
const syncManager = require('../dist')

syncManager.setAssetConnector(assetConnector)
syncManager.setContentConnector(contentConnector)
syncManager.setListener(listener)
syncManager.setConfig(config)

syncManager.start().then(messages => {
  console.log(messages.status)
}).catch(console.error)
