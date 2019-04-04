/*!
* Contentstack DataSync Manager
*   - This module overrides nodejs internal 'fs' module functionalities
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
import { existsSync } from 'fs';
export { existsSync };
/**
 * @description A wrapper around nodejs fs module's 'writeFile()'
 * @param {String} filePath - Path where the data is to be written
 * @param {Object} data - Data that's to be written
 * @returns {Promise} Returns a promise
 */
export declare const writeFile: (filePath: any, data: any) => Promise<{}>;
/**
 * @description A wrapper around nodejs fs module's 'readFile()'
 * @param {String} filePath - Path from where data is to be read
 * @returns {Promise} Returns a promise
 */
export declare const readFile: (filePath: any) => Promise<{}>;
/**
 * @description A wrapper around nodejs fs module's 'readFileSync()'
 * @param filePath - Path from where data is to be read
 * @returns {String} Returns the data that's been read
 */
export declare const readFileSync: (filePath: any) => string;
/**
 * @description Safely creats a directory at the specified 'path'
 * @param filePath - Path from where directory is to be created
 * @returns {String} Returns a promise
 */
export declare const mkdir: (path: any) => Promise<{}>;
/**
 * @description exports fs.stat
 */
export { stat } from 'fs';
/**
 * @description synchnonous way of creating nested folder directory structure
 */
export { sync as mkdirpSync } from 'mkdirp';
