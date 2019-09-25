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
var lodash_1 = require("lodash");
var marked_1 = require("marked");
var path_1 = require("path");
var index_1 = require("../index");
var fs_1 = require("./fs");
var logger_1 = require("./logger");
var unprocessible_1 = require("./unprocessible");
var validations_1 = require("./validations");
var debug = debug_1["default"]('util:index');
var formattedAssetType = '_assets';
var formattedContentType = '_content_types';
var assetType = 'sys_assets';
/**
 * @description Utility that filters items based on 'locale'.
 * @param {Object} response - SYNC API's response
 * @param {Object} config - Application config
 * @returns {Promise} Returns a promise
 */
exports.filterItems = function (response, config) { return __awaiter(_this, void 0, void 0, function () {
    var locales, filteredObjects, name;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                locales = lodash_1.map(config.locales, 'code');
                filteredObjects = lodash_1.remove(response.items, function (item) {
                    // validate item structure. If the structure is not as expected, filter it out
                    if (!(validations_1.validateItemStructure(item))) {
                        return item;
                    }
                    // for published items
                    if (item.data.publish_details) {
                        return locales.indexOf(item.data.publish_details.locale) !== -1;
                        // for unpublished items || deleted items
                    }
                    else if (item.data.locale) {
                        return locales.indexOf(item.data.locale) !== -1;
                    }
                    return false;
                });
                if (filteredObjects.length === 0) {
                    return [2 /*return*/];
                }
                if (response.pagination_token) {
                    name = 'pagination_token';
                }
                else {
                    name = 'sync_token';
                }
                return [4 /*yield*/, unprocessible_1.saveFilteredItems(filteredObjects, name, response[name])];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.formatSyncFilters = function (config) {
    if (config.syncManager.filters && typeof config.syncManager.filters === 'object') {
        var filters = config.syncManager.filters;
        var _loop_1 = function (filter) {
            if (filters[filter] && filters[filter] instanceof Array && filters[filter].length) {
                var filtersData_1 = filters[filter];
                filtersData_1.forEach(function (element, index) {
                    if (typeof element !== 'string' || element.length === 0) {
                        filtersData_1.splice(index, 1);
                    }
                });
                // if length = 0, remove it from filters
                if (filtersData_1.length === 0) {
                    delete config.syncManager.filters[filter];
                }
            }
        };
        for (var filter in filters) {
            _loop_1(filter);
        }
    }
    return config;
};
/**
 * @description Groups items based on their content type
 * @param {Array} items - An array of SYNC API's item
 * @returns {Object} Returns an 'object' who's keys are content type uids
 */
exports.groupItems = function (items) {
    var bucket = {};
    items.forEach(function (item) {
        if (item._content_type_uid === assetType) {
            item._content_type_uid = formattedAssetType;
        }
        if (bucket.hasOwnProperty(item._content_type_uid)) {
            bucket[item._content_type_uid].push(item);
        }
        else {
            bucket[item._content_type_uid] = [item];
        }
    });
    return bucket;
};
/**
 * @description Formats SYNC API's items into defined standard
 * @param {Array} items - SYNC API's items
 * @param {Object} config - Application config
 */
exports.formatItems = function (items, config) {
    var time = new Date().toISOString();
    for (var i = 0, j = items.length; i < j; i++) {
        switch (items[i].type) {
            case 'asset_published':
                delete items[i].type;
                items[i]._content_type_uid = formattedAssetType;
                items[i]._type = config.contentstack.actions.publish;
                // extra keys
                items[i]._synced_at = time;
                items[i] = lodash_1.merge(items[i], items[i].data);
                items[i].locale = items[i].data.publish_details.locale;
                break;
            case 'asset_unpublished':
                delete items[i].type;
                items[i]._content_type_uid = formattedAssetType;
                items[i]._type = config.contentstack.actions.unpublish;
                items[i] = lodash_1.merge(items[i], items[i].data);
                break;
            case 'asset_deleted':
                delete items[i].type;
                items[i]._content_type_uid = formattedAssetType;
                items[i]._type = config.contentstack.actions["delete"];
                items[i] = lodash_1.merge(items[i], items[i].data);
                break;
            case 'entry_published':
                delete items[i].type;
                items[i]._type = config.contentstack.actions.publish;
                items[i]._content_type_uid = items[i].content_type_uid;
                // extra keys
                items[i]._synced_at = time;
                items[i] = lodash_1.merge(items[i], items[i].data);
                items[i].locale = items[i].data.publish_details.locale;
                break;
            case 'entry_unpublished':
                delete items[i].type;
                items[i]._content_type_uid = items[i].content_type_uid;
                items[i]._type = config.contentstack.actions.unpublish;
                items[i] = lodash_1.merge(items[i], items[i].data);
                break;
            case 'entry_deleted':
                delete items[i].type;
                items[i]._content_type_uid = items[i].content_type_uid;
                items[i]._type = config.contentstack.actions["delete"];
                items[i] = lodash_1.merge(items[i], items[i].data);
                break;
            case 'content_type_deleted':
                delete items[i].type;
                items[i]._type = config.contentstack.actions["delete"];
                items[i].uid = items[i].content_type_uid;
                items[i]._content_type_uid = formattedContentType;
                break;
            default:
                logger_1.logger.error('Item\'s type did not match any expected case!!');
                logger_1.logger.error(JSON.stringify(items[i]));
                // remove the element from items[i]s
                items[i].splice(i, 1);
                i--;
                break;
        }
    }
    return items;
};
/**
 * @description Add's checkpoint data on the last item found on the 'SYNC API items' collection
 * @param {Object} groupedItems - Grouped items { groupItems(items) - see above } referred by their content type
 * @param {Object} syncResponse - SYNC API's response
 */
exports.markCheckpoint = function (groupedItems, syncResponse) {
    var tokenName = (syncResponse.pagination_token) ? 'pagination_token' : 'sync_token';
    var tokenValue = syncResponse[tokenName];
    var contentTypeUids = Object.keys(groupedItems);
    if (contentTypeUids.length === 1 && contentTypeUids[0] === '_assets') {
        debug("Only assets found in SYNC API response. Last content type is " + contentTypeUids[0]);
        var items = groupedItems[contentTypeUids[0]];
        // find the last item, add checkpoint to it
        items[items.length - 1]._checkpoint = {
            name: tokenName,
            token: tokenValue
        };
    }
    else if (contentTypeUids.length === 1 && contentTypeUids[0] === '_content_types') {
        debug("Only content type events found in SYNC API response. Last content type is " + contentTypeUids[0]);
        var items = groupedItems[contentTypeUids[0]];
        // find the last item, add checkpoint to it
        items[items.length - 1]._checkpoint = {
            name: tokenName,
            token: tokenValue
        };
    }
    else if (contentTypeUids.length === 2 && (contentTypeUids.indexOf('_assets') !== -1 && contentTypeUids.indexOf('_content_types'))) {
        debug("Assets & content types found found in SYNC API response. Last content type is " + contentTypeUids[1]);
        var items = groupedItems[contentTypeUids[1]];
        // find the last item, add checkpoint to it
        items[items.length - 1]._checkpoint = {
            name: tokenName,
            token: tokenValue
        };
    }
    else {
        var lastContentTypeUid = contentTypeUids[contentTypeUids.length - 1];
        debug("Mixed content types found in SYNC API response. Last content type is " + lastContentTypeUid);
        var entries = groupedItems[lastContentTypeUid];
        entries[entries.length - 1]._checkpoint = {
            name: tokenName,
            token: tokenValue
        };
    }
    return groupedItems;
};
/**
 * @description Calcuates filename for ledger and unprocessible files
 * @param {String} file - File to be calculated on
 * @param {Function} rotate - File rotation logic (should return a string)
 * @returns {String} Returns path to a file
 */
exports.getFile = function (file, rotate) {
    // tslint:disable-next-line: no-shadowed-variable
    return new Promise(function (resolve, reject) {
        var config = index_1.getConfig();
        if (fs_1.existsSync(file)) {
            return fs_1.stat(file, function (statError, stats) {
                if (statError) {
                    return reject(statError);
                }
                else if (stats.isFile()) {
                    if (stats.size > config.syncManager.maxsize) {
                        file = rotate();
                    }
                    return resolve(file);
                }
                else {
                    return reject(new Error(file + " is not of type file"));
                }
            });
        }
        else {
            fs_1.mkdirpSync(config.paths.unprocessibleDir);
            return resolve(file);
        }
    });
};
var findAssets = function (parentEntry, key, schema, entry, bucket, isFindNotReplace) {
    try {
        var contentstack_1 = index_1.getConfig().contentstack;
        var isMarkdown = (schema.field_metadata.markdown) ? true : false;
        var matches = void 0;
        var convertedText = void 0;
        if (isMarkdown) {
            convertedText = marked_1["default"](entry);
        }
        else {
            convertedText = entry;
        }
        // tslint:disable-next-line: max-line-length
        var regexp = new RegExp(contentstack_1.regexp.rte_asset_pattern_1.url, contentstack_1.regexp.rte_asset_pattern_1.options);
        var _loop_2 = function () {
            if (matches && matches.length) {
                var assetObject_1 = {};
                assetObject_1.url = matches[0];
                assetObject_1.uid = matches[3];
                assetObject_1.download_id = matches[4];
                if (isFindNotReplace) {
                    // no point in adding an object, that has no 'url'
                    // even if the 'asset' is found, we do not know its version
                    bucket.push(assetObject_1);
                }
                else {
                    var asset = lodash_1.find(bucket, function (item) {
                        // tslint:disable-next-line: max-line-length
                        var newRegexp = new RegExp(contentstack_1.regexp.rte_asset_pattern_2.url, contentstack_1.regexp.rte_asset_pattern_2.options);
                        var urlparts;
                        // tslint:disable-next-line: no-conditional-assignment
                        while ((urlparts = newRegexp.exec(item.url)) !== null) {
                            return assetObject_1.download_id === urlparts[4];
                        }
                        return undefined;
                    });
                    if (typeof asset !== 'undefined') {
                        if (isMarkdown) {
                            parentEntry[key] = parentEntry[key].replace(assetObject_1.url, encodeURI(asset._internal_url) + "\\n");
                        }
                        else {
                            parentEntry[key] = parentEntry[key].replace(assetObject_1.url, encodeURI(asset._internal_url));
                        }
                    }
                }
            }
        };
        // tslint:disable-next-line: no-conditional-assignment
        while ((matches = regexp.exec(convertedText)) !== null) {
            _loop_2();
        }
    }
    catch (error) {
        logger_1.logger.error(error);
    }
};
var iterate = function (schema, entry, bucket, findNoteReplace, parentKeys) {
    try {
        var _loop_3 = function (index) {
            var parentKey = parentKeys[index];
            var subEntry = entry[parentKey];
            if (subEntry && !(lodash_1.isEmpty(subEntry)) && index === (parentKeys.length - 1)) {
                if (subEntry && subEntry instanceof Array && subEntry.length) {
                    subEntry.forEach(function (subEntryItem, idx) {
                        // tricky!
                        if (!(lodash_1.isEmpty(subEntryItem))) {
                            findAssets(subEntry, idx, schema, subEntryItem, bucket, findNoteReplace);
                        }
                        // iterate(schema, subEntryItem, bucket, findNoteReplace, parentKeys)
                    });
                    return { value: void 0 };
                }
                else if (entry !== undefined) {
                    findAssets(entry, parentKey, schema, subEntry, bucket, findNoteReplace);
                    return { value: void 0 };
                }
            }
            else if (subEntry !== undefined) {
                var subKeys_1 = lodash_1.cloneDeep(parentKeys).splice(index);
                if (subEntry && subEntry instanceof Array && subEntry.length) {
                    subEntry.forEach(function (subEntryItem) {
                        iterate(schema, subEntryItem, bucket, findNoteReplace, lodash_1.cloneDeep(subKeys_1));
                    });
                    return { value: void 0 };
                }
                else {
                    iterate(schema, subEntry, bucket, findNoteReplace, subKeys_1);
                    return { value: void 0 };
                }
            }
        };
        for (var index = 0; index < parentKeys.length; index++) {
            var state_1 = _loop_3(index);
            if (typeof state_1 === "object")
                return state_1.value;
        }
    }
    catch (error) {
        logger_1.logger.error(error);
    }
};
exports.getOrSetRTEMarkdownAssets = function (schema, entry, bucket, isFindNotReplace, parent) {
    if (bucket === void 0) { bucket = []; }
    if (parent === void 0) { parent = []; }
    for (var i = 0, j = schema.length; i < j; i++) {
        if (schema[i].data_type === 'text' && schema[i].field_metadata && (schema[i].field_metadata.allow_rich_text ||
            schema[i].field_metadata.markdown)) {
            parent.push(schema[i].uid);
            iterate(schema[i], entry, bucket, isFindNotReplace, parent);
            parent.pop();
        }
        else if ((schema[i].data_type === 'group' || schema[i].data_type === 'snippet') && schema[i].schema) {
            parent.push(schema[i].uid);
            exports.getOrSetRTEMarkdownAssets(schema[i].schema, entry, bucket, isFindNotReplace, parent);
            parent.pop();
        }
        else if (schema[i].data_type === 'blocks') {
            for (var k = 0, l = schema[i].blocks.length; k < l; k++) {
                parent.push(schema[i].uid);
                parent.push(schema[i].blocks[k].uid);
                exports.getOrSetRTEMarkdownAssets(schema[i].blocks[k].schema, entry, bucket, isFindNotReplace, parent);
                parent.pop();
                parent.pop();
            }
        }
    }
    if (isFindNotReplace) {
        return bucket;
    }
    return entry;
};
exports.normalizePluginPath = function (config, plugin, isInternal) {
    var pluginPath;
    if (plugin.path && typeof plugin.path === 'string' && plugin.path.length > 0) {
        if (path_1.isAbsolute(plugin.path)) {
            if (!fs_1.existsSync(plugin.path)) {
                throw new Error(plugin.path + " does not exist!");
            }
            return plugin.path;
        }
        pluginPath = path_1.resolve(path_1.join(config.paths.baseDir, plugin.name, 'index.js'));
        if (!fs_1.existsSync(pluginPath)) {
            throw new Error(pluginPath + " does not exist!");
        }
        return pluginPath;
    }
    if (isInternal) {
        pluginPath = path_1.join(__dirname, '..', 'plugins', plugin.name.slice(13), 'index.js');
        if (fs_1.existsSync(pluginPath)) {
            return pluginPath;
        }
    }
    pluginPath = path_1.resolve(path_1.join(config.paths.plugin, plugin.name, 'index.js'));
    if (!fs_1.existsSync(pluginPath)) {
        throw new Error("Unable to find plugin: " + JSON.stringify(plugin));
    }
    return pluginPath;
};
exports.filterUnwantedKeys = function (action, data) {
    if (action === 'publish') {
        var contentStore = index_1.getConfig().contentStore;
        switch (data._content_type_uid) {
            case '_assets':
                data = filterKeys(data, contentStore.unwanted.asset);
                break;
            case '_content_types':
                data = filterKeys(data, contentStore.unwanted.contentType);
                break;
            default:
                data = filterKeys(data, contentStore.unwanted.entry);
        }
    }
    return data;
};
// TODO
// Add option to delete embedded documents
var filterKeys = function (data, unwantedKeys) {
    for (var key in unwantedKeys) {
        if (unwantedKeys[key] && data.hasOwnProperty(key)) {
            delete data[key];
        }
    }
    return data;
};
exports.getSchema = function (action, data) {
    var schema;
    if (action === 'publish' && data._content_type_uid !== '_assets') {
        schema = data._content_type;
        schema._content_type_uid = '_content_types';
        schema.event_at = data.event_at;
        schema._synced_at = data._synced_at;
        schema.locale = data.locale;
    }
    return { schema: schema };
};
