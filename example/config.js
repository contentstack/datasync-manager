module.exports = {
  contentstack: {
    apiKey: '',
    deliveryToken: ''
  },
  contentStore: {
    dbName: 'contentstack',
    collectionName: 'development'
  },
  assetStore: {
    baseDir: './_development_contents'
  },
  plugins: [
    {
      disabled: false,
      name: '_cs_internal_transform_entries',
      // path: '',
      options: {
        // other overrides...
      },
    },
    {
      disabled: false,
      name: '_cs_internal_transform_schemas',
      options: {
        logAssetPaths: true,
        logReferencePaths: true,
        // other overrides...
      },
    },
    {
      disabled: false,
      name: '_cs_internal_save_rte_markdown_assets',
      options: {
        // other overrides...
      },
    },
  ],
  syncManager: {
    inet: {
      dns: '8.8.8.8',
      host: 'google.com',
      port: 53,
      retries: 2,
      retryTimeout: 3 * 1000,
      retryIncrement: 1 * 1000,
      timeout: 6 * 1000,
      type: 'A',
    },
    processTimeout: 0
  },
  // filtering now available!
  // syncManager: {
  //   filters: {
  //     content_type_uid: ['authors'],
  //     locale: ['en-us'],
  //     action: ['publish']
  //   }
  // }
}