const console = require('../console')

// Build mock content connector
module.exports = {
  find: function () {
    console.log('Content connector find called')
    return Promise.resolve()
  },
  findOne: function () {
    console.log('Content connector findOne called')
    return Promise.resolve()
  },
  publish: function () {
    // console.log('Content connector publish called')
    return Promise.resolve()
  },
  delete: function () {
    console.log('Content connector delete called')
    return Promise.resolve()
  },
  unpublish: function () {
    console.log('Content connector unpublish called')
    return Promise.resolve()
  },
  setLogger: () => {

  },
  start: function () {
    console.log('Content connector started')
    return Promise.resolve(this)
  }
}