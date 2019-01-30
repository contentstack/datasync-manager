"use strict";
/*!
 * Contentstack Sync Manager
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
const core_utilities_1 = require("../util/core-utilities");
const fs_1 = require("../util/fs");
const logger_1 = require("../util/logger");
const promise_map_1 = require("../util/promise.map");
const q_1 = require("./q");
const token_management_1 = require("./token-management");
const debug = debug_1.default('sm:core-sync');
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
exports.init = (connector) => {
    config = __1.getConfig();
    Q = new q_1.Q(connector, config);
    api_1.init(config.contentstack);
    debug('Sync core:start invoked');
    return new Promise((resolve, reject) => {
        try {
            Contentstack = config.contentstack;
            const paths = config.paths;
            const environment = process.env.NODE_ENV || Contentstack.environment || 'development';
            debug(`Environment: ${environment}`);
            const request = {
                qs: {
                    environment,
                    limit: config['sync-manager'].limit,
                },
            };
            if (typeof Contentstack.sync_token === 'string' && Contentstack.sync_token.length !== 0) {
                request.qs.sync_token = Contentstack.sync_token;
            }
            else if (typeof Contentstack.pagination_token === 'string' && Contentstack.pagination_token.length !== 0) {
                request.qs.pagination_token = Contentstack.pagination_token;
            }
            else if (fs_1.existsSync(paths.token.checkpoint)) {
                const token = JSON.parse(fs_1.readFileSync(paths.token.checkpoint));
                request.qs[token.name] = token.token;
            }
            else {
                request.qs.init = true;
            }
            return fire(request)
                .then(resolve)
                .catch(reject);
        }
        catch (error) {
            return reject(error);
        }
    });
};
exports.poke = () => {
    logger_1.logger.info('Received \'contentstack sync\' notification');
    if (!flag.lockdown) {
        flag.WQ = true;
        check();
    }
};
const check = () => {
    debug(`Check called. SQ status is ${flag.SQ} and WQ status is ${flag.WQ}`);
    if (!flag.SQ && flag.WQ) {
        flag.WQ = false;
        flag.SQ = true;
        sync().then(() => {
            debug(`Sync completed and SQ flag updated. Cooloff duration is ${config['sync-manager'].cooloff}`);
            return setTimeout(() => {
                flag.SQ = false;
                emitter.emit('check');
            }, config['sync-manager'].cooloff);
        }).catch((error) => {
            logger_1.logger.error(error);
            return check();
        });
    }
};
const sync = () => {
    return new Promise((resolve, reject) => {
        return token_management_1.getTokenByType('checkpoint').then((tokenObject) => {
            const token = tokenObject;
            const request = {
                qs: {
                    environment: process.env.SYNC_ENV || Contentstack.environment || 'development',
                    limit: config['sync-manager'].limit,
                    [token.name]: token.token,
                },
            };
            return fire(request)
                .then(resolve)
                .catch(reject);
        }).catch((error) => {
            logger_1.logger.error(error);
        });
    });
};
exports.lock = () => {
    logger_1.logger.info('Contentstack sync locked..');
    flag.lockdown = true;
};
exports.unlock = () => {
    logger_1.logger.info('Contentstack sync unlocked..');
    flag.lockdown = false;
    check();
};
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
                return core_utilities_1.filterItems(syncResponse, config).then(() => {
                    syncResponse.items = core_utilities_1.formatItems(syncResponse.items, config);
                    let groupedItems = core_utilities_1.groupItems(syncResponse.items);
                    groupedItems = core_utilities_1.markCheckpoint(groupedItems, syncResponse);
                    if (groupedItems[formattedAssetType]) {
                        groupedItems[formattedAssetType].forEach((asset) => {
                            Q.push(asset);
                        });
                        delete groupedItems[formattedAssetType];
                    }
                    else if (groupedItems[formattedContentType]) {
                        groupedItems[formattedContentType].forEach((contentType) => {
                            Q.push(contentType);
                        });
                        delete groupedItems[formattedContentType];
                    }
                    const contentTypeUids = Object.keys(groupedItems);
                    lodash_1.remove(contentTypeUids, (contentTypeUid) => {
                        const contentType = groupedItems[contentTypeUid];
                        if (contentType.length === 1 && !contentType[0].data.publish_details) {
                            Q.push(contentType[0]);
                            return true;
                        }
                        return false;
                    });
                    return promise_map_1.map(contentTypeUids, (uid) => {
                        return new Promise((mapResolve, mapReject) => {
                            return api_1.get({
                                path: `${Contentstack.apis.content_types}${uid}`,
                            }).then((contentTypeSchemaResponse) => {
                                const schemaResponse = contentTypeSchemaResponse;
                                if (schemaResponse.content_type) {
                                    const items = groupedItems[uid];
                                    items.forEach((entry) => {
                                        entry.content_type = lodash_1.cloneDeep(schemaResponse.content_type);
                                        Q.push(entry);
                                    });
                                    return mapResolve();
                                }
                                const err = new Error('Content type ${uid} schema not found!');
                                err.code = 'ICTC';
                                return mapReject(err);
                            }).catch((error) => {
                                return mapReject(error);
                            });
                        });
                    }, 2).then(() => {
                        return postProcess(req, syncResponse)
                            .then(resolve)
                            .catch(reject);
                    }).catch((error) => {
                        return reject(error);
                    });
                }).catch((processError) => {
                    return reject(processError);
                });
            }
            return postProcess(req, syncResponse)
                .then(resolve)
                .catch(reject);
        }).catch((error) => {
            return reject(error);
        });
    });
};
const postProcess = (req, resp) => {
    return new Promise((resolve, reject) => {
        let name;
        if (resp.pagination_token) {
            name = 'pagination_token';
        }
        else {
            name = 'sync_token';
        }
        return token_management_1.saveToken(name, resp[name], 'current').then(() => {
            req.qs[name] = resp[name];
            if (name === 'sync_token') {
                flag.SQ = false;
                return resolve();
            }
            return fire(req)
                .then(resolve)
                .catch(reject);
        }).catch((error) => {
            return reject(error);
        });
    });
};
emitter.on('check', check);
