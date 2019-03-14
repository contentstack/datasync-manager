[![Contentstack](https://www.contentstack.com/docs/static/images/contentstack.png)](https://www.contentstack.com/)

## Contentstack Sync Manager

The Contentstack Sync utility lets you sync your Contentstack data on your server, enabling you to save data locally and serve content directly from your server.

The Sync Manager is one of the four important components of the [Contentstack Sync utility]().

The Sync Manager performs synchronization operations and ensures your infrastructure always has the most recent version of data (entries and assets).

It uses Contentstack's Sync APIs to sync data from Contentstack with your preferred database. Any publish, unpublish, or delete actions performed on the Contentstack server are tracked and the data syncs with your database accordingly.

Currently, Contentstack offers the following databases for storing the synced data:
- Filesystem data store: [contentstack-content-store-filesystem](https://github.com/contentstack/contentstack-content-store-filesystem)
- Filesystem asset store: [contentstack-asset-store-filesystem](https://github.com/contentstack/contentstack-asset-store-filesystem)
- Mongodb data store: [contentstack-content-store-mongodb](https://github.com/contentstack/contentstack-content-store-mongodb)

To notify contentstack-sync-manager, you can use a listener module - [contentstack-webhook-listener](https://github.com/contentstack/contentstack-webhook-listener) or your own personalized cron job can be used to invoke the app and sync the data on a regular interval.

### Prerequisite

- nodejs v8+
- [contentstack-webhook-listener](https://github.com/contentstack/contentstack-webhook-listener) OR a personalized cron job, that'd be used as a 'notifier'
- [contentstack-content-store-filesystem](https://github.com/contentstack/contentstack-content-store-filesystem) OR [contentstack-content-store-mongodb](https://github.com/contentstack/contentstack-content-store-mongodb)
- [contentstack-asset-store-filesystem](https://github.com/contentstack/contentstack-asset-store-filesystem)

### Working

When an entry or an asset is published, unpublished or deleted, the listener fires a notification event and the sync manager uses the `Contentstack's Sync API` to sync the latest changes.

Once the sync manager fetches the updated details from Contentstack, it passes them to the registered plugins and data connectors.

Read more on how to get started with [Contentstack Sync Utility]()

## Documentation & Getting started

In order to get you upto speed, we've prepared quite a few documentation and examples that would help you to learn and understand on how to use the utilities.

- [Usage](#usage)
- [Configuration](#configuration)
- [Reference documentation](#reference-documentation)
- [Getting started examples](#getting-started-examples)
- [Migration](#migration-from-contentstack-express)

### Usage

The following code snippet is the bare basics to get you stared with using the Contentstack Sync Utility:

```js
const assetStore = require('contentstack-asset-store-filesystem')
const contentStore = require('contentstack-content-store-filesystem')
const listener = require('contentstack-webhook-listener')
const syncManager = require('contentstack-sync-manager')
const config = require('./config')

syncManager.setAssetStore(assetStore)
syncManager.setContentStore(contentStore)
syncManager.setListener(listener)
syncManager.setConfig(config)

syncManager.start()
  .then(() => {
    console.log('Contentstack sync started successfully!')
  })
  .catch(console.error)
```
You can replace [contentstack-content-store-filesystem]() used above, with [contentstack-content-store-mongodb]() and switch content store databases.

### Configuration

Here's a list of configuration keys for contentstack-sync-manager

- Contentstack configuration keys

| Key Name | Default | Description |
| :--- |:---:| :---|
| apiKey | | **Required**. Your stack's API key |
| deliveryToken | | **Required**. Your environment's delivery token |
| sync_token | | Token from where you'd like to start the process |
| pagination_token | | Token from where you'd like to start the process |
| MAX_RETRY_LIMIT | 6 | Number of times the API call would retry, if the server fails |

- Sync Manager configuration keys

<!-- https://michelf.ca/projects/php-markdown/extra/ -->
<table>
  <thead>
    <tr>
      <th>Key Name</th>
      <th>Default</th>
      <th>Key</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>cooloff</td>
      <td>3000</td>
      <td>Number of <code>ms</code> the app would wait before making a subsequent <code>Sync API</code> request</td>
    </tr>
    <tr>
      <td>enableAssetReferences</td>
      <td>true</td>
      <td>
        This would map out all the asset fields and modify/map them to the content type they belong to. Ex:
        <ul>
          <li><strong>Before</strong></li>
            <code>"asset_field": "bltassetuid123"</code>
          <li><strong>After</strong></li>
            <code>
              "asset_field": {
                "reference_to": "_assets",
                "values": "bltassetuid123"
              }
            </code>
        </ul>
      </td>
    </tr>
    <tr>
      <td>enableContentReferences</td>
      <td>true</td>
      <td>
        This would map out all the reference fields and modify/map them to the content type they belong to. Ex:
        <ul>
          <li><strong>Before</strong></li>
            <code>
              "categories": "bltcategoryuid123"
            </code>
          <li><strong>After</strong></li>
            <code>
              "categories": {
                "reference_to": "category",
                "values": "bltcategoryuid123"
              }
            </code>
        </ul>
      </td>
    </tr>
    <tr>
      <td>limit</td>
      <td>100</td>
      <td>Number of items fetched in each <code>Sync API</code> request made.</td>
    </tr>
    <tr>
      <td>maxsize</td>
      <td>2097152</td>
      <td>Maximum file size of files (ex: .ledger file)</td>
    </tr>
    <tr>
      <td>queue.pause_threshold</td>
      <td>
        10000
      </td>
      <td>The min-max internal queue size of contentstack-sync-manager. The sync manager would pause making <code>Sync API</code> requests once the internal queue size exceeds <code>pause_threshold</code> count.</td>
    </tr>
    <tr>
      <td>queue.resume_threshold</td>
      <td>
        5000
      </td>
      <td>The min-max internal queue size of contentstack-sync-manager. The sync manager will resume <code>Sync API</code> requests once the queue size goes below <code>resume_threshold</code> count.</td>
    </tr>
    <tr>
      <td>saveFilteredItems</td>
      <td>
        true
      </td>
      <td>
        When enabled, the app will log items that have been filtered out. Items can be filtered out due to the following:
        <ul>
          <li>Missing required keys</li>
          <li>Language filters applied via config</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

### Reference documentation

The [Contentstack Sync Utility Docs]() documents what configuration, arguments, return types and methods are exposed by this utility.

Learn on how to configure:
- Filesystem content store [here](https://github.com/contentstack/contentstack-content-store-filesystem)
- Filesystem asset store [here](https://github.com/contentstack/contentstack-asset-store-filesystem)
- Mongodb content store [here](https://github.com/contentstack/contentstack-content-store-mongodb)

### Getting started examples

You can refer to [contentstack-sync-boilerplate] on how to use this library along with listeners and data stores.

We have created a basic boilerplate on how to get started with creating a standard website using the Contentstack Sync Utility [here]()

### Migration from `contentstack-express`

If you are an existing [contentstack-express]() user, check out how you can migrate your existing website to use contentstack sync utilities [here]()

### Support and Feature requests

If you have any issues with the library, please file an issue [here](https://github.com/contentstack/contentstack-sync-manager/issues) at Github.

You can [e-mail](mailto:ecosystem@contentstack.com) if you have any support or feature requests. Our dilligent minions will be working round the clock to help and serve you better!

### Licence

This repository is published under the [MIT](LICENSE) license.