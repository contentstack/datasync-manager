"use strict";
/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const fs_1 = require("../fs");
const parse_1 = require("../parse");
const stringify_1 = require("../stringify");
const DEBUG_ERR = debug_1.default('error:log-filtereditems');
exports.saveFilteredItems = (items, name, token, paths) => {
    return new Promise((resolve) => {
        const path = paths.filteredItems;
        const objDetails = {
            items,
            name,
            timestamp: new Date().toISOString(),
            token,
        };
        if (fs_1.existsSync(path)) {
            return fs_1.readFile(path).then((data) => {
                const loggedItems = parse_1.parse(data);
                loggedItems.push(objDetails);
                return fs_1.writeFile(path, stringify_1.stringify(loggedItems)).then(resolve).catch((error) => {
                    DEBUG_ERR(`Errorred while writing ${stringify_1.stringify(loggedItems)} at ${path} file`);
                    DEBUG_ERR(stringify_1.stringify(error));
                    return resolve();
                });
            }).catch((error) => {
                DEBUG_ERR(`Errorred while reading ${path} file`);
                DEBUG_ERR(stringify_1.stringify(error));
                return resolve();
            });
        }
        return fs_1.writeFile(path, stringify_1.stringify([objDetails])).then(resolve).catch((error) => {
            DEBUG_ERR(`Errorred while writing ${stringify_1.stringify(objDetails)} at ${path} file`);
            DEBUG_ERR(stringify_1.stringify(error));
            return resolve();
        });
    });
};
//# sourceMappingURL=filteredItems.js.map