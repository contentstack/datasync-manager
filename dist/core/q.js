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
const index_1 = require("../util/index");
const _1 = require(".");
const logger_1 = require("../util/logger");
const promise_map_1 = require("../util/promise.map");
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
            this.detectRteMarkdownAssets = (config.contentStore && typeof config.contentStore.enableRteMarkdownDownload === 'boolean') ? config.contentStore.enableRteMarkdownDownload : true;
            this.pluginInstances = plugins_1.load(config);
            this.contentStore = contentStore;
            this.assetStore = assetStore;
            this.config = config;
            this.pluginInstances = plugins_1.load(config);
            this.iLock = false;
            this.inProgress = false;
            this.q = [];
            this.config = config;
            this.on('next', this.next);
            this.on('error', this.errorHandler);
            instance = this;
            debug('Core \'Q\' constructor initiated');
        }
        return instance;
    }
    /**
     * @description Enter item into 'Q's queue
     * @param {Object} data - Formatted item from 'sync api's response
     */
    push(data) {
        this.q.push(data);
        if (this.q.length > this.config.syncManager.queue.pause_threshold) {
            this.iLock = true;
            _1.lock();
        }
        debug(`Content type '${data.content_type_uid}' received for '${data.action}'`);
        this.emit('next');
    }
    /**
     * @description Handles errors in 'Q'
     * @param {Object} obj - Errorred item
     */
    errorHandler(obj) {
        notify('error', obj);
        const self = this;
        logger_1.logger.error(obj);
        debug(`Error handler called with ${JSON.stringify(obj)}`);
        if (obj.data.checkpoint) {
            return token_management_1.saveToken(obj.data.checkpoint.name, obj.data.checkpoint.token).then(() => {
                unprocessible_1.saveFailedItems(obj).then(() => {
                    self.inProgress = false;
                    self.emit('next');
                }).catch((error) => {
                    debug(`Save failed items failed after saving token!\n${JSON.stringify(error)}`);
                    self.inProgress = false;
                    // fatal error
                    self.emit('next');
                });
            }).catch((error) => {
                logger_1.logger.error('Errorred while saving token');
                logger_1.logger.error(error);
                self.inProgress = false;
                self.emit('next');
            });
        }
        return unprocessible_1.saveFailedItems(obj).then(() => {
            self.inProgress = false;
            self.emit('next');
        }).catch((error) => {
            logger_1.logger.error('Errorred while saving failed items');
            logger_1.logger.error(error);
            self.inProgress = false;
            self.emit('next');
        });
    }
    /**
     * @description Calls next item in the queue
     */
    next() {
        if (this.iLock && this.q.length < this.config.syncManager.queue.resume_threshold) {
            _1.unlock(true);
            this.iLock = false;
        }
        const self = this;
        debug(`Calling 'next'. In progress status is ${this.inProgress}, and Q length is ${this.q.length}`);
        if (!this.inProgress && this.q.length) {
            this.inProgress = true;
            const item = this.q.shift();
            if (item.checkpoint) {
                token_management_1.saveToken(item.checkpoint.name, item.checkpoint.token).then(() => {
                    self.process(item);
                }).catch((error) => {
                    logger_1.logger.error('Save token failed to save a checkpoint!');
                    logger_1.logger.error(error);
                    self.process(item);
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
        const { content_type_uid, uid } = data;
        if (content_type_uid === '_content_types') {
            logger_1.logger.log(`${data.action.toUpperCase()}ING: { content_type: '${content_type_uid}', uid: '${uid}'}`);
        }
        else {
            const { locale } = data;
            logger_1.logger.log(`${data.action.toUpperCase()}ING: { content_type: '${content_type_uid}', locale: '${locale}', uid: '${uid}'}`);
        }
        notify(data.action, data);
        switch (data.action) {
            case 'publish':
                const isEntry = ['_assets', '_content_types'].indexOf(data.content_type_uid) === -1;
                if (isEntry) {
                    data.data = index_1.buildContentReferences(data.content_type.schema, data.data);
                    data.content_type.references = index_1.buildReferences(data.content_type.schema);
                }
                if (isEntry && this.detectRteMarkdownAssets && (!data.pre_processed)) {
                    let assets = index_1.getOrSetRTEMarkdownAssets(data.content_type.schema, data.data, [], true);
                    // if no assets were found in the RTE/Markdown
                    if (assets.length === 0) {
                        this.exec(data, data.action);
                        return;
                    }
                    assets = assets.map((asset) => { return this.reStructureAssetObjects(asset, data.locale); });
                    const assetBucket = [];
                    return promise_map_1.map(assets, (asset) => {
                        return new Promise((resolve, reject) => {
                            return this.assetStore.download(asset.data)
                                .then((updatedAsset) => {
                                asset.data = updatedAsset;
                                assetBucket.push(asset);
                                return resolve();
                            })
                                .catch(reject);
                        });
                    }, 1)
                        .then(() => {
                        data.data = index_1.getOrSetRTEMarkdownAssets(data.content_type.schema, data.data, assetBucket, false);
                        data.pre_processed = true;
                        this.q.unshift(data);
                        assetBucket.forEach((asset) => {
                            if (asset && typeof asset === 'object' && asset.data) {
                                this.q.unshift(asset);
                            }
                        });
                        this.inProgress = false;
                        this.emit('next');
                    })
                        .catch((error) => {
                        this.emit('error', {
                            data,
                            error
                        });
                    });
                }
                this.exec(data, data.action);
                break;
            case 'unpublish':
                this.exec(data, data.action);
                break;
            default:
                this.exec(data, data.action);
                break;
        }
    }
    reStructureAssetObjects(asset, locale) {
        // add locale key to inside of asset
        asset.locale = locale;
        return {
            content_type_uid: '_assets',
            data: asset,
            action: this.config.contentstack.actions.publish,
            locale,
            uid: asset.uid
        };
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
        const self = this;
        try {
            debug(`Exec called. Action is ${action}`);
            const beforeSyncPlugins = [];
            const clonedData = lodash_1.cloneDeep(data);
            this.pluginInstances.beforeSync.forEach((method) => {
                beforeSyncPlugins.push(method(data, action));
            });
            Promise.all(beforeSyncPlugins)
                .then(() => {
                debug('Before action plugins executed successfully!');
                return self.contentStore[action](clonedData);
            }).then(() => {
                debug('Connector instance called successfully!');
                const afterSyncPlugins = [];
                self.pluginInstances.afterSync.forEach((method) => {
                    afterSyncPlugins.push(method(clonedData));
                });
                return Promise.all(afterSyncPlugins);
            }).then(() => {
                debug('After action plugins executed successfully!');
                const { content_type_uid, uid } = data;
                if (content_type_uid === '_content_types') {
                    logger_1.logger.log(`${action.toUpperCase()}ED: { content_type: '${content_type_uid}', uid: '${uid}'}`);
                }
                else {
                    const { locale } = data;
                    logger_1.logger.log(`${action.toUpperCase()}ED: { content_type: '${content_type_uid}', locale: '${locale}', uid: '${uid}'}`);
                }
                self.inProgress = false;
                self.emit('next', data);
            }).catch((error) => {
                self.emit('error', {
                    data,
                    error,
                });
            });
        }
        catch (error) {
            self.emit('error', {
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
