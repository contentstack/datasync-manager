/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
/**
 * @description Default application's internal config
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
    plugins: {
        _cs_internal_transform_entries: {
            disabled: boolean;
        };
        _cs_internal_transform_assets: {
            disabled: boolean;
        };
        _cs_internal_transform_schemas: {
            disabled: boolean;
            assets: boolean;
            entries: boolean;
        };
    };
    syncManager: {
        cooloff: number;
        enableAssetReferences: boolean;
        enableContentReferences: boolean;
        enableRteMarkdownDownload: boolean;
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
        markdown: {
            gfm: boolean;
            tables: boolean;
            breaks: boolean;
            smartLists: boolean;
            xhtml: boolean;
        };
        maxsize: number;
        queue: {
            pause_threshold: number;
            resume_threshold: number;
        };
        saveFailedItems: boolean;
        saveFilteredItems: boolean;
    };
};
