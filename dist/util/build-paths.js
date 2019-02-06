"use strict";
/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
exports.buildConfigPaths = () => {
    const baseDir = path_1.resolve(path_1.join(__dirname, '..', '..', '..', '..'));
    const paths = {
        baseDir: path_1.resolve(path_1.join(__dirname, '..', '..')),
        failed: path_1.resolve(path_1.join(baseDir, 'unprocessible', 'failed')),
        filtered: path_1.resolve(path_1.join(baseDir, 'unprocessible', 'filtered')),
        ledger: path_1.resolve(path_1.join(baseDir, '.ledger')),
        plugin: path_1.resolve(path_1.join((process.env.PLUGIN_PATH || baseDir), 'plugins')),
        token: path_1.resolve(path_1.join(baseDir, '.token')),
        unprocessibleDir: path_1.resolve(path_1.join(baseDir, 'unprocessible')),
    };
    return paths;
};
