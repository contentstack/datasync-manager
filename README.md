[![Contentstack](https://www.contentstack.com/docs/static/images/contentstack.png)](https://www.contentstack.com/)

## Contentstack sync manager

Contentstack is a headless CMS with an API-first approach. It is a CMS that developers can use to build powerful cross-platform applications in their favorite languages. Build your application frontend, and Contentstack will take care of the rest. [Read More](https://www.contentstack.com/).

The sync manager utility uses [Contentstack's Sync API's](https://www.contentstack.com/docs/apis/content-delivery-api/#synchronization) to sync contents from Contentstack onto your choice of db at your end.

Any publish/unpublish/delete action performed on Contentstack, will be tracked and the data in the db will be synced accordingly.

Currently, Contentstack provides the following databases for storing synced data
- [contentstack-filesystem-content-store]()
- [contentstack-mongodb-content-store]()
- [contentstack-filesystem-asset-store]()

**[contentstack-webhook-listener]()** or your own personalized cron job can be used to invoke the app and sync the data on a regular basis.

### Prerequisite

To run this module, you'd need to have a listener - that acts as a 'notifier'. When the listener fires a notification event, the sync-manager utility uses Contentstack's Sync API to fetch details.

Once the sync-manager fetches the updated details from Contentstack - it needs to pass them down to the connectors.

### Usage

```js
const assetConnector = require('contentstack-asset-connector')
const contentConnector = require('contentstack-mongodb-content-connector')
const listener = require('contentstack-webhook-listener')

const config = require('./config')
const syncManager = require('./dist')

syncManager.setAssetConnector(assetConnector)
syncManager.setContentConnector(contentConnector)
syncManager.setListener(listener)
syncManager.setConfig(config)

syncManager.start().then((messages) => {
  console.log(messages.status)
}).catch((error) => {
  console.error(error)
})
```

### Config

1. **contentstack.apiKey**

Is a mandatory key, that defines the stack to sync from.

2. **contentstack.token**

If a token is provided, the sync-manager will start content sync from there

3. **locales**

The locales define the languages that need to be 'synced'. Any locale found other than the ones defined, will automatically be filtered out

4. **sync-manager.cooloff**

Defines the 'cooloff' duration (in milliseconds) to wait for after a 'sync api' call has been attempted by the app. If no value is provided, it will default to '3000 ms'

5. **sync-manager.limit**

The no. of items that's fetched at a time while using contentstack sync-api


Here's a sample config to help you get started!
```json
{
  "contentstack": {
    "apiKey": "",
    "token": ""
  },
  "locales": [
    {
      "code": "en-us",
      "relative_url_prefix": "/"
    }
  ],
  "plugins": {
    "myplugin": {
      "greetings": ["Hello there!", "Ola amigo!"]
    }
  },
  "sync-manager": {
    "cooloff": 3000,
    "limit": 100,
  }
}
```