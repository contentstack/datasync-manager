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
const __1 = require("..");
const fs_1 = require("../util/fs");
const parse_1 = require("../util/parse");
const stringify_1 = require("../util/stringify");
const debug = debug_1.default('sm:token-management');
exports.getTokenByType = (type) => {
    debug(`Get token invoked with type: ${type}`);
    return new Promise((resolve, reject) => {
        try {
            const config = __1.getConfig();
            const path = config.paths.token.ledger;
            if (!fs_1.existsSync(path)) {
                debug(`Token details do not exist! ${path} not found`);
                const err = new Error(`Token path ${path} does not exist`);
                err.code = 'TNE';
                return reject(err);
            }
            return fs_1.readFile(path).then((data) => {
                const ledger = parse_1.parse(data);
                for (let i = 0; i < ledger.length; i++) {
                    if (ledger[i].type === type) {
                        return resolve(ledger[i]);
                    }
                }
                debug(`Unable to find any details of ${type} token. Returning the first token we find!`);
                return resolve(ledger[0]);
            }).catch(reject);
        }
        catch (error) {
            return reject(error);
        }
    });
};
exports.saveToken = (name, token, type) => {
    debug(`Save token invoked with name: ${name}, token: ${token}, type: ${type}`);
    return new Promise((resolve, reject) => {
        const config = __1.getConfig();
        let path;
        if (type === 'checkpoint') {
            path = config.paths.token.checkpoint;
        }
        else {
            path = config.paths.token.current;
        }
        const data = {
            name,
            token,
        };
        return fs_1.writeFile(path, stringify_1.stringify(data)).then(() => {
            const obj = {
                name,
                timestamp: new Date().toISOString(),
                token,
                type,
            };
            if (!fs_1.existsSync(config.paths.token.ledger)) {
                return fs_1.writeFile(config.paths.token.ledger, stringify_1.stringify([obj]))
                    .then(resolve)
                    .catch((error) => {
                    throw error;
                });
            }
            return fs_1.readFile(config.paths.token.ledger).then((ledger) => {
                const ledgerDetails = parse_1.parse(ledger);
                ledgerDetails.splice(0, 0, obj);
                return fs_1.writeFile(config.paths.token.ledger, stringify_1.stringify(ledgerDetails))
                    .then(resolve)
                    .catch((error) => {
                    throw error;
                });
            }).catch((error) => {
                throw error;
            });
        }).catch((error) => {
            return reject(error);
        });
    });
};
//# sourceMappingURL=token-management.js.map