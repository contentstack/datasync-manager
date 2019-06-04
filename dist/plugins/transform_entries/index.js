"use strict";
const helper = require('../helper');
module.exports = function TransformEntries() {
    const options = TransformEntries.options;
    TransformEntries.beforeSync = (data, action) => {
        return new Promise((resolve, reject) => {
            try {
                if (action !== 'publish' || data._content_type_uid === '_assets' || !(helper.hasReferences(data._content_type.schema))) {
                    return resolve(data);
                }
                helper.buildReferences(data, data._content_type.schema);
                return resolve(data);
            }
            catch (error) {
                return reject(error);
            }
        });
    };
};
