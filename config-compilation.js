/**
 * Mongodb content store specific configurations
 */
const mongoStore = {
  // Name of the mongodb database to store in
  dbName: 'contentstack-persistent-db',
  // Collection name in which contents will be stored
  collectionName: 'contents',
  // keys that form part of sys_keys, pass { key: true } to add, { key: false } to remove
  // currently, only top level keys from SYNC API response item are supported
  indexedKeys: {
    content_type_uid: true,
    locale: true,
    uid: true,
    published_at: true
  },
  // Refer http://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html for more configuration options
  options: {
    autoReconnect: true,
    connectTimeoutMS: 15000,
    keepAlive: true,
    noDelay: true,
    reconnectInterval: 1000,
    reconnectTries: 20,
    userNewUrlParser: true,
  },
  // Keys to be deleted, while data is being inserted
  unwantedKeys: {
    asset: {
      action: true,
      checkpoint: true,
      'data.created_by': true,
      event_at: true,
      type: true,
      'data.updated_by': true
    },
    contentType: {
      'data.created_by': true,
      'data.updated_by': true,
      'data.DEFAULT_ACL': true,
      'data.SYS_ACL': true,
      'data.abilities': true,
      'data.last_activity': true
    },
    entry: {
      action: true,
      checkpoint: true,
      'data.created_by': true,
      event_at: true,
      type: true,
      'data.updated_by': true
    },
  },
  // mongodb connection url
  url: 'mongodb://localhost:27017',
}

/**
 * Sync manager configurations
 */
const syncManager = {
  // asset store configuration, refer assetStore config for further details
  assetStore: {},
  // content store configuration, refer mongoStore OR fsStore config for further details
  contentStore: {},
  // contentstack config, this is used mainly in making API calls
  contentstack: {
    // stack api key
    apiKey: '',
    // delivery token, to be used while making REST API requests
    deliveryToken: '',
    // sync token point from where to start making requests
    sync_token: '',
    // pagination token point from where to start making requests
    pagination_token: '',
    // no of times an API request will be retried, before failing
    // timedelay calculation = Math.pow(Math.SQRT2, RETRY) * 200
    MAX_RETRY_LIMIT: 6,
    actions: {
      delete: 'delete',
      publish: 'publish',
      unpublish: 'unpublish',
    },
    // api helper keys
    apis: {
      content_types: '/v3/content_types/',
      sync: '/v3/stacks/sync',
    },
    // REST API domain
    host: 'cdn.contentstack.io',
    // REST API port
    port: 443,
    // REST API request protocol
    protocol: 'https:',
    // Supported REST API verbs, used internally. Helper key
    verbs: {
      get: 'GET',
    },
  },
  // producer, ex: contentstack-webhook-listener config, check listener for further details
  listener: {},
  // locales, that you'd want to be skipped, ex: [ { code: 'en-us' } ]
  locales: [],
  // sync-manager specific configurations
  syncManager: {
    // milliseconds to wait before making continious 2nd API SYNC request
    cooloff: 3000,
    // assets in entries, will appear as 'references' when this is `true`, else only its uid will appear
    // ex: { reference_to: '_assets', values: ['asset_uid'] }
    enableAssetReferences: true,
    // references in entries, will appear as 'references' when this is `true`, else only its uid will appear
    // ex: { reference_to: 'content_type_uid', values: ['entry_uid'] }
    enableContentReferences: true,
    // if enabled, contentstack assets in RTE/Markdown will be downloaded onto database
    enableRteMarkdownDownload: true,
    // max no of items to be fetched in a SYNC API request
    limit: 100,
    // max file sizes in bytes
    // limit the max file size of '.ledger' or filter/logger files
    maxsize: 2097152,
    // do you wish to save failed items?
    // this feature is available from v1.1.0 onwards
    saveFailedItems: false,
    // do you wish to save filtered items?
    // this will work only when
    // 		1. locales:  [ { code: 'en-us' } ] is used
    // 		2. if items returned by SYNC API request do not have mandatory keys
    saveFilteredItems: true,
  },
}

/**
 * Contentstack sync mongodb SDK configurations
 */
const mongoSDK = {
  // Name of the mongodb database to store in
  dbName: 'contentstack-persistent-db',
  // Collection name in which contents will be stored
  collectionName: 'contents',
  // Indexes to be applied
  indexes: {
    published_at: 1,
  },
  // Refer http://mongodb.github.io/node-mongodb-native/3.1/api/MongoClient.html for more configuration options
  options: {
    autoReconnect: true,
    connectTimeoutMS: 15000,
    keepAlive: true,
    noDelay: true,
    reconnectInterval: 1000,
    reconnectTries: 20,
    userNewUrlParser: true,
  },
  // Keys to be deleted, while data is being inserted
  unwantedKeys: {
    // asset keys to be deleted
    asset: ['created_by', 'updated_by'],
    // content type keys to be deleted
    contentType: ['created_by', 'updated_by', 'DEFAULT_ACL', 'SYS_ACL', 'abilities', 'last_activity'],
    // entry keys to be deleted
    entry: ['created_by', 'updated_by'],
  },
  // mongodb connection url
  uri: 'mongodb://localhost:27017',
  // no of items to be returned by default, when a query is fired
  // use .limit(200) to override this
  limit: 100,
  // no of items to be skipped by default, when a query is fired
  // use .skip(20) to override this
  skip: 0,
  // locale info, control the locales to be supported by the SDK
  // ex: [ { code: 'en-us', relative_url_prefix: '/' } ]
  locales: [],
  // keys to be ignored by default
  // use .only(['_id', 'updated_at']) to override these configurations
  projections: {
    _id: 0,
    _version: 0,
    content_type_uid: 0,
    created_at: 0,
    sys_keys: 0,
    updated_at: 0,
    updated_by: 0,
  },
}

/**
 * Filesystem content store specific configurations
 */
const filesystemStore = {

}
