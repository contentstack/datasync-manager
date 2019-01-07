"use strict";
/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
const sync_1 = require("./sync");
const handleExit = () => {
    sync_1.lock();
    const killDuration = (process.env.KILLDURATION) ? softKill() : 15000;
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