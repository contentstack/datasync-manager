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
const __1 = require("../");
const api_1 = require("../api");
const fs_1 = require("../util/fs");
const index_1 = require("../util/index");
const logger_1 = require("../util/logger");
const promise_map_1 = require("../util/promise.map");
const inet_1 = require("./inet");
const q_1 = require("./q");
const token_management_1 = require("./token-management");
const debug = debug_1.default('sync-core');
const emitter = new events_1.EventEmitter();
const formattedAssetType = '_assets';
const formattedContentType = '_content_types';
const flag = {
    SQ: false,
    WQ: false,
    lockdown: false,
};
let config;
let Contentstack;
let Q;
/**
 * @description Core's primary. This is where it starts..
 * @param {Object} connector - Content connector instance
 * @param {Object} config - Application config
 */
exports.init = (contentStore, assetStore) => {
    config = __1.getConfig();
    Q = new q_1.Q(contentStore, assetStore, config);
    api_1.init(config.contentstack);
    debug('Sync core:start invoked');
    return new Promise((resolve, reject) => {
        try {
            Contentstack = config.contentstack;
            const paths = config.paths;
            console.log(config.paths);
            const environment = process.env.NODE_ENV || Contentstack.environment || 'development';
            debug(`Environment: ${environment}`);
            const request = {
                qs: {
                    environment,
                    limit: config.syncManager.limit,
                },
            };
            if (typeof Contentstack.sync_token === 'string' && Contentstack.sync_token.length !== 0) {
                request.qs.sync_token = Contentstack.sync_token;
            }
            else if (typeof Contentstack.pagination_token === 'string' && Contentstack.pagination_token.length !== 0) {
                request.qs.pagination_token = Contentstack.pagination_token;
            }
            else if (fs_1.existsSync(paths.token)) {
                const token = JSON.parse(fs_1.readFileSync(paths.token));
                console.log(paths.token);
                request.qs[token.name] = token.token;
            }
            else {
                request.qs.init = true;
                if (config.syncManager.filters && typeof config.syncManager.filters === 'object') {
                    const filters = config.syncManager.filters;
                    // tslint:disable-next-line: forin
                    for (const filter in filters) {
                        request.qs[filter] = filters[filter].join(',');
                    }
                }
            }
            console.log(JSON.stringify(request));
            return fire(request)
                .then(resolve)
                .catch(reject);
        }
        catch (error) {
            return reject(error);
        }
    });
};
exports.push = (data) => {
    Q.emit('push', data);
};
exports.unshift = (data) => {
    Q.emit('push', data);
};
exports.pop = () => {
    Q.emit('pop');
};
/**
 * @description Notifies the sync manager utility to wake up and start syncing..
 */
exports.poke = () => {
    logger_1.logger.info('Received \'contentstack sync\' notification');
    if (!flag.lockdown) {
        flag.WQ = true;
        check();
    }
};
/**
 * @description Check's if the status of the app when a new incoming notification is fired
 * @description Starts processing if the 'SQ: false'
 */
const check = () => {
    debug(`Check called. SQ status is ${flag.SQ} and WQ status is ${flag.WQ}`);
    if (!flag.SQ && flag.WQ) {
        flag.WQ = false;
        flag.SQ = true;
        sync().then(() => {
            debug(`Sync completed and SQ flag updated. Cooloff duration is ${config.syncManager.cooloff}`);
            setTimeout(() => {
                flag.SQ = false;
                emitter.emit('check');
            }, config.syncManager.cooloff);
        }).catch((error) => {
            logger_1.logger.error(error);
            check();
        });
    }
};
/**
 * @description Gets saved token, builds request object and fires the sync process
 */
const sync = () => {
    return new Promise((resolve, reject) => {
        return token_management_1.getFinalToken().then((tokenObject) => {
            const token = tokenObject;
            console.log(token);
            process.exit(0);
            const request = {
                qs: {
                    environment: process.env.SYNC_ENV || Contentstack.environment || 'development',
                    limit: config.syncManager.limit,
                    [token.name]: token.token,
                },
            };
            return fire(request)
                .then(resolve);
        }).catch((error) => {
            return reject(error);
        });
    });
};
/**
 * @description Used to lockdown the 'sync' process in case of exceptions
 */
exports.lock = () => {
    debug('Contentstack sync locked..');
    flag.lockdown = true;
};
/**
 * @description Used to unlock the 'sync' process in case of errors/exceptions
 */
