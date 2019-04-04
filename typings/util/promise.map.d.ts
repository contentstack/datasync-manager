/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
/**
 * @description Custom promisified map - mimicing 'Bluebird.map'
 * @param {Object} arr - List of items to be passed to 'fn'
 * @param {Function} fn - Promisified function where the 'arr items' will be passed
 * @param {Number} concurrency - Determines the no. of 'arr items' to be processed in one go
 * @param {Array} resultBucket - Collection of results returned by 'arr items' passed onto 'fn'
 * @returns {Promise} Returns a promisifed collection result
 */
export declare const map: (arr: any, fn: any, concurrency?: number, resultBucket?: any[]) => any;
