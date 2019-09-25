"use strict";
/*!
 * Contentstack DataSync Manager
 * Copyright (c) 2019 Contentstack LLC
 * MIT Licensed
 */
exports.__esModule = true;
var debug_1 = require("debug");
var events_1 = require("events");
var lodash_1 = require("lodash");
var __1 = require("../");
var api_1 = require("../api");
var fs_1 = require("../util/fs");
var index_1 = require("../util/index");
var logger_1 = require("../util/logger");
var promise_map_1 = require("../util/promise.map");
var inet_1 = require("./inet");
var q_1 = require("./q");
var token_management_1 = require("./token-management");
var debug = debug_1["default"]('sync-core');
var emitter = new events_1.EventEmitter();
var formattedAssetType = '_assets';
var formattedContentType = '_content_types';
var flag = {
    SQ: false,
    WQ: false,
    lockdown: false
};
var config;
var Contentstack;
var Q;
/**
 * @description Core's primary. This is where it starts..
 * @param {Object} connector - Content connector instance
 * @param {Object} config - Application config
 */
exports.init = function (contentStore, assetStore) {
    config = __1.getConfig();
    Q = new q_1.Q(contentStore, assetStore, config);
    api_1.init(config.contentstack);
    debug('Sync core:start invoked');
    return new Promise(function (resolve, reject) {
        try {
            Contentstack = config.contentstack;
            var paths = config.paths;
            var environment = process.env.NODE_ENV || Contentstack.environment || 'development';
            debug("Environment: " + environment);
            var request = {
                qs: {
                    environment: environment,
                    limit: config.syncManager.limit
                }
            };
            if (typeof Contentstack.sync_token === 'string' && Contentstack.sync_token.length !== 0) {
                request.qs.sync_token = Contentstack.sync_token;
            }
            else if (typeof Contentstack.pagination_token === 'string' && Contentstack.pagination_token.length !== 0) {
                request.qs.pagination_token = Contentstack.pagination_token;
            }
            else if (fs_1.existsSync(paths.token)) {
                var token = JSON.parse(fs_1.readFileSync(paths.token));
                request.qs[token.name] = token.token;
            }
            else {
                request.qs.init = true;
                if (config.syncManager.filters && typeof config.syncManager.filters === 'object') {
                    var filters = config.syncManager.filters;
                    // tslint:disable-next-line: forin
                    for (var filter in filters) {
                        request.qs[filter] = filters[filter].join(',');
                    }
                }
            }
            return fire(request)
                .then(resolve)["catch"](reject);
        }
        catch (error) {
            return reject(error);
        }
    });
};
exports.push = function (data) {
    Q.emit('push', data);
};
exports.unshift = function (data) {
    Q.emit('push', data);
};
exports.pop = function () {
    Q.emit('pop');
};
/**
 * @description Notifies the sync manager utility to wake up and start syncing..
 */
