/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
export declare const config: {
    'contentstack': {
        MAX_RETRY_LIMIT: number;
        actions: {
            delete: string;
            publish: string;
            unpublish: string;
        };
        cdn: string;
        host: string;
        methods: {
            delete: string;
            get: string;
            patch: string;
            post: string;
        };
        restAPIS: {
            assets: string;
            contentTypes: string;
            entries: string;
            sync: string;
        };
    };
    'sync-manager': {
        cooloff: number;
        limit: number;
    };
};
//# sourceMappingURL=defaults.d.ts.map