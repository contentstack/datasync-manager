"use strict";
/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
/**
 * @description Builds application's config paths where data is stored
 * @returns {Object} Returns config paths
 */
exports.buildConfigPaths = () => {
    const baseDir = path_1.resolve(path_1.join(__dirname, '..', '..', '..', '..'));
    //const baseDir = resolve(join(__dirname, '..', '..')) // for development purpose only
    let pluginPath;
    let tokenPath;
    if (process.env.PLUGIN_PATH) {
        if (!path_1.isAbsolute(process.env.PLUGIN_PATH)) {
            pluginPath = path_1.join(baseDir, process.env.PLUGIN_PATH);
        }
        else {
            pluginPath = process.env.PLUGIN_PATH;
        }
    }
    if (process.env.TOKEN_PATH) {
        if (!path_1.isAbsolute(process.env.TOKEN_PATH)) {
            tokenPath = path_1.join(baseDir, process.env.TOKEN_PATH);
        }
        else {
            tokenPath = process.env.TOKEN_PATH;
        }
    }
    const paths = {
        baseDir: path_1.resolve(path_1.join(__dirname, '..', '..')),
        checkpoint: path_1.resolve(path_1.join(tokenPath || path_1.join(baseDir, '..'), '.checkpoint')),
        failed: path_1.resolve(path_1.join(tokenPath || path_1.join(baseDir, '..'), 'unprocessible', 'failed')),
        filtered: path_1.resolve(path_1.join(tokenPath || path_1.join(baseDir, '..'), 'unprocessible', 'filtered')),
        ledger: path_1.resolve(path_1.join(tokenPath || path_1.join(baseDir, '..'), '.ledger')),
        plugin: path_1.resolve(path_1.join(pluginPath || path_1.join(baseDir, '..'), 'plugins')),
        token: path_1.resolve(path_1.join(tokenPath || path_1.join(baseDir, '..'), '.token')),
        unprocessibleDir: path_1.resolve(path_1.join(tokenPath || baseDir, 'unprocessible')),
    };
    return paths;
};
