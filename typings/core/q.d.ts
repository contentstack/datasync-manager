/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
/// <reference types="node" />
import { EventEmitter } from 'events';
declare const notifications: EventEmitter;
/**
 * @summary Manages sync utilitiy's item queue
 * @description
 *  Handles/processes 'sync' items one at a time, firing 'before' and 'after' hooks
 */
export declare class Q extends EventEmitter {
    private config;
    private downloadEmbeddedAssets;
    private iLock;
    private inProgress;
    private pluginInstances;
    private assetStore;
    private contentStore;
    private q;
    /**
     * 'Q's constructor
     * @param {Object} connector - Content connector instance
     * @param {Object} config - Application config
     * @returns {Object} Returns 'Q's instance
     */
    constructor(contentStore: any, assetStore: any, config: any);
    /**
     * @description Enter item into 'Q's queue
     * @param {Object} data - Formatted item from 'sync api's response
     */
    push(data: any): void;
    /**
     * @description Handles errors in 'Q'
     * @param {Object} obj - Errorred item
     */
    errorHandler(obj: any): Promise<void>;
    /**
     * @description Calls next item in the queue
     */
    private next;
    peek(): any;
    /**
     * @description Passes and calls the appropriate methods and hooks for item execution
     * @param {Object} data - Current processing item
     */
    private process;
    private reStructureAssetObjects;
    /**
     * @description Execute and manager current processing item. Calling 'before' and 'after' hooks appropriately
     * @param {Object} data - Current processing item
     * @param {String} action - Action to be performed on the item (publish | unpublish | delete)
     * @param {String} beforeAction - Name of the hook to execute before the action is performed
     * @param {String} afterAction - Name of the hook to execute after the action has been performed
     * @returns {Promise} Returns promise
     */
    private exec;
}
export { notifications };
