[![Contentstack](https://www.contentstack.com/docs/static/images/contentstack.png)](https://www.contentstack.com/)

Contentstack is a headless CMS with an API-first approach. It is a CMS that developers can use to build powerful cross-platform applications in their favorite languages. Build your application frontend, and Contentstack will take care of the rest. [Read More](https://www.contentstack.com/).

## Contentstack DataSync Manager

Contentstack DataSync lets you sync your Contentstack data with your database, enabling you to save data locally and serve content directly from your database. It is a combination of four powerful modules that is [DataSync Webhook Listener](https://github.com/contentstack/webhook-listener), [DataSync Manager](https://github.com/contentstack/datasync-manager), [DataSync Asset Store Filesystem](https://github.com/contentstack/datasync-asset-store-filesystem), DataSync Content Store — [Filesystem](https://github.com/contentstack/datasync-content-store-filesystem) and [MongoDB](https://github.com/contentstack/datasync-content-store-filesystem).

The DataSync Manager is one of the four important components of Contentstack DataSync. When any publish, unpublish, or delete operations are performed on assets or content, the DataSync Manager fetches the data and sends it to Content Store. It uses Contentstack's Sync APIs to sync data from Contentstack with your preferred database — Filesystem and MongoDB in our case.

### Prerequisite
- nodejs v8+

### Usage

This is how DataSync Manager works with DataSync boilerplate:

```js
const assetStore = require('@contentstack/datasync-asset-store-filesystem')
const contentStore = require('@contentstack/datasync-content-store-filesystem')
const listener = require('@contentstack/webhook-listener')
const syncManager = require('@contentstack/datasync-manager') // <--
const config = require('./config')

// Set asset, content store, listener and config to Datasync Manager
syncManager.setAssetStore(assetStore)
syncManager.setContentStore(contentStore)
syncManager.setListener(listener)
syncManager.setConfig(config)

// start DataSync manager
syncManager.start()
  .then(() => {
    console.log('Contentstack sync started successfully!')
  })
  .catch(console.error)
```
You can replace [@contentstack/datasync-content-store-filesystem](https://www.npmjs.com/package/@contentstack/datasync-content-store-filesystem) used above, with [@contentstack/datasync-content-store-mongodb](https://www.npmjs.com/package/@contentstack/datasync-content-store-mongodb) and switch content store databases.

### Configuration

- Here's a list of contentstack's configuration keys

| Key Name | Default | Description |
| :--- |:---:| :---|
| apiKey | | **Required**. Your stack's API key |
| deliveryToken | | **Required**. Your environment's delivery token |
| sync_token | | Token from where you'd like to start the process |
| pagination_token | | Token from where you'd like to start the process |
| MAX_RETRY_LIMIT | 6 | Number of times the API call would retry, if the server fails |

- Here's a list of configuration keys for contentstack datasync-manager:

<table>
  <thead>
    <tr>
      <th>Property</th>
      <th>Default</th>
      <th>Description</th>
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
      <td>The min-max internal queue size of contentstack-sync-manager. The DataSync manager would pause making <code>Sync API</code> requests once the internal queue size exceeds <code>pause_threshold</code> count.</td>
    </tr>
    <tr>
      <td>queue.resume_threshold</td>
      <td>
        5000
      </td>
      <td>The min-max internal queue size of contentstack-sync-manager. The DataSync manager will resume <code>Sync API</code> requests once the queue size goes below <code>resume_threshold</code> count.</td>
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
    <tr>
      <td>filters</td>
      <td>
        <ul>
          <li>content_type_uid</li>
          <li>locale</li>
          <li>action</li>
        </ul>
      </td>
      <td>
        Filters allow you to narrow down the items that'd be returned by the SYNC API response.
        Ex:
        <code>{filters: {content_type_uid: ['blogs']}, locale: ['en-us'], action: ['publish']}</code>
      </td>
    </tr>
  </tbody>
</table>

And here's an example to get you started:
```js
{
  // exmaple to override default values
  contentstack: {
      apiKey: '',
      deliveryToken: '',
      sync_token: '',
      MAX_RETRY_LIMIT: 5
    }
  },
  syncManager: {
      cooloff: 2000,
      limit: 80,
      filters: {
        content_type_uid: ['blogs'],
        locale: ['es-es', 'en-us'],
        action: ['publish', 'unpublish']
      }
    }
  }
}
```

### Further Reading

- [Getting started with Contentstack DataSync](https://www.contentstack.com/docs/guide/synchronization/contentstack-datasync)
- [Contentstack DataSync](https://www.contentstack.com/docs/guide/synchronization/contentstack-datasync/configuration-files-for-contentstack-datasync) doc lists the configuration for different modules


### Support and Feature requests

If you have any issues working with the library, please file an issue here at Github.
You can send us an e-mail at support@contentstack.com if you have any support or feature requests. Our support team is available 24/7 on the intercom. You can always get in touch and give us an opportunity to serve you better!


### Licence

This repository is published under the [MIT](LICENSE) license.
