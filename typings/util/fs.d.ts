/*!
* Contentstack DataSync Manager
*   - This module overrides nodejs internal 'fs' module functionalities
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
import { existsSync } from 'fs';
export { existsSync };
export declare const writeFile: (filePath: any, data: any) => Promise<{}>;
export declare const readFile: (filePath: any) => Promise<{}>;
export declare const readFileSync: (filePath: any) => string;
export declare const mkdir: (path: any) => Promise<{}>;
export { stat } from 'fs';
export { sync as mkdirpSync } from 'mkdirp';