exports.unlock = (refire) => {
    debug('Contentstack sync unlocked..', refire);
    flag.lockdown = false;
    if (typeof refire === 'boolean' && refire) {
        flag.WQ = true;
        if (flag.requestCache && Object.keys(flag.requestCache)) {
            return fire(flag.requestCache.params)
                .then(flag.requestCache.resolve)
                .catch(flag.requestCache.reject);
        }
    }
    check();
};
/**
 * @description Description required
 * @param {Object} req - Contentstack sync API request object
 */
const fire = (req) => {
    debug(`Fire called with: ${JSON.stringify(req)}`);
    flag.SQ = true;
    return new Promise((resolve, reject) => {
        return api_1.get(req).then((response) => {
            delete req.qs.init;
            delete req.qs.pagination_token;
            delete req.qs.sync_token;
            delete req.path;
            const syncResponse = response;
            if (syncResponse.items.length) {
                return index_1.filterItems(syncResponse, config).then(() => {
                    if (syncResponse.items.length === 0) {
                        return postProcess(req, syncResponse)
                            .then(resolve)
                            .catch(reject);
                    }
                    syncResponse.items = index_1.formatItems(syncResponse.items, config);
                    let groupedItems = index_1.groupItems(syncResponse.items);
                    groupedItems = index_1.markCheckpoint(groupedItems, syncResponse);
                    // send assets data for processing
                    if (groupedItems[formattedAssetType]) {
                        groupedItems[formattedAssetType].forEach((asset) => {
                            Q.push(asset);
                        });
                        delete groupedItems[formattedAssetType];
                    }
                    if (groupedItems[formattedContentType]) {
                        groupedItems[formattedContentType].forEach((contentType) => {
                            Q.push(contentType);
                        });
                        delete groupedItems[formattedContentType];
                    }
                    const contentTypeUids = Object.keys(groupedItems);
                    lodash_1.remove(contentTypeUids, (contentTypeUid) => {
                        const contentType = groupedItems[contentTypeUid];
                        if (contentType.length === 1 && !contentType[0].publish_details) {
                            Q.push(contentType[0]);
                            return true;
                        }
                        return false;
                    });
                    return promise_map_1.map(contentTypeUids, (uid) => {
                        return new Promise((mapResolve, mapReject) => {
                            return api_1.get({
                                path: `${Contentstack.apis.content_types}${uid}`,
                                qs: {
                                    include_snippet_schema: (typeof config.contentstack.query.include_snippet_schema == 'boolean' && config.contentstack.query.include_snippet_schema == true),
                                }
                            }).then((contentTypeSchemaResponse) => {
                                const schemaResponse = contentTypeSchemaResponse;
                                if (schemaResponse.content_type) {
                                    const items = groupedItems[uid];
                                    items.forEach((entry) => {
                                        entry._content_type = lodash_1.cloneDeep(schemaResponse.content_type);
                                        Q.push(entry);
                                    });
                                    return mapResolve();
                                }
                                const err = new Error('Content type ${uid} schema not found!');
                                // Illegal content type call
                                err.code = 'ICTC';
                                return mapReject(err);
                            }).catch((error) => {
                                if (inet_1.netConnectivityIssues(error)) {
                                    flag.SQ = false;
                                }
                                return mapReject(error);
                            });
                        });
                    }, 2).then(() => {
                        return postProcess(req, syncResponse)
                            .then(resolve)
                            .catch(reject);
                    }).catch((error) => {
                        if (inet_1.netConnectivityIssues(error)) {
                            flag.SQ = false;
                        }
                        // Errorred while fetching content type schema
                        return reject(error);
                    });
                }).catch((processError) => {
                    return reject(processError);
                });
            }
            return postProcess(req, syncResponse)
                .then(resolve);
        }).catch((error) => {
            if (inet_1.netConnectivityIssues(error)) {
                flag.SQ = false;
            }
            // do something
            return reject(error);
        });
    });
};
/**
 * @description Process data once 'sync' data has been fetched
 * @param {Object} req - Sync API request object
 * @param {Object} resp - Sync API response object
 */
const postProcess = (req, resp) => {
    return new Promise((resolve, reject) => {
        let name;
        if (resp.pagination_token) {
            name = 'pagination_token';
        }
        else {
            name = 'sync_token';
        }
        return token_management_1.saveCheckpoint(name, resp[name])
            .then(() => {
            // re-fire!
            req.qs[name] = resp[name];
            if (flag.lockdown) {
                logger_1.logger.log('Checkpoint: lockdown has been invoked');
                flag.requestCache = {
                    params: req,
                    reject,
                    resolve,
                };
            }
            else {
                if (name === 'sync_token') {
                    flag.SQ = false;
                    return resolve();
                }
                return fire(req)
                    .then(resolve)
                    .catch(reject);
            }
        })
            .catch(reject);
    });
};
emitter.on('check', check);
