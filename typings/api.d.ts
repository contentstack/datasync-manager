/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
/**
 * @description Initialize sync utilities API requests
 * @param {Object} contentstack - Contentstack configuration details
 */
export declare const init: (contentstack: any) => void;
/**
 * @description Make API requests to Contentstack
 * @param {Object} req - API request object
 * @param {Number} RETRY - API request retry counter
 */
export declare const get: (req: any, RETRY?: number) => Promise<{}>;
