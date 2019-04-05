module.exports = {
  contentstack: {
    apiKey: 'blt01e28ab17409dbb8',
    deliveryToken: 'cs1ed7b5a8f72d8d93e8f7ea59'
  },
  plugins: {
    sitemap: {
      name: 'sitemap generator'
    }
  },
  contentStore: {
    dbName: 'markdown',
    collectionName: 'development'
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
