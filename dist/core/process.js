"use strict";
/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../util/logger");
const sync_1 = require("./sync");
const handleExit = (signal) => {
    sync_1.lock();
    const killDuration = (process.env.KILLDURATION) ? calculateKillDuration() : 15000;
    logger_1.logger.info(`Received ${signal}. This will shut down the process in ${killDuration}ms..`);
    setInterval(abort, killDuration);
};
const unhandledErrors = (error) => {
    logger_1.logger.error('Unhandled exception caught. Locking down process for 10s to recover..');
    logger_1.logger.error(error);
    sync_1.lock();
    setInterval(() => {
        sync_1.unlock();
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
process.on('SIGTERM', handleExit);
process.on('SIGINT', handleExit);
process.on('uncaughtException', unhandledErrors);
//# sourceMappingURL=process.js.map