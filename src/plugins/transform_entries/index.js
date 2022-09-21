const helper = require('../helper')

module.exports = function TransformEntries () {
  TransformEntries.beforeSync = (action, data, schema) => {
    return new Promise((resolve, reject) => {
      try {
        if (action !== 'publish' || data._content_type_uid === '_assets' || !(helper.hasReferences(schema.schema))) {
          return resolve(data)
        }

        helper.buildReferences(data, schema.schema)

        return resolve({data, schema})
      } catch (error) {
        return reject(error)
      }
    })
  }
}