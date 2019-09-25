"use strict";
/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
exports.__esModule = true;
var debug_1 = require("debug");
var lodash_1 = require("lodash");
var index_1 = require("../util/index");
var validations_1 = require("../util/validations");
var debug = debug_1["default"]('plugins');
var pluginMethods = ['beforeSync', 'afterSync'];
/**
 * @description Load registered plugins
 * @param {Object} config - Application config
 * @returns {Object} pluginInstance - An instance of plugins, with valid registered methods
 */
exports.load = function (config) {
    debug('Plugins load called');
    var pluginInstances = {
        external: {},
        internal: {}
    };
    var plugins = config.plugins || [];
    pluginMethods.forEach(function (pluginMethod) {
        pluginInstances.external[pluginMethod] = pluginInstances[pluginMethod] || [];
        pluginInstances.internal[pluginMethod] = pluginInstances[pluginMethod] || [];
    });
    plugins.forEach(function (plugin) {
        validations_1.validatePlugin(plugin);
        var pluginName = plugin.name;
        var slicedName = pluginName.slice(0, 13);
        var isInternal = false;
        if (slicedName === '_cs_internal_') {
            isInternal = true;
        }
        var pluginPath = index_1.normalizePluginPath(config, plugin, isInternal);
        var Plugin = require(pluginPath);
        Plugin.options = plugin.options || {};
        // execute/initiate plugin
        Plugin();
        pluginMethods.forEach(function (pluginMethod) {
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
                debug(pluginMethod + " loaded from " + pluginName + " successfully!");
            }
            else {
                debug(pluginMethod + " not found in " + pluginName);
            }
        });
    });
    debug('Plugins loaded successfully!');
    return pluginInstances;
};
