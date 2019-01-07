"use strict";
/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = (data) => {
    try {
        return JSON.parse(data);
    }
    catch (error) {
        return data;
    }
};
//# sourceMappingURL=parse.js.map