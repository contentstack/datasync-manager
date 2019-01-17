"use strict";
/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = {
    'asset-connector': {},
    'content-connector': {},
    'contentstack': {
        MAX_RETRY_LIMIT: 6,
        actions: {
            delete: 'delete',
            publish: 'publish',
            unpublish: 'unpublish',
        },
        apis: {
            content_types: '/v3/content_types/',
            sync: '/v3/stacks/sync',
        },
        host: 'cdn.contentstack.io',
        port: 443,
        protocol: 'https:',
        verbs: {
            get: 'GET',
        },
    },
    'listener': {},
    'locales': [],
    'sync-manager': {
        cooloff: 3000,
        enableAssetReferences: true,
        enableContentReferences: true,
        limit: 100,
        maxsize: 2097152,
        saveFailedItems: true,
        saveFilteredItems: true,
    },
};
//# sourceMappingURL=defaults.js.map