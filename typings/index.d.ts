/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
import { notifications } from './core/q';
interface IAssetConnector {
    download(): any;
    unpublish(): any;
    delete(): any;
}
interface IContentConnector {
    publish(): any;
    unpublish(): any;
    delete(): any;
}
interface IConnector {
    start(): Promise<IAssetConnector | IContentConnector>;
    setLogger(): ILogger;
}
interface IConfig {
    locales?: any[];
    paths?: any;
    contentstack?: any;
    contentStore?: any;
    syncManager?: any;
    assetStore?: any;
}
interface ILogger {
    warn(): any;
    info(): any;
    log(): any;
    error(): any;
}
export declare const setContentStore: (instance: IConnector) => void;
export declare const setAssetStore: (instance: IConnector) => void;
export declare const setListener: (instance: ILogger) => void;
export declare const setConfig: (config: IConfig) => void;
export declare const getConfig: () => IConfig;
export { setLogger } from './util/logger';
export { notifications };
export declare const start: (config?: IConfig) => Promise<{}>;
