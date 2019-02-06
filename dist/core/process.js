"use strict";
/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../util/logger");
const _1 = require("./");
const handleExit = (signal) => {
    _1.lock();
    const killDuration = (process.env.KILLDURATION) ? calculateKillDuration() : 1000;
    logger_1.logger.info(`Received ${signal}. This will shut down the process in ${killDuration}ms..`);
    setTimeout(abort, killDuration);
};
const unhandledErrors = (error) => {
    logger_1.logger.error('Unhandled exception caught. Locking down process for 10s to recover..');
    logger_1.logger.error(error);
    _1.lock();
    setTimeout(() => {
        _1.unlock();
    }, 10000);
};
const calculateKillDuration = () => {
    const killDuration = parseInt(process.env.KILLDURATION, 10);
    if (isNaN(killDuration)) {
        return 15000;
    }
    return killDuration;
};
const abort = () => {
    process.abort();
};
exports.configure = () => {
    process.on('SIGTERM', handleExit);
    process.on('SIGINT', handleExit);
    process.on('uncaughtException', unhandledErrors);
    process.on('unhandledRejection', unhandledErrors);
};
