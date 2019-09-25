"use strict";
/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
exports.__esModule = true;
/**
 * @description Custom promisified map - mimicing 'Bluebird.map'
 * @param {Object} arr - List of items to be passed to 'fn'
 * @param {Function} fn - Promisified function where the 'arr items' will be passed
 * @param {Number} concurrency - Determines the no. of 'arr items' to be processed in one go
 * @param {Array} resultBucket - Collection of results returned by 'arr items' passed onto 'fn'
 * @returns {Promise} Returns a promisifed collection result
 */
exports.map = function (arr, fn, concurrency, resultBucket) {
    if (concurrency === void 0) { concurrency = 1; }
    if (resultBucket === void 0) { resultBucket = []; }
    return new Promise(function (resolve, reject) {
        if (arr.length === 0) {
            return resolve(resultBucket);
        }
        for (var i = 0; i < concurrency; i++) {
            if (arr.length === 0) {
                break;
            }
            resultBucket.push(fn(arr.shift()));
        }
        return Promise.all(resultBucket)
            .then(function () {
            return exports.map(arr, fn, concurrency, resultBucket)
                .then(resolve)["catch"](reject);
        })["catch"](reject);
    });
};
