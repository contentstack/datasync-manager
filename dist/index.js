"use strict";
/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const lodash_1 = require("lodash");
const core_1 = require("./core");
const defaults_1 = require("./defaults");
const build_paths_1 = require("./util/build-paths");
const logger_1 = require("./util/logger");
const validations_1 = require("./util/validations");
const debug = debug_1.default('registration');
let appConfig = {};
let contentConnector;
let assetConnector;
let listener;
exports.setContentConnector = (instance) => {
    contentConnector = instance;
};
exports.setAssetConnector = (instance) => {
    assetConnector = instance;
};
exports.setListener = (instance) => {
    validations_1.validateListener(instance);
    listener = instance;
};
exports.setConfig = (config) => {
    appConfig = config;
};
exports.getConfig = () => {
    return appConfig;
};
var logger_2 = require("./util/logger");
exports.setLogger = logger_2.setLogger;
exports.start = (config = {}) => {
    return new Promise((resolve, reject) => {
        try {
            validations_1.validateInstances(assetConnector, contentConnector, listener);
            appConfig = lodash_1.merge({}, defaults_1.config, appConfig, config);
            validations_1.validateConfig(appConfig);
            appConfig.paths = build_paths_1.buildConfigPaths();
            logger_1.setLogger();
            if (assetConnector.setLogger && typeof assetConnector.setLogger === 'function') {
                assetConnector.setLogger(logger_1.logger);
            }
            if (contentConnector.setLogger && typeof contentConnector.setLogger === 'function') {
                contentConnector.setLogger(logger_1.logger);
            }
            return assetConnector.start(appConfig).then((assetInstance) => {
                debug('Asset connector instance has returned successfully!');
                validations_1.validateAssetConnector(assetInstance);
                return contentConnector.start(assetInstance, appConfig);
            }).then((connectorInstance) => {
                debug('Content connector instance has returned successfully!');
                validations_1.validateContentConnector(connectorInstance);
                return core_1.init(connectorInstance);
            }).then(() => {
                debug('Sync Manager initiated successfully!');
                listener.register(core_1.poke);
                return listener.start(appConfig);
            }).then(() => {
                logger_1.logger.info('Contentstack sync utility started successfully!');
                return resolve();
            }).catch(reject);
        }
        catch (error) {
            return reject(error);
        }
    });
};
//# sourceMappingURL=index.js.map