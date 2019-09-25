"use strict";
/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
exports.__esModule = true;
/**
 * @note 'SIGKILL' cannot have a listener installed, it will unconditionally terminate Node.js on all platforms.
 * @note 'SIGSTOP' cannot have a listener installed.
 */
var index_1 = require("../index");
var logger_1 = require("../util/logger");
var index_2 = require("./index");
/**
 * @description Handles process exit. Stops the current application and manages a graceful shutdown
 * @param {String} signal - Process signal
 */
var handleExit = function (signal) {
    index_2.lock();
    var syncManager = index_1.getConfig().syncManager;
    var killDuration = (process.env.KILLDURATION) ? calculateKillDuration() : syncManager.processTimeout;
    logger_1.logger.info("Received " + signal + ". This will shut down the process in " + killDuration + "ms..");
    setTimeout(abort, killDuration);
};
/**
 * https://www.joyent.com/node-js/production/design/errors
 * https://stackoverflow.com/questions/7310521/node-js-best-practice-exception-handling/23368579
 *
 * @description Manage unhandled errors
 * @param {Object} error - Unhandled error object
 */
var unhandledErrors = function (error) {
    logger_1.logger.error('Unhandled exception caught. Locking down process for 10s to recover..');
    logger_1.logger.error(error);
    index_2.lock();
    setTimeout(function () {
        index_2.unlock();
    }, 10000);
};
/**
 * @description Validates 'process.env.KILLDURATION' time passed
 */
var calculateKillDuration = function () {
    var killDuration = parseInt(process.env.KILLDURATION, 10);
    if (isNaN(killDuration)) {
        var syncManager = index_1.getConfig().syncManager;
        return syncManager.processTimeout;
    }
    return killDuration;
};
/**
 * @description Aborts the current application
 */
var abort = function () {
    process.abort();
};
exports.configure = function () {
    process.on('SIGTERM', handleExit);
    process.on('SIGINT', handleExit);
    process.on('uncaughtException', unhandledErrors);
    process.on('unhandledRejection', unhandledErrors);
};
