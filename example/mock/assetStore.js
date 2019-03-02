// Build mock asset connector
module.exports = {
  delete: function () {
    return Promise.resolve()
  },
  download: function (asset) {
    asset.key = 'new key added'
    return new Promise((resolve) => {
      return setTimeout(() => {
        return resolve(asset)
      }, 1000)
    })
  },
  unpublish: function () {
    return Promise.resolve()
  },
  setLogger: () => {

  },
  start: function () {
    return Promise.resolve(this)
  }
}