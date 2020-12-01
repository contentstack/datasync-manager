"use strict";
/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.setLogger = void 0;
const validations_1 = require("./validations");
/**
 * @summary Creates a logger instance
 * @example
 *    const log = createLogger(instance)
 *    log.info('Hello world!')
 */
exports.setLogger = (customLogger) => {
    if (exports.logger) {
        return exports.logger;
    }
    else if (!validations_1.validateLogger(customLogger) && !customLogger) {
        exports.logger = console;
    }
    else {
        exports.logger = customLogger;
    }
    return exports.logger;
};
