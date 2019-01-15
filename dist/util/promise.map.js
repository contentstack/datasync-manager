"use strict";
/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.map = (arr, fn, concurrency = 1, resultBucket = []) => {
    return new Promise((resolve, reject) => {
        if (arr.length === 0) {
            return resolve(resultBucket);
        }
        for (let i = 0; i < concurrency; i++) {
            if (arr.length === 0) {
                break;
            }
            resultBucket.push(fn(arr.shift()));
        }
        return Promise.all(resultBucket).then(() => {
            return exports.map(arr, fn, concurrency, resultBucket)
                .then(resolve)
                .catch(reject);
        }).catch(reject);
    });
};
//# sourceMappingURL=promise.map.js.map