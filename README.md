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
  const assetStore = require('contentstack-asset-store-filesystem')
  const contentStore = require('contentstack-content-store-mongodb')
  const listener = require('contentstack-webhook-listener')

  const config = require('./config')
  const syncManager = require('./dist')

  syncManager.setAssetStore(assetStore)
  syncManager.setContentStore(contentStore)
  syncManager.setListener(listener)
  syncManager.setConfig(config)

  syncManager.start().then((messages) => {
    console.log(messages.status)
  }).catch((error) => {
    console.error(error)
  })
```

### Config

By default, sync manager uses the following config to get started

```js
<!-- snippet -->
  contentstack: {
    // stack api key
    apiKey: '', // (required)
    // stack delivery token
    deliveryToken: '', // (required)
    // sync token from where data is to synced when app starts
    sync_token: '',
    // pagination token from where data is to be synced when app starts
    pagination_token: '',s
    // no of times REST API calls are retried before rejecting
    MAX_RETRY_LIMIT: 6,
    // default request host
    host: 'cdn.contentstack.io',
  },
  // locales added here will be filtered out
  locales: [
    {
      code: 'hi-in'
    }
  ],
  syncManager: {
    // milliseconds to wait before firing SYNC API
    cooloff: 3000,
    // no of items to be fetched at a time
    limit: 100,
    // max file sizes in bytes
    maxsize: 2097152,
    // if true, filtered and failed item objects will be saved locally under 'unprocessible' folder
    saveFailedItems: true,
    saveFilteredItems: true,
  },
```
(Note: All the above config can be overridden!)

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
    "syncManager": {
      "cooloff": 3000,
      "limit": 100,
    }
  }
```