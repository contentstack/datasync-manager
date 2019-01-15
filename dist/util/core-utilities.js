"use strict";
/*!
* Contentstack Sync Manager
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
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
const __1 = require("..");
const fs_1 = require("./fs");
const unprocessible_1 = require("./unprocessible");
const formattedAssetType = '_assets';
const formattedContentType = '_content_types';
const assetType = 'sys_assets';
exports.filterItems = (response, config) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        try {
            const locales = lodash_1.map(config.locales, 'code');
            const filteredObjects = lodash_1.remove(response.items, (item) => {
                if (item.data.publish_details) {
                    return locales.indexOf(item.data.publish_details.locale) !== -1;
                }
                else if (item.data.locale) {
                    return locales.indexOf(item.data.locale) !== -1;
                }
                return false;
            });
            if (filteredObjects.length === 0) {
                return resolve();
            }
            let name;
            if (response.pagination_token) {
                name = 'pagination_token';
            }
            else {
                name = 'sync_token';
            }
            return unprocessible_1.saveFilteredItems(filteredObjects, name, response[name])
                .then(resolve)
                .catch(reject);
        }
        catch (error) {
            return reject(error);
        }
    });
});
exports.groupItems = (items) => {
    const bucket = {};
    items.forEach((item) => {
        if (item.content_type_uid === assetType) {
            item.content_type_uid = formattedAssetType;
        }
        if (bucket.hasOwnProperty(item.content_type_uid)) {
            bucket[item.content_type_uid].push(item);
        }
        else {
            bucket[item.content_type_uid] = [item];
        }
    });
    return bucket;
};
exports.formatItems = (items, config) => {
    items.forEach((item) => {
        switch (item.type) {
            case 'asset_published':
                item.content_type_uid = formattedAssetType;
                item.action = config.contentstack.actions.publish;
                item.locale = item.data.publish_details.locale;
                item.uid = item.data.uid;
                break;
            case 'asset_unpublished':
                item.content_type_uid = formattedAssetType;
                item.action = config.contentstack.actions.unpublish;
                item.locale = item.data.locale;
                item.uid = item.data.uid;
                break;
            case 'asset_deleted':
                item.content_type_uid = formattedAssetType;
                item.action = config.contentstack.actions.delete;
                item.locale = item.data.locale;
                item.uid = item.data.uid;
                break;
            case 'entry_published':
                item.action = config.contentstack.actions.publish;
                item.locale = item.data.publish_details.locale;
                item.uid = item.data.uid;
                break;
            case 'entry_unpublished':
                item.action = config.contentstack.actions.unpublish;
                item.locale = item.data.locale;
                item.uid = item.data.uid;
                break;
            case 'entry_deleted':
                item.action = config.contentstack.actions.delete;
                item.locale = item.data.locale;
                item.uid = item.data.uid;
                break;
            case 'content_type_deleted':
                item.action = config.contentstack.actions.delete;
                item.uid = item.content_type_uid;
                item.content_type_uid = formattedContentType;
                break;
            default:
                break;
        }
    });
    return items;
};
exports.markCheckpoint = (groupedItems, syncResponse) => {
    const tokenName = (syncResponse.pagination_token) ? 'pagination_token' : 'sync_token';
    const tokenValue = syncResponse[tokenName];
    const contentTypeUids = Object.keys(groupedItems);
    if (contentTypeUids.length === 1 && contentTypeUids[0] === '_assets') {
        const items = groupedItems[contentTypeUids[0]];
        items[items.length - 1].checkpoint = {
            name: tokenName,
            token: tokenValue,
        };
    }
    else if (contentTypeUids.length === 1 && contentTypeUids[0] === '_content_types') {
        const items = groupedItems[contentTypeUids[0]];
        items[items.length - 1].checkpoint = {
            name: tokenName,
            token: tokenValue,
        };
    }
    else if (contentTypeUids.length === 2 && (contentTypeUids.indexOf('_assets') !== -1 && contentTypeUids.indexOf('_content_types'))) {
        const items = groupedItems[contentTypeUids[1]];
        items[items.length - 1].checkpoint = {
            name: tokenName,
            token: tokenValue,
        };
    }
    else {
        const lastContentTypeUid = contentTypeUids[contentTypeUids.length - 1];
        const entries = groupedItems[lastContentTypeUid];
        entries[entries.length - 1].checkpoint = {
            name: tokenName,
            token: tokenValue,
        };
    }
    return groupedItems;
};
exports.getFile = (file, rotate) => {
    return new Promise((resolve, reject) => {
        const config = __1.getConfig();
        if (fs_1.existsSync(file)) {
            return fs_1.stat(file, (statError, stats) => {
                if (statError) {
                    return reject(statError);
                }
                else if (stats.isFile()) {
                    if (stats.size > config['sync-manager'].maxsize) {
                        file = rotate();
                    }
                    return resolve(file);
                }
                else {
                    return reject(new Error(`${file} is not of type file`));
                }
            });
        }
        else {
            fs_1.mkdirpSync(config.paths.unprocessibleDir);
            return resolve(file);
        }
    });
};
exports.buildAssetReference = (entry) => {
    if (typeof entry === 'object' && !(Array.isArray(entry))) {
        if (entry.filename && entry.url && entry.size && entry.uid) {
            const _keys = Object.keys(entry);
            _keys.forEach((k) => {
                if (k !== 'uid') {
                    delete entry[k];
                }
                entry._content_type_uid = '_assets';
            });
        }
        const keys = Object.keys(entry);
        keys.forEach((key) => {
            const obj = entry[key];
            if (typeof obj === 'object') {
                exports.buildAssetReference(obj);
            }
        });
    }
    else if (typeof entry === 'object' && Array.isArray(entry)) {
        entry.forEach((_obj) => {
            if (typeof _obj === 'object') {
                exports.buildAssetReference(_obj);
            }
        });
    }
    return entry;
};
//# sourceMappingURL=core-utilities.js.map