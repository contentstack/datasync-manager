"use strict";
/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var debug_1 = require("debug");
var events_1 = require("events");
var lodash_1 = require("lodash");
var _1 = require(".");
var index_1 = require("../util/index");
var logger_1 = require("../util/logger");
var series_1 = require("../util/series");
var unprocessible_1 = require("../util/unprocessible");
var plugins_1 = require("./plugins");
var token_management_1 = require("./token-management");
var debug = debug_1["default"]('q');
var notifications = new events_1.EventEmitter();
exports.notifications = notifications;
var instance = null;
/**
 * @summary Manages sync utilitiy's item queue
 * @description
 *  Handles/processes 'sync' items one at a time, firing 'before' and 'after' hooks
 */
var Q = /** @class */ (function (_super) {
    __extends(Q, _super);
    /**
     * 'Q's constructor
     * @param {Object} connector - Content connector instance
     * @param {Object} config - Application config
     * @returns {Object} Returns 'Q's instance
     */
    function Q(contentStore, assetStore, config) {
        var _this = this;
        if (!instance && contentStore && assetStore && config) {
            _this = _super.call(this) || this;
            _this.pluginInstances = plugins_1.load(config);
            _this.contentStore = contentStore;
            _this.syncManager = config.syncManager;
            _this.iLock = false;
            _this.inProgress = false;
            _this.q = [];
            _this.on('next', _this.next);
            _this.on('error', _this.errorHandler);
            _this.on('push', _this.push);
            _this.on('unshift', _this.unshift);
            instance = _this;
            debug('Core \'Q\' constructor initiated');
        }
        return instance;
    }
    Q.prototype.unshift = function (data) {
        this.q.unshift(data);
        if (this.q.length > this.syncManager.queue.pause_threshold) {
            this.iLock = true;
            _1.lock();
        }
        debug("Content type '" + data._content_type_uid + "' received for '" + data._type + "'");
        this.emit('next');
    };
    /**
     * @description Enter item into 'Q's queue
     * @param {Object} data - Formatted item from 'sync api's response
     */
    Q.prototype.push = function (data) {
        this.q.push(data);
        if (this.q.length > this.syncManager.queue.pause_threshold) {
            this.iLock = true;
            _1.lock();
        }
        debug("Content type '" + data._content_type_uid + "' received for '" + data._type + "'");
        this.emit('next');
    };
    /**
     * @description Handles errors in 'Q'
     * @param {Object} obj - Errorred item
     */
    Q.prototype.errorHandler = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var that, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        that = this;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        notify('error', obj);
                        logger_1.logger.error(obj);
                        debug("Error handler called with " + JSON.stringify(obj));
                        if (!(typeof obj.checkpoint !== 'undefined')) return [3 /*break*/, 3];
                        return [4 /*yield*/, token_management_1.saveToken(obj.checkpoint.name, obj.checkpoint.token)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [4 /*yield*/, unprocessible_1.saveFailedItems(obj)];
                    case 4:
                        _a.sent();
                        this.inProgress = false;
                        this.emit('next');
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        // probably, the context could change
                        logger_1.logger.error('Something went wrong in errorHandler!');
                        logger_1.logger.error(error_1);
                        that.inProgress = false;
                        that.emit('next');
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Q.prototype.peek = function () {
        return this.q;
    };
    /**
     * @description Calls next item in the queue
     */
    Q.prototype.next = function () {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                try {
                    if (this.iLock && this.q.length < this.syncManager.queue.resume_threshold) {
                        _1.unlock(true);
                        this.iLock = false;
                    }
                    debug("Calling 'next'. In progress status is " + this.inProgress + ", and Q length is " + this.q.length);
                    if (!this.inProgress && this.q.length) {
                        this.inProgress = true;
                        item = this.q.shift();
                        this.process(item);
                    }
                }
                catch (error) {
                    logger_1.logger.error(error);
                    this.inProgress = false;
                    this.emit('next');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * @description Passes and calls the appropriate methods and hooks for item execution
     * @param {Object} data - Current processing item
     */
    Q.prototype.process = function (data) {
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
    };
    /**
     * @description Execute and manager current processing item. Calling 'before' and 'after' hooks appropriately
     * @param {Object} data - Current processing item
     * @param {String} action - Action to be performed on the item (publish | unpublish | delete)
     * @param {String} beforeAction - Name of the hook to execute before the action is performed
     * @param {String} afterAction - Name of the hook to execute after the action has been performed
     * @returns {Promise} Returns promise
     */
    Q.prototype.exec = function (data, action) {
        return __awaiter(this, void 0, void 0, function () {
            var checkpoint, type, contentType, locale, uid, beforeSyncInternalPlugins_1, beforeSyncPlugins_1, afterSyncPlugins_1, transformedData_1, transformedSchema_1, schema_1, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 15, , 16]);
                        type = data._type.toUpperCase();
                        contentType = data._content_type_uid;
                        locale = data.locale;
                        uid = data.uid;
                        if (data.hasOwnProperty('_checkpoint')) {
                            checkpoint = data._checkpoint;
                            delete data._checkpoint;
                        }
                        debug("Executing: " + JSON.stringify(data));
                        beforeSyncInternalPlugins_1 = [];
                        beforeSyncPlugins_1 = [];
                        afterSyncPlugins_1 = [];
                        schema_1 = index_1.getSchema(action, data).schema;
                        data = index_1.filterUnwantedKeys(action, data);
                        if (typeof schema_1 !== 'undefined') {
                            schema_1 = index_1.filterUnwantedKeys(action, schema_1);
                        }
                        logger_1.logger.log(type + ": { content_type: '" + contentType + "', " + ((locale) ? "locale: '" + locale + "'," : '') + " uid: '" + uid + "'} is in progress");
                        this.pluginInstances.internal.beforeSync.forEach(function (method) {
                            beforeSyncInternalPlugins_1.push(function () { return method(action, data, schema_1); });
                        });
                        return [4 /*yield*/, series_1.series(beforeSyncInternalPlugins_1)];
                    case 1:
                        _a.sent();
                        if (this.syncManager.pluginTransformations) {
                            transformedData_1 = data;
                            transformedSchema_1 = schema_1;
                        }
                        else {
                            transformedData_1 = lodash_1.cloneDeep(data);
                            transformedSchema_1 = lodash_1.cloneDeep(schema_1);
                        }
                        if (!this.syncManager.serializePlugins) return [3 /*break*/, 3];
                        this.pluginInstances.external.beforeSync.forEach(function (method) {
                            beforeSyncPlugins_1.push(function () { return method(action, transformedData_1, transformedSchema_1); });
                        });
                        return [4 /*yield*/, series_1.series(beforeSyncPlugins_1)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        this.pluginInstances.external.beforeSync.forEach(function (method) {
                            beforeSyncPlugins_1.push(method(action, transformedData_1, transformedSchema_1));
                        });
                        return [4 /*yield*/, Promise.all(beforeSyncPlugins_1)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        debug('Before action plugins executed successfully!');
                        return [4 /*yield*/, this.contentStore[action](data)];
                    case 6:
                        _a.sent();
                        debug("Completed '" + action + "' on connector successfully!");
                        if (!(typeof schema_1 !== 'undefined')) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.contentStore.updateContentType(schema_1)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        debug('Connector instance called successfully!');
                        if (!this.syncManager.serializePlugins) return [3 /*break*/, 10];
                        this.pluginInstances.external.afterSync.forEach(function (method) {
                            afterSyncPlugins_1.push(function () { return method(action, transformedData_1, transformedSchema_1); });
                        });
                        return [4 /*yield*/, series_1.series(afterSyncPlugins_1)];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 10:
                        this.pluginInstances.external.afterSync.forEach(function (method) {
                            afterSyncPlugins_1.push(method(action, transformedData_1, transformedSchema_1));
                        });
                        return [4 /*yield*/, Promise.all(afterSyncPlugins_1)];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12:
                        if (!(typeof checkpoint !== 'undefined')) return [3 /*break*/, 14];
                        return [4 /*yield*/, token_management_1.saveToken(checkpoint.name, checkpoint.token)];
                    case 13:
                        _a.sent();
                        _a.label = 14;
                    case 14:
                        debug('After action plugins executed successfully!');
                        logger_1.logger.log(type + ": { content_type: '" + contentType + "', " + ((locale) ? "locale: '" + locale + "'," : '') + " uid: '" + uid + "'} was completed successfully!");
                        this.inProgress = false;
                        this.emit('next', data);
                        return [3 /*break*/, 16];
                    case 15:
                        error_2 = _a.sent();
                        this.emit('error', {
                            data: data,
                            error: error_2,
                            // tslint:disable-next-line: object-literal-sort-keys
                            checkpoint: checkpoint
                        });
                        return [3 /*break*/, 16];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    return Q;
}(events_1.EventEmitter));
exports.Q = Q;
var notify = function (event, obj) {
    notifications.emit(event, obj);
};
