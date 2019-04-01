"use strict";
/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
exports.buildConfigPaths = () => {
    const baseDir = path_1.resolve(path_1.join(__dirname, '..', '..', '..', '..'));
    const paths = {
        baseDir: path_1.resolve(path_1.join(__dirname, '..', '..')),
        plugin: path_1.resolve(path_1.join((process.env.PLUGIN_PATH || baseDir), 'plugins')),
        unprocessibleDir: path_1.resolve(path_1.join(baseDir, 'unprocessible')),
    };
    if (process.env.TOKEN_PATH && process.env.TOKEN_PATH.length !== 0 && fs_1.existsSync(process.env.TOKEN_PATH)) {
        paths.failed = path_1.resolve(path_1.join(process.env.TOKEN_PATH, 'unprocessible', 'failed'));
        paths.filtered = path_1.resolve(path_1.join(process.env.TOKEN_PATH, 'unprocessible', 'filtered'));
        paths.checkpoint = path_1.resolve(path_1.join(process.env.TOKEN_PATH, '.checkpoint'));
        paths.ledger = path_1.resolve(path_1.join(process.env.TOKEN_PATH, '.ledger'));
        paths.token = path_1.resolve(path_1.join(process.env.TOKEN_PATH, '.token'));
    }
    else {
        paths.failed = path_1.resolve(path_1.join(baseDir, '..', 'unprocessible', 'failed'));
        paths.filtered = path_1.resolve(path_1.join(baseDir, '..', 'unprocessible', 'filtered'));
        paths.checkpoint = path_1.resolve(path_1.join(baseDir, '..', '.checkpoint'));
        paths.ledger = path_1.resolve(path_1.join(baseDir, '..', '.ledger'));
        paths.token = path_1.resolve(path_1.join(baseDir, '..', '.token'));
    }
    return paths;
};
