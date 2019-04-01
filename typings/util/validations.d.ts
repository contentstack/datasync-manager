/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
export declare const validateConfig: (config: any) => void;
export declare const validateInstances: (assetStore: any, contentStore: any, listener: any) => void;
export declare const validateContentConnector: (instance: any) => void;
export declare const validateAssetConnector: (instance: any) => void;
export declare const validateListener: (instance: any) => void;
export declare const validateLogger: (instance: any) => boolean;
export declare const validateItemStructure: (item: any) => boolean;
