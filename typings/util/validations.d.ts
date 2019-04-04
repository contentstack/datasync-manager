/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
/**
 * @description Check's if the application's config is enough to start the app without errors
 * @param {Object} config - Application config
 */
export declare const validateConfig: (config: any) => void;
/**
 * @description Validates registered instances
 * @param {Object} assetStore - Asset store instance
 * @param {Object} contentStore - Content store instance
 * @param {Object} listener - Listener instance
 */
export declare const validateInstances: (assetStore: any, contentStore: any, listener: any) => void;
/**
 * @description Validates if the registered content store supports required methods
 * @param {Object} instance - Content store instance
 */
export declare const validateContentConnector: (instance: any) => void;
/**
 * @description Validates if the registered asset store supports required methods
 * @param {Object} instance - Asset store instance
 */
export declare const validateAssetConnector: (instance: any) => void;
/**
 * @description Validates if the registered listener supports required methods
 * @param {Object} instance - Listener instance
 */
export declare const validateListener: (instance: any) => void;
/**
 * @description Validates if the custom logger set supports required methods
 * @param {Object} instance - Custom logger instance
 */
export declare const validateLogger: (instance: any) => boolean;
export declare const validateItemStructure: (item: any) => boolean;
