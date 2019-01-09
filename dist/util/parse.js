"use strict";
/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = (data) => {
    try {
        if (typeof data === 'object') {
            return data;
        }
        return JSON.parse(data);
    }
    catch (error) {
        return data;
    }
};
//# sourceMappingURL=parse.js.map