"use strict";
/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
exports.__esModule = true;
var path_1 = require("path");
/**
 * @description Builds application's config paths where data is stored
 * @returns {Object} Returns config paths
 */
exports.buildConfigPaths = function () {
    //const baseDir = resolve(join(__dirname, '..', '..', '..', '..'))
    var pluginPath;
    var tokenPath;
    var baseDir = path_1.resolve(path_1.join(__dirname, '..', '..')); //used for development purpose 
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
    var paths = {
        baseDir: path_1.resolve(path_1.join(__dirname, '..', '..')),
        checkpoint: path_1.resolve(path_1.join(tokenPath || path_1.join(baseDir, '..'), '.checkpoint')),
        failed: path_1.resolve(path_1.join(tokenPath || path_1.join(baseDir, '..'), 'unprocessible', 'failed')),
        filtered: path_1.resolve(path_1.join(tokenPath || path_1.join(baseDir, '..'), 'unprocessible', 'filtered')),
        ledger: path_1.resolve(path_1.join(tokenPath || path_1.join(baseDir, '..'), '.ledger')),
        plugin: path_1.resolve(path_1.join(pluginPath || path_1.join(baseDir, '..'), 'plugins')),
        token: path_1.resolve(path_1.join(tokenPath || path_1.join(baseDir, '..'), '.token')),
        unprocessibleDir: path_1.resolve(path_1.join(tokenPath || baseDir, 'unprocessible'))
    };
    return paths;
};
