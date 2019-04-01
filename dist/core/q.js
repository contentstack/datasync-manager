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
const core_utilities_1 = require("../util/core-utilities");
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
class Q extends events_1.EventEmitter {
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
    push(data) {
        this.q.push(data);
        if (this.q.length > this.config.syncManager.queue.pause_threshold) {
            this.iLock = true;
            _1.lock();
        }
        debug(`Content type '${data.content_type_uid}' received for '${data.action}'`);
        this.emit('next');
    }
    errorHandler(obj) {
        notify('error', obj);
        const self = this;
        logger_1.logger.error(obj);
        debug(`Error handler called with ${JSON.stringify(obj)}`);
        if (obj.data.checkpoint) {
            token_management_1.saveToken(obj.data.checkpoint.name, obj.data.checkpoint.token).then(() => {
                unprocessible_1.saveFailedItems(obj).then(() => {
                    self.inProgress = false;
                    self.emit('next');
                }).catch((error) => {
                    debug(`Save failed items failed after saving token!\n${JSON.stringify(error)}`);
                    self.inProgress = false;
                    self.emit('next');
                });
            }).catch((error) => {
                logger_1.logger.error('Errorred while saving token');
                logger_1.logger.error(error);
                self.inProgress = false;
                self.emit('next');
            });
        }
        unprocessible_1.saveFailedItems(obj).then(() => {
            self.inProgress = false;
            self.emit('next');
        }).catch((error) => {
            logger_1.logger.error('Errorred while saving failed items');
            logger_1.logger.error(error);
            self.inProgress = false;
            self.emit('next');
        });
    }
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
                    data.data = core_utilities_1.buildContentReferences(data.content_type.schema, data.data);
                }
                if (isEntry && this.detectRteMarkdownAssets && (!data.pre_processed)) {
                    let assets = core_utilities_1.getOrSetRTEMarkdownAssets(data.content_type.schema, data.data, [], true);
                    if (assets.length === 0) {
                        this.exec(data, data.action, 'beforePublish', 'afterPublish');
                        return;
                    }
                    assets = assets.map((asset) => { return this.reStructureAssetObjects(asset, data.locale); });
                    const assetBucket = [];
                    return promise_map_1.map(assets, (asset) => {
                        return new Promise((resolve, reject) => {
                            return this.assetStore.download(asset)
                                .then((updatedAsset) => {
                                assetBucket.push(updatedAsset);
                                return resolve();
                            })
                                .catch(reject);
                        });
                    }, 1)
                        .then(() => {
                        data.data = core_utilities_1.getOrSetRTEMarkdownAssets(data.content_type.schema, data.data, assetBucket, false);
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
                this.exec(data, data.action, 'beforePublish', 'afterPublish');
                break;
            case 'unpublish':
                this.exec(data, data.action, 'beforeUnpublish', 'afterUnpublish');
                break;
            default:
                this.exec(data, data.action, 'beforeDelete', 'afterDelete');
                break;
        }
    }
    reStructureAssetObjects(asset, locale) {
        return {
            content_type_uid: '_assets',
            data: asset,
            action: this.config.contentstack.actions.publish,
            locale,
            uid: asset.uid
        };
    }
    exec(data, action, beforeAction, afterAction) {
        const self = this;
        try {
            debug(`Exec called. Action is ${action}`);
            const beforeActionPlugins = [];
            const clonedData = lodash_1.cloneDeep(data);
            this.pluginInstances[beforeAction].forEach((action1) => {
                beforeActionPlugins.push(action1(data));
            });
            Promise.all(beforeActionPlugins)
                .then(() => {
                debug('Before action plugins executed successfully!');
                return self.contentStore[action](clonedData);
            }).then(() => {
                debug('Connector instance called successfully!');
                const promisifiedBucket2 = [];
                self.pluginInstances[afterAction].forEach((action2) => {
                    promisifiedBucket2.push(action2(clonedData));
                });
                return Promise.all(promisifiedBucket2);
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
