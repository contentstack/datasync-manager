// Build mock asset connector
module.exports = {
  delete: function () {
    return Promise.resolve()
  },
  download: function (asset) {
    asset.key = 'new key added'
    return Promise.resolve(asset)
  },
  unpublish: function () {
    return Promise.resolve()
  },
  start: function () {
    return Promise.resolve(this)
  }
}