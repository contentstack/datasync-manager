/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
export declare const buildConfigPaths: () => {
    baseDir: string;
    failed: string;
    filtered: string;
    plugin: string;
    token: {
        checkpoint: string;
        current: string;
        ledger: string;
    };
    unprocessibleDir: string;
};
