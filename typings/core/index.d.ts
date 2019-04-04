/*!
 * Contentstack DataSync Manager
 * Copyright (c) 2019 Contentstack LLC
 * MIT Licensed
 */
/**
 * @description Core's primary. This is where it starts..
 * @param {Object} connector - Content connector instance
 * @param {Object} config - Application config
 */
export declare const init: (contentStore: any, assetStore: any) => Promise<{}>;
/**
 * @description Notifies the sync manager utility to wake up and start syncing..
 */
export declare const poke: () => void;
/**
 * @description Used to lockdown the 'sync' process in case of exceptions
 */
export declare const lock: () => void;
/**
 * @description Used to unlock the 'sync' process in case of errors/exceptions
 */
export declare const unlock: (refire?: any) => any;
