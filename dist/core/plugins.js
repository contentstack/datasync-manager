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
const lodash_1 = require("lodash");
const index_1 = require("../util/index");
const validations_1 = require("../util/validations");
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
    const plugins = config.plugins || {};
    pluginMethods.forEach((pluginMethod) => {
        pluginInstances.external[pluginMethod] = pluginInstances[pluginMethod] || [];
        pluginInstances.internal[pluginMethod] = pluginInstances[pluginMethod] || [];
    });
    plugins.forEach((plugin) => {
        validations_1.validatePlugin(plugin);
        const pluginName = plugin.name;
        const slicedName = pluginName.slice(0, 13);
        let isInternal = false;
        if (slicedName === '_cs_internal_') {
            isInternal = true;
        }
        const pluginPath = index_1.normalizePluginPath(config, plugin, isInternal);
        const Plugin = require(pluginPath);
        Plugin.options = plugin.options;
        // execute/initiate plugin
        Plugin();
        pluginMethods.forEach((pluginMethod) => {
            if (lodash_1.hasIn(Plugin, pluginMethod)) {
                if (plugin.disabled) {
                    // do nothing
                }
                else if (isInternal) {
                    pluginInstances.internal[pluginMethod].push(Plugin[pluginMethod]);
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
    });
    debug('Plugins loaded successfully!');
    return pluginInstances;
};
