const helper = require('../helper')

module.exports = function TransformSchemas () {
  const options = TransformSchemas.options

  TransformSchemas.beforeSync = (action, data, schema) => {
    return new Promise((resolve, reject) => {
      try {
        if (action !== 'publish' || data._content_type_uid === '_assets' || !(helper.hasAssetsOrReferences(schema.schema))) {
          return resolve(data)
        }

        const transformations = helper.buildReferencePaths(schema.schema)

        if (options.logAssetPaths) {
          schema._assets = transformations.assetReferences
        }
        if (options.logReferencePaths) {
          schema._references = transformations.entryReferences
        }

        return resolve({data, schema})
      } catch (error) {
        return reject(error)
      }
    })
  }
}