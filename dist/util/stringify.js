"use strict";
/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringify = (input) => {
    if (typeof input === 'object') {
        if (input.message) {
            return input.message;
        }
        return JSON.stringify(input);
    }
    return input.toString();
};
//# sourceMappingURL=stringify.js.map