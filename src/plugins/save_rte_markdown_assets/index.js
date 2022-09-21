const helper = require('../helper')
const index = require('../../index')
const util = require('../../util/index')

module.exports = function SaveRteMarkdownAssets () {
  SaveRteMarkdownAssets.beforeSync = (action, data, schema) => {
    return new Promise((resolve, reject) => {
      try {
        if (action !== 'publish' || data._content_type_uid === '_assets' || !(helper.hasRteOrMarkdown(schema.schema))) {

          return resolve(data)
        }

        let assets = util.getOrSetRTEMarkdownAssets(schema.schema, data, [], true)

        // if no assets were found in the RTE/Markdown
        if (assets.length === 0) {

          return resolve(data)
        }

        assets = assets.map((asset) => { 
          return helper.buildAssetObject(asset, data.locale, data.uid, schema.uid)
        })

        const assetBucket = []

        assets.forEach((asset) => {
          assetBucket.push(index.getAssetLocation(asset).then((location) => {
            asset._internal_url = location
          }))
        })

        return Promise.all(assetBucket)
          .then(() => {
            data = util.getOrSetRTEMarkdownAssets(schema.schema, data, assets, false)
            // unshift the entry back into 'Q'
            // index.unshift(data)
            assets.forEach((asset) => {
              if (asset && typeof asset === 'object') {
                // unshift all assets into the 'Q'
                index.unshift(asset)
              }
            })

            return
          })
          .then(() => resolve({data, schema}))
          .catch(reject)
      } catch (error) {
        return reject(error)
      }
    })
  }
}