module.exports = {
  contentstack: {
    apiKey: '',
    deliveryToken: ''
  },
  plugins: {
    sitemap: {
      name: 'sitemap generator'
    }
  },
  contentStore: {
    dbName: 'references',
    collection: {
      entry: 'contents',
      asset: 'contents',
      schema: 'content_types'
    }
  },
  assetStore: {
    baseDir: '_mongo_assets'
  },
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
    }
  }
  // filtering now available!
  // syncManager: {
  //   filters: {
  //     content_type_uid: ['authors'],
  //     locale: ['en-us'],
  //     action: ['publish']
  //   }
  // }
}
