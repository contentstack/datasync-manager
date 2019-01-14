/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
export declare const config: {
    contentstack: {
        MAX_RETRY_LIMIT: number;
        actions: {
            delete: string;
            publish: string;
            unpublish: string;
        };
        apis: {
            content_types: string;
            sync: string;
        };
        host: string;
        port: number;
        protocol: string;
        verbs: {
            get: string;
        };
    };
    locales: any[];
    'sync-manager': {
        cooloff: number;
        limit: number;
    };
};
