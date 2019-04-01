"use strict";
/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = {
    assetStore: {},
    contentStore: {},
    contentstack: {
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
    listener: {},
    locales: [],
    syncManager: {
        cooloff: 3000,
        enableAssetReferences: true,
        enableContentReferences: true,
        enableRteMarkdownDownload: true,
        inet: {
            dns: '8.8.8.8',
            host: 'contentstack.io',
            port: 5000,
            retries: 5,
            retryTimeout: 10 * 1000,
            retryIncrement: 10 * 1000,
            timeout: 60 * 1000,
            type: 'A',
        },
        limit: 100,
        maxsize: 2097152,
        queue: {
            pause_threshold: 10000,
            resume_threshold: 5000
        },
        saveFailedItems: true,
        saveFilteredItems: true,
    },
};
