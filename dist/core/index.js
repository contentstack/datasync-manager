"use strict";
/*!
 * Contentstack Sync Manager
 * Copyright © 2019 Contentstack LLC
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const q_1 = require("./q");
const sync_1 = require("./sync");
exports.init = (connector, config) => {
    return new Promise((resolve, reject) => {
        const QInstance = new q_1.Q(connector, config);
        api_1.init(config.contentstack);
        return sync_1.start(QInstance).then(resolve).catch(reject);
    });
};
//# sourceMappingURL=index.js.map