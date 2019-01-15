"use strict";
/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const lodash_1 = require("lodash");
const __1 = require("..");
const fs_1 = require("../util/fs");
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
                const ledger = (JSON.parse(data));
                const token = lodash_1.find(ledger, (tokenItem) => {
                    return tokenItem.type === type;
                });
                if (typeof token !== 'undefined') {
                    return resolve(token);
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
            timestamp: new Date().toISOString(),
            token,
        };
        return fs_1.writeFile(path, JSON.stringify(data)).then(() => {
            const obj = {
                name,
                timestamp: new Date().toISOString(),
                token,
                type,
            };
            if (!fs_1.existsSync(config.paths.token.ledger)) {
                return fs_1.writeFile(config.paths.token.ledger, JSON.stringify([obj]))
                    .then(resolve)
                    .catch(reject);
            }
            return fs_1.readFile(config.paths.token.ledger).then((ledger) => {
                const ledgerDetails = JSON.parse(ledger);
                ledgerDetails.splice(0, 0, obj);
                return fs_1.writeFile(config.paths.token.ledger, JSON.stringify(ledgerDetails))
                    .then(resolve)
                    .catch(reject);
            }).catch(reject);
        }).catch((error) => {
            return reject(error);
        });
    });
};
//# sourceMappingURL=token-management.js.map