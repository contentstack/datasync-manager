/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
export declare const setContentConnector: (instance: any) => void;
export declare const setAssetConnector: (instance: any) => void;
export declare const setListener: (instance: any) => void;
export declare const setConfig: (config: any) => void;
export declare const getConfig: () => any;
export { setLogger } from './util/logger';
export declare const start: (config?: {}) => Promise<{}>;
