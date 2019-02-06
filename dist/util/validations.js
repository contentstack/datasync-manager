"use strict";
/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = require("lodash");
exports.validateConfig = (config) => {
    const keys = ['listener', 'asset-connector', 'content-connector', 'sync-manager', 'contentstack',
        'locales',
    ];
    keys.forEach((key) => {
        if (config[key] === undefined) {
            throw new Error(`Config '${key}' key cannot be undefined`);
        }
    });
    if (typeof config.contentstack !== 'object' || !config.contentstack.apiKey || !config.contentstack.token) {
        throw new Error('Config \'contentstack\' should be of type object and have \'apiKey\' and \'token\'');
    }
};
exports.validateInstances = (assetConnector, contentConnector, listener) => {
    if (typeof assetConnector === 'undefined') {
        throw new Error('Call \'setAssetConnector()\' before calling sync-manager start!');
    }
    else if (typeof contentConnector === 'undefined') {
        throw new Error('Call \'setContentConnector()\' before calling sync-manager start!');
    }
    else if (typeof listener === 'undefined') {
        throw new Error('Call \'setListener()\' before calling sync-manager start!');
    }
    else if (!assetConnector.start || !contentConnector.start || !listener.start) {
        throw new Error('Connector and listener instances should have \'start()\' method');
    }
    else if (typeof assetConnector.start !== 'function' || typeof contentConnector.start !== 'function' ||
        typeof listener.start !== 'function') {
        throw new Error('Connector and listener instances should have \'start()\' method');
    }
    else if (!assetConnector.setLogger || !contentConnector.setLogger || !listener.setLogger) {
        throw new Error('Connector and listener instances should have \'setLogger\' method');
    }
    else if (typeof assetConnector.setLogger !== 'function' ||
        typeof contentConnector.setLogger !== 'function' || typeof listener.setLogger !== 'function') {
        throw new Error('Connector and listener instances should have \'start()\' method');
    }
};
exports.validateContentConnector = (instance) => {
    const fns = ['publish', 'unpublish', 'delete'];
    fns.forEach((fn) => {
        if (!(lodash_1.hasIn(instance, fn))) {
            throw new Error(`${instance} content connector does not support '${fn}()'`);
        }
    });
};
exports.validateAssetConnector = (instance) => {
    const fns = ['delete', 'download', 'unpublish'];
    fns.forEach((fn) => {
        if (!(lodash_1.hasIn(instance, fn))) {
            throw new Error(`${instance} asset connector does not support '${fn}()'`);
        }
    });
};
exports.validateListener = (instance) => {
    const fns = ['register'];
    fns.forEach((fn) => {
        if (!(lodash_1.hasIn(instance, fn))) {
            throw new Error(`${instance} listener does not support '${fn}()'`);
        }
    });
};
exports.validateLogger = (instance) => {
    let flag = false;
    if (!instance) {
        return flag;
    }
    const requiredFn = ['info', 'warn', 'log', 'error', 'debug'];
    requiredFn.forEach((name) => {
        if (typeof instance[name] !== 'function') {
            console.warn(`Unable to register custom logger since '${name}()' does not exist on ${instance}!`);
            flag = true;
        }
    });
    return !flag;
};
exports.validateItemStructure = (item) => {
    try {
        if (!(item.type) || typeof item.type !== 'string' || !(item.type.length)) {
            item._error = '\'type\' key is missing!';
            return false;
        }
        switch (item.type) {
            case 'asset_published':
                return assetPublishedStructure(item);
            case 'asset_unpublished':
                return assetUnpublishedStructure(item);
            case 'asset_deleted':
                return assetDeletedStructure(item);
            case 'entry_published':
                return entryPublishedStructure(item);
            case 'entry_unpublished':
                return entryUnpublishedStructure(item);
            case 'entry_deleted':
                return entryDeletedStructure(item);
            case 'content_type_deleted':
                return contentTypeDeletedStructure(item);
            default:
                return false;
        }
    }
    catch (error) {
        return false;
    }
};
const assetPublishedStructure = (asset) => {
    const requiredKeys = ['content_type_uid', 'data', 'data.uid', 'data.url', 'data.publish_details',
        'data.publish_details.locale', 'data.title',
    ];
    requiredKeys.forEach((key) => {
        if (!(lodash_1.hasIn(asset, key))) {
            asset._error = asset._error || '';
            asset._error += `${key} is missing!\t`;
        }
    });
    if (asset._error) {
        return false;
    }
    return true;
};
const entryPublishedStructure = (entry) => {
    const requiredKeys = ['content_type_uid', 'data', 'data.uid', 'data.publish_details',
        'data.publish_details.locale',
    ];
    requiredKeys.forEach((key) => {
        if (!(lodash_1.hasIn(entry, key))) {
            entry._error = entry._error || '';
            entry._error += `${key} is missing!`;
        }
    });
    if (entry._error) {
        return false;
    }
    return true;
};
const assetDeletedStructure = (asset) => {
    const requiredKeys = ['content_type_uid', 'data', 'data.uid', 'data.locale'];
    requiredKeys.forEach((key) => {
        if (!(lodash_1.hasIn(asset, key))) {
            asset._error = asset._error || '';
            asset._error += `${key} is missing!`;
        }
    });
    if (asset._error) {
        return false;
    }
    return true;
};
const entryDeletedStructure = (entry) => {
    const requiredKeys = ['content_type_uid', 'data', 'data.uid', 'data.locale'];
    requiredKeys.forEach((key) => {
        if (!(lodash_1.hasIn(entry, key))) {
            entry._error = entry._error || '';
            entry._error += `${key} is missing!`;
        }
    });
    if (entry._error) {
        return false;
    }
    return true;
};
const assetUnpublishedStructure = (asset) => {
    const requiredKeys = ['content_type_uid', 'data', 'data.uid', 'data.locale'];
    requiredKeys.forEach((key) => {
        if (!(lodash_1.hasIn(asset, key))) {
            asset._error = asset._error || '';
            asset._error += `${key} is missing!`;
        }
    });
    if (asset._error) {
        return false;
    }
    return true;
};
const entryUnpublishedStructure = (entry) => {
    const requiredKeys = ['content_type_uid', 'data', 'data.uid', 'data.locale'];
    requiredKeys.forEach((key) => {
        if (!(lodash_1.hasIn(entry, key))) {
            entry._error = entry._error || '';
            entry._error += `${key} is missing!`;
        }
    });
    if (entry._error) {
        return false;
    }
    return true;
};
const contentTypeDeletedStructure = (contentType) => {
    const requiredKeys = ['content_type_uid'];
    requiredKeys.forEach((key) => {
        if (!(lodash_1.hasIn(contentType, key))) {
            contentType._error = contentType._error || '';
            contentType._error += `${key} is missing!`;
        }
    });
    if (contentType._error) {
        return false;
    }
    return true;
};
