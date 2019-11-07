"use strict";
/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const events_1 = require("events");
const lodash_1 = require("lodash");
const _1 = require(".");
const index_1 = require("../util/index");
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
            this.syncManager = config.syncManager;
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
        if (this.q.length > this.syncManager.queue.pause_threshold) {
            this.iLock = true;
            _1.lock();
        }
        debug(`Content type '${data._content_type_uid}' received for '${data._type}'`);
        this.emit('next');
    }
    /**
     * @description Enter item into 'Q's queue
     * @param {Object} data - Formatted item from 'sync api's response
     */
    push(data) {
        this.q.push(data);
        if (this.q.length > this.syncManager.queue.pause_threshold) {
            this.iLock = true;
            _1.lock();
        }
        debug(`Content type '${data._content_type_uid}' received for '${data._type}'`);
        this.emit('next');
    }
    /**
     * @description Handles errors in 'Q'
     * @param {Object} obj - Errorred item
     */
    errorHandler(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const that = this;
            try {
                notify('error', obj);
                logger_1.logger.error(obj);
                debug(`Error handler called with ${JSON.stringify(obj)}`);
                if (typeof obj.checkpoint !== 'undefined') {
                    yield token_management_1.saveToken(obj.checkpoint.name, obj.checkpoint.token);
                }
                yield unprocessible_1.saveFailedItems(obj);
                this.inProgress = false;
                this.emit('next');
            }
            catch (error) {
                // probably, the context could change
                logger_1.logger.error('Something went wrong in errorHandler!');
                logger_1.logger.error(error);
                that.inProgress = false;
                that.emit('next');
            }
        });
    }
    peek() {
        return this.q;
    }
    /**
     * @description Calls next item in the queue
     */
    next() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (this.iLock && this.q.length < this.syncManager.queue.resume_threshold) {
                    _1.unlock(true);
                    this.iLock = false;
                }
                debug(`Calling 'next'. In progress status is ${this.inProgress}, and Q length is ${this.q.length}`);
                if (!this.inProgress && this.q.length) {
                    this.inProgress = true;
                    const item = this.q.shift();
                    this.process(item);
                }
            }
            catch (error) {
                logger_1.logger.error(error);
                this.inProgress = false;
                this.emit('next');
            }
        });
    }
    /**
     * @description Passes and calls the appropriate methods and hooks for item execution
     * @param {Object} data - Current processing item
     */
    process(data) {
        notify(data._type, data);
        switch (data._type) {
            case 'publish':
                this.exec(data, data._type);
                break;
            case 'unpublish':
                this.exec(data, data._type);
                break;
            default:
                this.exec(data, data._type);
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
        return __awaiter(this, void 0, void 0, function* () {
            let checkpoint;
            try {
                const type = data._type.toUpperCase();
                const contentType = data._content_type_uid;
                const locale = data.locale;
                const uid = data.uid;
                if (data.hasOwnProperty('_checkpoint')) {
                    checkpoint = data._checkpoint;
                    delete data._checkpoint;
                }
                debug(`Executing: ${JSON.stringify(data)}`);
                const beforeSyncInternalPlugins = [];
                // re-initializing everytime with const.. avoids memory leaks
                const beforeSyncPlugins = [];
                // re-initializing everytime with const.. avoids memory leaks
                const afterSyncPlugins = [];
                let transformedData;
                let transformedSchema;
                let { schema } = index_1.getSchema(action, data);
                data = index_1.filterUnwantedKeys(action, data);
                if (typeof schema !== 'undefined') {
                    schema = index_1.filterUnwantedKeys(action, schema);
                }
                logger_1.logger.log(`${type}: { content_type: '${contentType}', ${(locale) ? `locale: '${locale}',` : ''} uid: '${uid}'} is in progress`);
                this.pluginInstances.internal.beforeSync.forEach((method) => {
                    beforeSyncInternalPlugins.push(() => method(action, data, schema));
                });
                yield series_1.series(beforeSyncInternalPlugins);
                if (this.syncManager.pluginTransformations) {
                    transformedData = data;
                    transformedSchema = schema;
                }
                else {
                    transformedData = lodash_1.cloneDeep(data);
                    transformedSchema = lodash_1.cloneDeep(schema);
                }
                if (this.syncManager.serializePlugins) {
                    this.pluginInstances.external.beforeSync.forEach((method) => {
                        beforeSyncPlugins.push(() => method(action, transformedData, transformedSchema));
                    });
                    yield series_1.series(beforeSyncPlugins);
                }
                else {
                    this.pluginInstances.external.beforeSync.forEach((method) => {
                        beforeSyncPlugins.push(method(action, transformedData, transformedSchema));
                    });
                    yield Promise.all(beforeSyncPlugins);
                }
                let isInit = data._isInit;
                delete data._isInit;
                debug('Before action plugins executed successfully!');
                yield this.contentStore[action](data);
                debug(`Completed '${action}' on connector successfully!`);
                data._isInit = isInit;
                if (typeof schema !== 'undefined') {
                    yield this.contentStore.updateContentType(schema);
                }
                debug('Connector instance called successfully!');
                if (this.syncManager.serializePlugins) {
                    this.pluginInstances.external.afterSync.forEach((method) => {
                        afterSyncPlugins.push(() => method(action, transformedData, transformedSchema));
                    });
                    yield series_1.series(afterSyncPlugins);
                }
                else {
                    this.pluginInstances.external.afterSync.forEach((method) => {
                        afterSyncPlugins.push(method(action, transformedData, transformedSchema));
                    });
                    yield Promise.all(afterSyncPlugins);
                }
                if (typeof checkpoint !== 'undefined') {
                    yield token_management_1.saveToken(checkpoint.name, checkpoint.token);
                }
                debug('After action plugins executed successfully!');
                logger_1.logger.log(`${type}: { content_type: '${contentType}', ${(locale) ? `locale: '${locale}',` : ''} uid: '${uid}'} was completed successfully!`);
                if (this.q.length === 0) {
                    let syncType = isInit ? "initialSync" : "webhookBasedSync";
                    notify(syncType, data);
                }
                this.inProgress = false;
                this.emit('next', data);
            }
            catch (error) {
                this.emit('error', {
                    data,
                    error,
                    // tslint:disable-next-line: object-literal-sort-keys
                    checkpoint,
                });
            }
        });
    }
}
exports.Q = Q;
const notify = (event, obj) => {
    notifications.emit(event, obj);
};
