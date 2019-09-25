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
var debug_1 = require("debug");
var index_1 = require("../index");
var fs_1 = require("../util/fs");
var index_2 = require("../util/index");
var debug = debug_1["default"]('token-management');
var counter = 0;
/**
 * @description Returns 'token details' based on 'token type'
 * @param {String} type - Token type (checkpoint | current)
 */
exports.getToken = function () {
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var config, checkpoint, token, data, contents, contents, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    config = index_1.getConfig();
                    checkpoint = config.paths.checkpoint;
                    token = config.paths.token;
                    data = {};
                    if (!fs_1.existsSync(checkpoint)) return [3 /*break*/, 2];
                    debug("Checkpoint read: " + checkpoint);
                    return [4 /*yield*/, fs_1.readFile(checkpoint)];
                case 1:
                    contents = _a.sent();
                    data = JSON.parse(contents);
                    return [3 /*break*/, 4];
                case 2:
                    if (!fs_1.existsSync(token)) return [3 /*break*/, 4];
                    debug("Token read: " + token);
                    return [4 /*yield*/, fs_1.readFile(token)];
                case 3:
                    contents = _a.sent();
                    data = JSON.parse(contents);
                    _a.label = 4;
                case 4: return [2 /*return*/, resolve(data)];
                case 5:
                    error_1 = _a.sent();
                    return [2 /*return*/, reject(error_1)];
                case 6: return [2 /*return*/];
            }
        });
    }); });
};
/**
 * @description Saves token details
 * @param {String} name - Name of the token
 * @param {String} token - Token value
 * @param {String} type - Token type
 */
exports.saveToken = function (name, token) {
    debug("Save token invoked with name: " + name + ", token: " + token);
    return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
        var config_1, path, data, obj, filename, file, ledger, ledgerDetails, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 9]);
                    config_1 = index_1.getConfig();
                    path = config_1.paths.token;
                    data = {
                        name: name,
                        timestamp: new Date().toISOString(),
                        token: token
                    };
                    // write token information @path
                    return [4 /*yield*/, fs_1.writeFile(path, JSON.stringify(data))];
                case 1:
                    // write token information @path
                    _a.sent();
                    obj = {
                        name: name,
                        timestamp: new Date().toISOString(),
                        token: token
                    };
                    filename = void 0;
                    if (counter === 0) {
                        filename = config_1.paths.ledger;
                    }
                    else {
                        filename = config_1.paths.ledger + "." + counter;
                    }
                    return [4 /*yield*/, index_2.getFile(filename, function () {
                            counter++;
                            return config_1.paths.ledger + "-" + counter;
                        })];
                case 2:
                    file = _a.sent();
                    debug("ledger file: " + file + " exists?(" + fs_1.existsSync(file) + ")");
                    if (!!fs_1.existsSync(file)) return [3 /*break*/, 4];
                    return [4 /*yield*/, fs_1.writeFile(file, JSON.stringify([obj]))];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 4: return [4 /*yield*/, fs_1.readFile(file)];
                case 5:
                    ledger = _a.sent();
                    ledgerDetails = JSON.parse(ledger);
                    ledgerDetails.splice(0, 0, obj);
                    return [4 /*yield*/, fs_1.writeFile(file, JSON.stringify(ledgerDetails))];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7: return [2 /*return*/, resolve()];
                case 8:
                    error_2 = _a.sent();
                    return [2 /*return*/, reject(error_2)];
                case 9: return [2 /*return*/];
            }
        });
    }); });
};
/**
 * @description Saves token details
 * @param {String} name - Name of the token
 * @param {String} token - Token value
 * @param {String} type - Token type
 */
exports.saveCheckpoint = function (name, token) { return __awaiter(_this, void 0, void 0, function () {
    var config, path, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                debug("Save token invoked with name: " + name + ", token: " + token);
                config = index_1.getConfig();
                path = config.paths.checkpoint;
                data = {
                    name: name,
                    timestamp: new Date().toISOString(),
                    token: token
                };
                return [4 /*yield*/, fs_1.writeFile(path, JSON.stringify(data))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
