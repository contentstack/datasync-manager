// Build mock content store
module.exports = {
  publish: function () {
    return Promise.resolve()
  },
  delete: function () {
    return Promise.resolve()
  },
  unpublish: function () {
    return Promise.resolve()
  },
  start: function () {
    return Promise.resolve(this)
  }
}