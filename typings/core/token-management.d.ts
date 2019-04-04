/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
/**
 * @description Returns 'token details' based on 'token type'
 * @param {String} type - Token type (checkpoint | current)
 */
export declare const getToken: () => Promise<{}>;
/**
 * @description Saves token details
 * @param {String} name - Name of the token
 * @param {String} token - Token value
 * @param {String} type - Token type
 */
export declare const saveToken: (name: any, token: any) => Promise<{}>;
/**
 * @description Saves token details
 * @param {String} name - Name of the token
 * @param {String} token - Token value
 * @param {String} type - Token type
 */
export declare const saveCheckpoint: (name: any, token: any) => Promise<{}>;
