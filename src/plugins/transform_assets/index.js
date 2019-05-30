const helper = require('../helper')

module.exports = function TransformAssets () {
  const options = TransformAssets.options

  TransformAssets.beforeSync = (data, action) => {
    return new Promise((resolve, reject) => {
      try {
        if (action !== 'publish' || data.content_type_uid === '_assets' || !(helper.hasAssets(data.content_type.schema))) {
          return resolve(data)
        }

        helper.buildAssetReferences(data.data, data.content_type.schema)

        return resolve(data)
      } catch (error) {
        return reject(error)
      }
    })
  }
}