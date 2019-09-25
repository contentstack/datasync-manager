"use strict";
/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
exports.__esModule = true;
var validations_1 = require("./validations");
/**
 * @summary Creates a logger instance
 * @example
 *    const log = createLogger(instance)
 *    log.info('Hello world!')
 */
exports.setLogger = function (customLogger) {
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
