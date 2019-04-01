/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
export declare const config: {
    assetStore: {};
    contentStore: {};
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
    listener: {};
    locales: any[];
    syncManager: {
        cooloff: number;
        enableAssetReferences: boolean;
        enableContentReferences: boolean;
        inet: {
            dns: string;
            host: string;
            port: number;
            retries: number;
            retryTimeout: number;
            retryIncrement: number;
            timeout: number;
            type: string;
        };
        limit: number;
        maxsize: number;
        queue: {
            pause_threshold: number;
            resume_threshold: number;
        };
        saveFailedItems: boolean;
        saveFilteredItems: boolean;
    };
};
