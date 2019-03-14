// Build mock asset store
module.exports = {
  delete: function () {
    return Promise.resolve()
  },
  download: function (asset) {
    asset.data.key = 'newKey'
    return new Promise.resolve(asset)
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