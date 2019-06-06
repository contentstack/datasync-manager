const helper = require('../helper')

module.exports = function TransformSchemas () {
  const options = TransformSchemas.options

  TransformSchemas.beforeSync = (data, action) => {
    return new Promise((resolve, reject) => {
      try {
        if (action !== 'publish' || data._content_type_uid === '_assets' || !(helper.hasAssetsOrReferences(data._content_type.schema))) {
          return resolve(data)
        }

        const transformations = helper.buildReferencePaths(data._content_type.schema)

        if (options.logAssetPaths) {
          data._content_type._assets = transformations.assetReferences
        }
        if (options.logReferencePaths) {
          data._content_type._references = transformations.entryReferences
        }

        return resolve(data)
      } catch (error) {
        return reject(error)
      }
    })
  }
}