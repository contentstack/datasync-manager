/*!
* Contentstack DataSync Manager
* This module saves filtered/failed items
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
/**
 * TODO
 * This method logs all failed items.
 * Failed items should be 'retried' when app is started Or after a specific interval
 * @param {Object} obj - Contains 'error' and 'data' key
 * @returns {Promise} Returns a promisified object
 */
export declare const saveFailedItems: (obj: any) => Promise<{}>;
/**
 * @description Saves items filtered from SYNC API response
 * @param {Object} items - Filtered items
 * @param {String} name - Page name where items were filtered
 * @param {String} token - Page token value
 * @returns {Promise} Returns a promise
 */
export declare const saveFilteredItems: (items: any, name: any, token: any) => Promise<{}>;
