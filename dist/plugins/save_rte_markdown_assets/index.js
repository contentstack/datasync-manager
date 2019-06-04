"use strict";
const helper = require('../helper');
const index = require('../../index');
const util = require('../../util/index');
module.exports = function SaveRteMarkdownAssets() {
    const options = SaveRteMarkdownAssets.options;
    SaveRteMarkdownAssets.beforeSync = (data, action) => {
        return new Promise((resolve, reject) => {
            try {
                if (action !== 'publish' || data._content_type_uid === '_assets' || !(helper.hasRteOrMarkdown(data._content_type.schema))) {
                    return resolve(data);
                }
                let assets = util.getOrSetRTEMarkdownAssets(data._content_type.schema, data, [], true);
                // if no assets were found in the RTE/Markdown
                if (assets.length === 0) {
                    return resolve(data);
                }
                assets = assets.map((asset) => {
                    return helper.buildAssetObject(asset, data.locale);
                });
                const assetBucket = [];
                assets.forEach((asset) => {
                    assetBucket.push(index.getAssetLocation(asset).then((location) => {
                        asset._internal_url = location;
                    }));
                });
                return Promise.all(assetBucket)
                    .then(() => {
                    data = util.getOrSetRTEMarkdownAssets(data._content_type.schema, data, assets, false);
                    // unshift the entry back into 'Q'
                    // index.unshift(data)
                    assets.forEach((asset) => {
                        if (asset && typeof asset === 'object') {
                            // unshift all assets into the 'Q'
                            index.unshift(asset);
                        }
                    });
                    return;
                })
                    .then(resolve)
                    .catch(reject);
            }
            catch (error) {
                return reject(error);
            }
        });
    };
};
