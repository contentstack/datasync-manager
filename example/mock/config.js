module.exports = {
  contentstack: {
    apiKey: '',
    deliveryToken: ''
  },
  plugins: {
    myplugin: {
      name: 'John doe'
    },
    sitemap: {
      name: 'sitemap generator'
    }
  },
  contentStore: {
    dbName: 'filter-syncing',
    collectionName: 'example'
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
