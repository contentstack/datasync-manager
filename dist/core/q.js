"use strict";
/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const events_1 = require("events");
const lodash_1 = require("lodash");
const _1 = require(".");
const logger_1 = require("../util/logger");
const series_1 = require("../util/series");
const unprocessible_1 = require("../util/unprocessible");
const plugins_1 = require("./plugins");
const token_management_1 = require("./token-management");
const debug = debug_1.default('q');
const notifications = new events_1.EventEmitter();
exports.notifications = notifications;
let instance = null;
/**
 * @summary Manages sync utilitiy's item queue
 * @description
 *  Handles/processes 'sync' items one at a time, firing 'before' and 'after' hooks
 */
class Q extends events_1.EventEmitter {
    /**
     * 'Q's constructor
     * @param {Object} connector - Content connector instance
     * @param {Object} config - Application config
     * @returns {Object} Returns 'Q's instance
     */
    constructor(contentStore, assetStore, config) {
        if (!instance && contentStore && assetStore && config) {
            super();
            this.pluginInstances = plugins_1.load(config);
            this.contentStore = contentStore;
            this.config = config.syncManager;
            this.iLock = false;
            this.inProgress = false;
            this.q = [];
            this.on('next', this.next);
            this.on('error', this.errorHandler);
            this.on('push', this.push);
            this.on('unshift', this.unshift);
            instance = this;
            debug('Core \'Q\' constructor initiated');
        }
        return instance;
    }
    unshift(data) {
        this.q.unshift(data);
        if (this.q.length > this.config.queue.pause_threshold) {
            this.iLock = true;
            _1.lock();
        }
        debug(`Content type '${data._content_type_uid}' received for '${data.type}'`);
        this.emit('next');
    }
    /**
     * @description Enter item into 'Q's queue
     * @param {Object} data - Formatted item from 'sync api's response
     */
    push(data) {
        this.q.push(data);
        if (this.q.length > this.config.queue.pause_threshold) {
            this.iLock = true;
            _1.lock();
        }
        debug(`Content type '${data._content_type_uid}' received for '${data.type}'`);
        this.emit('next');
    }
    /**
     * @description Handles errors in 'Q'
     * @param {Object} obj - Errorred item
     */
    errorHandler(obj) {
        notify('error', obj);
        logger_1.logger.error(obj);
        debug(`Error handler called with ${JSON.stringify(obj)}`);
        if (obj._checkpoint) {
            return token_management_1.saveToken(obj._checkpoint.name, obj._checkpoint.token).then(() => {
                return unprocessible_1.saveFailedItems(obj).then(() => {
                    this.inProgress = false;
                    this.emit('next');
                });
            }).catch((error) => {
                logger_1.logger.error('Errorred while saving token');
                logger_1.logger.error(error);
                this.inProgress = false;
                this.emit('next');
            });
        }
        return unprocessible_1.saveFailedItems(obj).then(() => {
            this.inProgress = false;
            this.emit('next');
        }).catch((error) => {
            logger_1.logger.error('Errorred while saving failed items');
            logger_1.logger.error(error);
            this.inProgress = false;
            this.emit('next');
        });
    }
    /**
     * @description Calls next item in the queue
     */
    next() {
        if (this.iLock && this.q.length < this.config.queue.resume_threshold) {
            _1.unlock(true);
            this.iLock = false;
        }
        debug(`Calling 'next'. In progress status is ${this.inProgress}, and Q length is ${this.q.length}`);
        if (!this.inProgress && this.q.length) {
            this.inProgress = true;
            const item = this.q.shift();
            if (item._checkpoint) {
                token_management_1.saveToken(item._checkpoint.name, item._checkpoint.token).then(() => {
                    this.process(item);
                }).catch((error) => {
                    logger_1.logger.error('Save token failed to save a checkpoint!');
                    logger_1.logger.error(error);
                    this.process(item);
                });
            }
            else {
                this.process(item);
            }
        }
    }
    peek() {
        return this.q;
    }
    /**
     * @description Passes and calls the appropriate methods and hooks for item execution
     * @param {Object} data - Current processing item
     */
    process(data) {
        logger_1.logger.log(`${data.type.toUpperCase()}: { content_type: '${data._content_type_uid}', ${(data.locale) ? `locale: '${data.locale}',` : ''} uid: '${data.uid}'} is in progress...`);
        notify(data.type, data);
        switch (data.type) {
            case 'publish':
                this.exec(data, data.type);
                break;
            case 'unpublish':
                this.exec(data, data.type);
                break;
            default:
                this.exec(data, data.type);
                break;
        }
    }
    /**
     * @description Execute and manager current processing item. Calling 'before' and 'after' hooks appropriately
     * @param {Object} data - Current processing item
     * @param {String} action - Action to be performed on the item (publish | unpublish | delete)
     * @param {String} beforeAction - Name of the hook to execute before the action is performed
     * @param {String} afterAction - Name of the hook to execute after the action has been performed
     * @returns {Promise} Returns promise
     */
    exec(data, action) {
        try {
            debug(`Exec: ${action}`);
            const beforeSyncInternalPlugins = [];
            let transformedData;
            let transformedSchema;
            let schema;
            if (data._content_type_uid !== '_assets') {
                schema = data._content_type;
                schema._content_type_uid = '_content_types';
                schema.event_at = data.event_at;
                schema._synced_at = data._synced_at;
                schema.locale = data.locale;
                delete data._content_type;
            }
            this.pluginInstances.internal.beforeSync.forEach((method) => {
                beforeSyncInternalPlugins.push(() => { return method(action, data, schema); });
            });
            return series_1.series(beforeSyncInternalPlugins)
                .then(() => {
                if (this.config.pluginTransformations) {
                    transformedData = data;
                    transformedSchema = schema;
                }
                else {
                    transformedData = lodash_1.cloneDeep(data);
                    transformedSchema = lodash_1.cloneDeep(schema);
                }
                // re-initializing everytime with const.. avoids memory leaks
                const beforeSyncPlugins = [];
                if (this.config.serializePlugins) {
                    this.pluginInstances.external.beforeSync.forEach((method) => {
                        beforeSyncPlugins.push(() => { return method(action, transformedData, transformedSchema); });
                    });
                    return series_1.series(beforeSyncPlugins);
                }
                else {
                    this.pluginInstances.external.beforeSync.forEach((method) => {
                        beforeSyncPlugins.push(method(action, transformedData, transformedSchema));
                    });
                    return Promise.all(beforeSyncPlugins);
                }
            })
                .then(() => {
                debug('Before action plugins executed successfully!');
                return this.contentStore[action](data);
            })
                .then(() => {
                debug(`Completed '${action}' on connector successfully!`);
                if (typeof schema === 'undefined') {
                    return;
                }
                return this.contentStore.updateContentType(schema);
            })
                .then(() => {
                debug('Connector instance called successfully!');
                // re-initializing everytime with const.. avoids memory leaks
                const afterSyncPlugins = [];
                if (this.config.serializePlugins) {
                    this.pluginInstances.external.afterSync.forEach((method) => {
                        afterSyncPlugins.push(() => { return method(action, transformedData, transformedSchema); });
                    });
                    return series_1.series(afterSyncPlugins);
                }
                else {
                    this.pluginInstances.external.afterSync.forEach((method) => {
                        afterSyncPlugins.push(method(action, transformedData, transformedSchema));
                    });
                    return Promise.all(afterSyncPlugins);
                }
            })
                .then(() => {
                debug('After action plugins executed successfully!');
                logger_1.logger.log(`${action.toUpperCase()}: { content_type: '${data._content_type_uid}', ${(data.locale) ? `locale: '${data.locale}',` : ''} uid: '${data.uid}'} completed successfully!`);
                this.inProgress = false;
                this.emit('next', data);
            })
                .catch((error) => {
                this.emit('error', {
                    data,
                    error,
                });
            });
        }
        catch (error) {
            this.emit('error', {
                data,
                error,
            });
        }
    }
}
exports.Q = Q;
const notify = (event, obj) => {
    notifications.emit(event, obj);
};
