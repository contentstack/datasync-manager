// const log = console.log

module.exports = function Plugins (/* pluginOptions */) {
  // let options = pluginOptions
  Plugins.beforePublish = function (input) {
    // log('Before Publish' + JSON.stringify(options, null, 2))
    return Promise.resolve(input)
  }

  Plugins.afterPublish = function (input) {
    // log('After Publish')
    return Promise.resolve(input)
  }

  Plugins.beforeUnpublish = function (input) {
    // log('Before Unpublish')
    return Promise.resolve(input)
  }

  Plugins.afterUnpublish = function (input) {
    // log('After Unpublish')
    return Promise.resolve(input)
  }

  Plugins.beforeDelete = function (input) {
    // log('Before Delete')
    return Promise.resolve(input)
  }

  Plugins.afterDelete = function (input) {
    // log('After Delete')
    return Promise.resolve(input)
  }
}
