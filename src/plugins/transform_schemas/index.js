const helper = require('../helper')

module.exports = function TransformSchemas () {
  const options = TransformSchemas.options

  TransformSchemas.beforeSync = (data) => {
    return new Promise((resolve, reject) => {
      try {
        if (data.content_type_uid === '_assets' || !(helper.hasAssetsOrReferences(data.content_type.schema))) {
          return resolve(data)
        }

        const transformations = helper.buildReferences(data.content_type.schema)

        if (options.logAssetPaths) {
          data.content_type.assetReferences = transformations.assetReferences
        }
        if (options.logReferencePaths) {
          data.content_type.entryReferences = transformations.entryReferences
        }

        return resolve(data)
      } catch (error) {
        return reject(error)
      }
    })
  }
}