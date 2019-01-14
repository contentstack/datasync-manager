"use strict";
/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
exports.buildConfigPaths = () => {
    const baseDir = process.cwd();
    const paths = {
        cwd: baseDir,
        failedItems: path_1.resolve(path_1.join(baseDir, 'unprocessible', 'failed.json')),
        filteredItems: path_1.resolve(path_1.join(baseDir, 'unprocessible', 'filtered.json')),
        plugin: path_1.resolve(path_1.join((process.env.PLUGIN_PATH || baseDir), 'plugins')),
        token: {
            checkpoint: path_1.resolve(path_1.join(baseDir, '.tokens', 'checkpoint')),
            current: path_1.resolve(path_1.join(baseDir, '.tokens', 'current')),
            ledger: path_1.resolve(path_1.join(baseDir, '.tokens', 'ledger')),
        },
    };
    return paths;
};
//# sourceMappingURL=build-paths.js.map