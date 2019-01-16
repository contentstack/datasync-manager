// Contentstack Sync Manager declaration file

/**
 * @summary Asset connector instance interface
 */
interface IAssetConnector {
  download(): any,
  unpublish(): any,
  delete(): any,
}

/**
 * @summary Content connector instance interface
 */
interface IContentConnector {
  publish(): any,
  unpublish(): any,
  delete(): any,
}

/**
 * @summary Connector interface
 */
interface IConnector {
  start(): Promise<IAssetConnector | IContentConnector | any>,
  setLogger(): ILogger
}

/**
 * @summary Application config interface
 */
interface IConfig {
  locales?: any[],
  contentstack?: any,
  'content-connector'?: any,
  'sync-manager'?: any,
  'asset-connector'?: any,
}

/**
 * @summary Logger instance interface
 */
interface ILogger {
  warn(): any,
  info(): any,
  log(): any,
  error(): any,
}

/**
 * @summary Register asset connector
 * @param {Object} instance - Asset connector instance
 */
export declare const setContentConnector: (instance: IConnector) => void

/**
 * @summary Register content connector
 * @param {Object} instance - Content connector instance
 */
export declare const setAssetConnector: (instance: IConnector) => void

/**
 * @summary Register listener
 * @param {Object} instance - Listener instance
 */
export declare const setListener: (instance: IConnector) => void

/**
 * @summary Set the application's config
 * @param {Object} config - Application config
 */
export declare const setConfig: (config: IConfig) => void

/**
 * @summary Returns the application's configuration
 * @returns {Object} - Application config
 */
export declare const getConfig: () => IConfig

/**
 * @summary Set custom logger for logging
 * @param {Object} instance - Custom logger instance
 */
export { setLogger } from './util/logger'

/**
 * @summary
 *  Starts the sync manager utility
 * @description
 *  Registers, validates asset, content connectors and listener instances.
 *  Once done, builds the app's config and logger
 * @param {Object} config - Optional application config.
 */
export declare const start: (config?: {}) => Promise<{}>
