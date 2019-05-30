"use strict";
/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
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
const logger_1 = require("../util/logger");
const debug = debug_1.default('plugins');
const pluginMethods = ['beforeSync', 'afterSync'];
/**
 * @description Load registered plugins
 * @param {Object} config - Application config
 * @returns {Object} pluginInstance - An instance of plugins, with valid registered methods
 */
exports.load = (config) => {
    debug('Plugins load called');
    const pluginInstances = {
        internal: {},
        external: {}
    };
    const plugins = config || {};
    pluginMethods.forEach((pluginMethod) => {
        pluginInstances.external[pluginMethod] = pluginInstances[pluginMethod] || [];
        pluginInstances.internal[pluginMethod] = pluginInstances[pluginMethod] || [];
    });
    for (const pluginName of Object.keys(plugins)) {
        const slicedName = pluginName.slice(0, 13);
        let pluginPath;
        if (slicedName === '_cs_internal_') {
            // load internal plugins
            pluginPath = path_1.join(__dirname, '..', 'plugins', pluginName.slice(13), 'index.js');
        }
        else {
            // external plugins
            pluginPath = path_1.resolve(path_1.join(config.paths.plugin, pluginName, 'index.js'));
        }
        if (fs_1.existsSync(pluginPath)) {
            const Plugin = require(pluginPath);
            const pluginConfig = plugins[pluginName];
            // execute/initiate plugin
            Plugin(pluginConfig);
            pluginMethods.forEach((pluginMethod) => {
                if (lodash_1.hasIn(Plugin, pluginMethod)) {
                    if (slicedName === '_cs_internal_') {
                        if (!(pluginConfig.disabled)) {
                            pluginInstances.internal[pluginMethod].push(Plugin[pluginMethod]);
                        }
                    }
                    else {
                        pluginInstances.external[pluginMethod].push(Plugin[pluginMethod]);
                    }
                    debug(`${pluginMethod} loaded from ${pluginName} successfully!`);
                }
                else {
                    debug(`${pluginMethod} not found in ${pluginName}`);
                }
            });
        }
        else {
            logger_1.logger.warn(`Unable to load ${pluginName} plugin since ${pluginPath} was not found!`);
        }
    }
    debug('Plugins loaded successfully!');
    return pluginInstances;
};
