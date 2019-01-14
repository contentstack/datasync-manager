"use strict";
/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
const validations_1 = require("./validations");
exports.setLogger = (customLogger) => {
    if (exports.logger) {
        return exports.logger;
    }
    else if (!validations_1.validateLogger(customLogger) && !customLogger) {
        exports.logger = console;
        exports.logger.info('Standard logger created');
    }
    else {
        exports.logger = customLogger;
        exports.logger.info('Customized logger registered successfully!');
    }
    return exports.logger;
};
//# sourceMappingURL=logger.js.map