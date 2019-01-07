"use strict";
/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const fs_1 = require("fs");
const lodash_1 = require("lodash");
const path_1 = require("path");
const debug = debug_1.default('sm:core-plugins');
const pluginMethods = ['beforePublish', 'beforeUnpublish', 'afterPublish', 'afterUnpublish', 'beforeDelete',
    'afterDelete',
];
exports.load = (config) => {
    debug('Plugins load called');
    const pluginInstances = {};
    const plugins = config.plugins || {};
    pluginMethods.forEach((pluginMethod) => {
        pluginInstances[pluginMethod] = pluginInstances[pluginMethod] || [];
    });
    for (const pluginName of Object.keys(plugins)) {
        const pluginPath = path_1.resolve(path_1.join(config.paths.plugin, pluginName, 'index.js'));
        if (fs_1.existsSync(pluginPath)) {
            const Plugin = require(pluginPath);
            const pluginConfig = plugins[pluginName];
            Plugin(pluginConfig);
            pluginMethods.forEach((pluginMethod) => {
                if (lodash_1.hasIn(Plugin, pluginMethod)) {
                    pluginInstances[pluginMethod].push(Plugin[pluginMethod]);
                }
            });
        }
        else {
        }
    }
    debug('Plugins built successfully!');
    return pluginInstances;
};
//# sourceMappingURL=plugins.js.map