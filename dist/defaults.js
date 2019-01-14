"use strict";
/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = {
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
    locales: [],
    'sync-manager': {
        cooloff: 3000,
        limit: 100,
    },
};
//# sourceMappingURL=defaults.js.map