"use strict";
/*!
* Contentstack DataSync Manager
* This module saves filtered/failed items
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
var _this = this;
exports.__esModule = true;
var index_1 = require("../index");
var fs_1 = require("./fs");
var index_2 = require("./index");
var logger_1 = require("./logger");
var counter = {
    failed: 0,
    filtered: 0
};
/**
 * TODO
 * This method logs all failed items.
 * Failed items should be 'retried' when app is started Or after a specific interval
 * @param {Object} obj - Contains 'error' and 'data' key
 * @returns {Promise} Returns a promisified object
 */
exports.saveFailedItems = function (obj) {
    return new Promise(function (resolve) {
        // const path = getConfig().paths.failedItems
        return resolve(obj);
    });
};
/**
 * @description Saves items filtered from SYNC API response
 * @param {Object} items - Filtered items
 * @param {String} name - Page name where items were filtered
 * @param {String} token - Page token value
 * @returns {Promise} Returns a promise
 */
exports.saveFilteredItems = function (items, name, token) {
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var config_1, filename, objDetails_1, file_1, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    config_1 = index_1.getConfig();
                    filename = void 0;
                    if (!config_1.syncManager.saveFilteredItems) {
                        return [2 /*return*/, resolve()];
                    }
                    objDetails_1 = {
                        items: items,
                        name: name,
                        timestamp: new Date().toISOString(),
                        token: token
                    };
                    if (counter.filtered === 0) {
                        filename = config_1.paths.filtered + ".json";
                    }
                    else {
                        filename = config_1.paths.filtered + "-" + counter.filtered + ".json";
                    }
                    return [4 /*yield*/, index_2.getFile(filename, function () {
                            counter.filtered++;
                            return config_1.paths.filtered + "-" + counter.filtered + ".json";
                        })];
                case 1:
                    file_1 = _a.sent();
                    if (fs_1.existsSync(file_1)) {
                        return [2 /*return*/, fs_1.readFile(file_1).then(function (data) {
                                var loggedItems = JSON.parse(data);
                                loggedItems.push(objDetails_1);
                                return fs_1.writeFile(file_1, JSON.stringify(loggedItems)).then(resolve)["catch"](function (error) {
                                    // failed to log failed items
                                    logger_1.logger.error("Failed to write " + JSON.stringify(loggedItems) + " at " + error);
                                    logger_1.logger.error(error);
                                    return resolve();
                                });
                            })["catch"](function (error) {
                                logger_1.logger.error("Failed to read file from path " + fail);
                                logger_1.logger.error(error);
                                return resolve();
                            })];
                    }
                    return [2 /*return*/, fs_1.writeFile(file_1, JSON.stringify([objDetails_1])).then(resolve)["catch"](function (error) {
                            logger_1.logger.error("Failed while writing " + JSON.stringify(objDetails_1) + " at " + file_1);
                            logger_1.logger.error(error);
                            return resolve();
                        })];
                case 2:
                    error_1 = _a.sent();
                    return [2 /*return*/, reject(error_1)];
                case 3: return [2 /*return*/];
            }
        });
    }); });
};
