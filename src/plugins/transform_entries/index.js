const helper = require('../helper')

module.exports = function TransformEntries () {
  const options = TransformEntries.options

  TransformEntries.beforeSync = (data) => {
    return new Promise((resolve, reject) => {
      try {
        if (data.content_type_uid === '_assets' || !(helper.hasReferences(data.content_type.schema))) {
          return resolve(data)
        }

        helper.buildEntryReferences(data.data, data.content_type.schema)

        return resolve(data)
      } catch (error) {
        return reject(error)
      }
    })
  }
}