exports.poke = function () {
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
var check = function () {
    debug("Check called. SQ status is " + flag.SQ + " and WQ status is " + flag.WQ);
    if (!flag.SQ && flag.WQ) {
        flag.WQ = false;
        flag.SQ = true;
        sync().then(function () {
            debug("Sync completed and SQ flag updated. Cooloff duration is " + config.syncManager.cooloff);
            setTimeout(function () {
                flag.SQ = false;
                emitter.emit('check');
            }, config.syncManager.cooloff);
        })["catch"](function (error) {
            logger_1.logger.error(error);
            check();
        });
    }
};
/**
 * @description Gets saved token, builds request object and fires the sync process
 */
var sync = function () {
    return new Promise(function (resolve, reject) {
        return token_management_1.getToken().then(function (tokenObject) {
            var _a;
            var token = tokenObject;
            var request = {
                qs: (_a = {
                        environment: process.env.SYNC_ENV || Contentstack.environment || 'development',
                        limit: config.syncManager.limit
                    },
                    _a[token.name] = token.token,
                    _a)
            };
            return fire(request)
                .then(resolve);
        })["catch"](function (error) {
            return reject(error);
        });
    });
};
/**
 * @description Used to lockdown the 'sync' process in case of exceptions
 */
exports.lock = function () {
    debug('Contentstack sync locked..');
    flag.lockdown = true;
};
/**
 * @description Used to unlock the 'sync' process in case of errors/exceptions
 */
exports.unlock = function (refire) {
    debug('Contentstack sync unlocked..', refire);
    flag.lockdown = false;
    if (typeof refire === 'boolean' && refire) {
        flag.WQ = true;
        if (flag.requestCache && Object.keys(flag.requestCache)) {
            return fire(flag.requestCache.params)
                .then(flag.requestCache.resolve)["catch"](flag.requestCache.reject);
        }
    }
    check();
};
/**
 * @description Description required
 * @param {Object} req - Contentstack sync API request object
 */
var fire = function (req) {
    debug("Fire called with: " + JSON.stringify(req));
    flag.SQ = true;
    return new Promise(function (resolve, reject) {
        return api_1.get(req).then(function (response) {
            delete req.qs.init;
            delete req.qs.pagination_token;
            delete req.qs.sync_token;
            delete req.path;
            var syncResponse = response;
            if (syncResponse.items.length) {
                return index_1.filterItems(syncResponse, config).then(function () {
                    if (syncResponse.items.length === 0) {
                        return postProcess(req, syncResponse)
                            .then(resolve)["catch"](reject);
                    }
                    syncResponse.items = index_1.formatItems(syncResponse.items, config);
                    var groupedItems = index_1.groupItems(syncResponse.items);
                    groupedItems = index_1.markCheckpoint(groupedItems, syncResponse);
                    // send assets data for processing
                    if (groupedItems[formattedAssetType]) {
                        groupedItems[formattedAssetType].forEach(function (asset) {
                            Q.push(asset);
                        });
                        delete groupedItems[formattedAssetType];
                    }
                    if (groupedItems[formattedContentType]) {
                        groupedItems[formattedContentType].forEach(function (contentType) {
                            Q.push(contentType);
                        });
                        delete groupedItems[formattedContentType];
                    }
                    var contentTypeUids = Object.keys(groupedItems);
                    lodash_1.remove(contentTypeUids, function (contentTypeUid) {
                        var contentType = groupedItems[contentTypeUid];
                        if (contentType.length === 1 && !contentType[0].publish_details) {
                            Q.push(contentType[0]);
                            return true;
                        }
                        return false;
                    });
                    return promise_map_1.map(contentTypeUids, function (uid) {
                        return new Promise(function (mapResolve, mapReject) {
                            return api_1.get({
                                path: "" + Contentstack.apis.content_types + uid,
                                qs: {
                                    include_snippet_schema: (typeof config.contentstack.query.include_snippet_schema == 'boolean' && config.contentstack.query.include_snippet_schema == true)
                                }
                            }).then(function (contentTypeSchemaResponse) {
                                var schemaResponse = contentTypeSchemaResponse;
                                if (schemaResponse.content_type) {
                                    var items = groupedItems[uid];
                                    items.forEach(function (entry) {
                                        entry._content_type = lodash_1.cloneDeep(schemaResponse.content_type);
                                        Q.push(entry);
                                    });
                                    return mapResolve();
                                }
                                var err = new Error('Content type ${uid} schema not found!');
                                // Illegal content type call
                                err.code = 'ICTC';
                                return mapReject(err);
                            })["catch"](function (error) {
                                if (inet_1.netConnectivityIssues(error)) {
                                    flag.SQ = false;
                                }
                                return mapReject(error);
                            });
                        });
                    }, 2).then(function () {
                        return postProcess(req, syncResponse)
                            .then(resolve)["catch"](reject);
                    })["catch"](function (error) {
                        if (inet_1.netConnectivityIssues(error)) {
                            flag.SQ = false;
                        }
                        // Errorred while fetching content type schema
                        return reject(error);
                    });
                })["catch"](function (processError) {
                    return reject(processError);
                });
            }
            return postProcess(req, syncResponse)
                .then(resolve);
        })["catch"](function (error) {
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
var postProcess = function (req, resp) {
    return new Promise(function (resolve, reject) {
        var name;
        if (resp.pagination_token) {
            name = 'pagination_token';
        }
        else {
            name = 'sync_token';
        }
        return token_management_1.saveCheckpoint(name, resp[name])
            .then(function () {
            // re-fire!
            req.qs[name] = resp[name];
            if (flag.lockdown) {
                logger_1.logger.log('Checkpoint: lockdown has been invoked');
                flag.requestCache = {
                    params: req,
                    reject: reject,
                    resolve: resolve
                };
            }
            else {
                if (name === 'sync_token') {
                    flag.SQ = false;
                    return resolve();
                }
                return fire(req)
                    .then(resolve)["catch"](reject);
            }
        })["catch"](reject);
    });
};
emitter.on('check', check);
