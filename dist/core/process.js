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
    const killDuration = (process.env.KILLDURATION) ? softKill() : 15000;
    logger_1.logger.info(`Received ${signal}. This will shut down the process in ${killDuration}ms..`);
    setInterval(abort, killDuration);
};
const softKill = () => {
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
//# sourceMappingURL=process.js.map