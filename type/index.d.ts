/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/

declare module "datasyncManager" {

    /**
     * @public
     * @interface Asset store interface
     * @summary Asset store instance interface
     */
    interface IAssetStore {
        download<T>(input: T): Promise<{
            T: any;
        }>;
        unpublish<T>(input: T): Promise<{
            T: any;
        }>;
        delete<T>(input: T): Promise<{
            T: any;
        }>;
    }
    /**
     * @public
     * @interface Content store interface
     * @summary Content store instance interface
     */
    interface IContentStore {
        publish<T>(input: T): Promise<{
            T: any;
        }>;
        unpublish<T>(input: T): Promise<{
            T: any;
        }>;
        delete<T>(input: T): Promise<{
            T: any;
        }>;
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
        debug(): any;
    }
    interface IInputData {
        _content_type_uid: string;
        uid: string;
        locale: string;
        action: string;
        [propName: string]: any;
    }


     export declare const push: (data: IInputData) => void;
     export declare const unshift: (data: IInputData) => void;
     export declare const pop: () => void;
     export declare const getAssetLocation: (asset: any) => Promise<unknown>; 

    /**
     * @public
     * @method setConfig
     * @summary Sets the application's configuration
     * @param {object} config Application config
     */
    export declare const setConfig: (config: IConfig) => void;

    export declare const getConfig: () => IConfig;

    /**
     * @public
     * @method setAssetStore
     * @summary Register asset store
     * @param {object} instance Asset store instance
     */
    export declare const setAssetStore: (instance: IAssetStore) => void;


    /**
     * @public
     * @method setContentStore
     * @summary Register content store
     * @param {object} instance Content store instance
     */
    export const setContentStore = (instance: IContentStore) => {
      contentStore = instance
    }

    /**
     * @public
     * @method setLogger
     * @summary Sets custom logger for logging data sync operations
     * @param {object} instance Custom logger instance
     */
    export { setLogger } from './util/logger'


    /**
     * @public
     * @method setListener
     * @summary Register listener
     * @param {object} instance Listener instance
     */
    export declare const setListener: (instance: ILogger) => void;

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

    /**
     * @public
     * @method debugNotifications
     * @param {object} item Item being processed
     * @returns {void}
     */
    export declare const debugNotifications: (action: any) => (item: any) => void;
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
    export declare const unlock: (refire?: boolean) => any;
}



