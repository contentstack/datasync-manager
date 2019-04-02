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
    dbName: 'markdown',
    collectionName: 'development'
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
