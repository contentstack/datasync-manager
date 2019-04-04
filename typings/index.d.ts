/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
import { notifications } from './core/q';
/**
 * @public
 * @interface Asset store interface
 * @summary Asset store instance interface
 */
interface IAssetStore {
    download(): any;
    unpublish(): any;
    delete(): any;
}
/**
 * @public
 * @interface Content store interface
 * @summary Content store instance interface
 */
interface IContentStore {
    publish(): any;
    unpublish(): any;
    delete(): any;
}
/**
 * @summary Application config interface
 */
interface IConfig {
    locales?: any[];
    paths?: any;
    contentstack?: any;
    contentStore?: any;
    syncManager?: any;
    assetStore?: any;
}
/**
 * @summary Logger instance interface
 */
interface ILogger {
    warn(): any;
    info(): any;
    log(): any;
    error(): any;
}
/**
 * @public
 * @method setContentStore
 * @summary Register content store
 * @param {object} instance Content store instance
 */
export declare const setContentStore: (instance: IContentStore) => void;
/**
 * @public
 * @method setAssetStore
 * @summary Register asset store
 * @param {object} instance Asset store instance
 */
export declare const setAssetStore: (instance: IAssetStore) => void;
/**
 * @public
 * @method setListener
 * @summary Register listener
 * @param {object} instance Listener instance
 */
export declare const setListener: (instance: ILogger) => void;
/**
 * @public
 * @method setConfig
 * @summary Sets the application's configuration
 * @param {object} config Application config
 */
export declare const setConfig: (config: IConfig) => void;
/**
 * @public
 * @method getConfig
 * @summary Returns the application's configuration
 * @returns {object} Application config
 */
export declare const getConfig: () => IConfig;
/**
 * @public
 * @method setLogger
 * @summary Sets custom logger for logging data sync operations
 * @param {object} instance Custom logger instance
 */
export { setLogger } from './util/logger';
/**
 * @public
 * @member notifications
 * @summary Event emitter object, that allows client notifications on event raised by sync-manager queue
 * @returns {EventEmitter} An event-emitter object. Events raised - publish, unpublish, delete, error
 */
export { notifications };
/**
 * @public
 * @method start
 * @summary Starts the sync manager utility
 * @description
 * Registers, validates asset, content stores and listener instances.
 * Once done, builds the app's config and logger
 * @param {object} config Optional application config overrides
 * @returns {Promise} Returns a promise
 */
export declare const start: (config?: IConfig) => Promise<{}>;
