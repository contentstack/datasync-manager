/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
/**
 * @description Utility that filters items based on 'locale'.
 * @param {Object} response - SYNC API's response
 * @param {Object} config - Application config
 * @returns {Promise} Returns a promise
 */
export declare const filterItems: (response: any, config: any) => Promise<{}>;
export declare const formatSyncFilters: (config: any) => any;
/**
 * @description Groups items based on their content type
 * @param {Array} items - An array of SYNC API's item
 * @returns {Object} Returns an 'object' who's keys are content type uids
 */
export declare const groupItems: (items: any) => {};
/**
 * @description Formats SYNC API's items into defined standard
 * @param {Array} items - SYNC API's items
 * @param {Object} config - Application config
 */
export declare const formatItems: (items: any, config: any) => any;
/**
 * @description Add's checkpoint data on the last item found on the 'SYNC API items' collection
 * @param {Object} groupedItems - Grouped items { groupItems(items) - see above } referred by their content type
 * @param {Object} syncResponse - SYNC API's response
 */
export declare const markCheckpoint: (groupedItems: any, syncResponse: any) => any;
/**
 * @description Calcuates filename for ledger and unprocessible files
 * @param {String} file - File to be calculated on
 * @param {Function} rotate - File rotation logic (should return a string)
 * @returns {String} Returns path to a file
 */
export declare const getFile: (file: any, rotate: any) => Promise<{}>;
export declare const getOrSetRTEMarkdownAssets: (schema: any, entry: any, bucket: any[], isFindNotReplace: any, parent?: any[]) => any;
