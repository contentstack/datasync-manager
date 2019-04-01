// Build mock asset store
module.exports = {
  delete: function () {
    return Promise.resolve()
  },
  download: function (asset) {
    asset.data._internal_url = 'internal_url'
    return Promise.resolve(asset)
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