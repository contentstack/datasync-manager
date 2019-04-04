"use strict";
/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const __1 = require("..");
const index_1 = require("../util/index");
const fs_1 = require("../util/fs");
const debug = debug_1.default('token-management');
let counter = 0;
/**
 * @description Returns 'token details' based on 'token type'
 * @param {String} type - Token type (checkpoint | current)
 */
exports.getToken = () => {
    return new Promise((resolve, reject) => {
        try {
            const config = __1.getConfig();
            const checkpoint = config.paths.checkpoint;
            const token = config.paths.token;
            if (fs_1.existsSync(checkpoint)) {
                debug(`Checkpoint read: ${checkpoint}`);
                return fs_1.readFile(checkpoint).then((data) => {
                    return resolve(JSON.parse(data));
                });
            }
            else if (fs_1.existsSync(token)) {
                debug(`Token read: ${token}`);
                return fs_1.readFile(token).then((data) => {
                    return resolve(JSON.parse(data));
                });
            }
            return resolve({});
        }
        catch (error) {
            return reject(error);
        }
    });
};
/**
 * @description Saves token details
 * @param {String} name - Name of the token
 * @param {String} token - Token value
 * @param {String} type - Token type
 */
exports.saveToken = (name, token) => {
    debug(`Save token invoked with name: ${name}, token: ${token}`);
    return new Promise((resolve, reject) => {
        const config = __1.getConfig();
        const path = config.paths.token;
        const data = {
            name,
            timestamp: new Date().toISOString(),
            token,
        };
        return fs_1.writeFile(path, JSON.stringify(data)).then(() => __awaiter(this, void 0, void 0, function* () {
            const obj = {
                name,
                timestamp: new Date().toISOString(),
                token,
            };
            let filename;
            if (counter === 0) {
                filename = config.paths.ledger;
            }
            else {
                filename = `${config.paths.ledger}.${counter}`;
            }
            const file = yield index_1.getFile(filename, () => {
                counter++;
                return `${config.paths.ledger}-${counter}`;
            });
            debug(`ledger file: ${file} exists?(${fs_1.existsSync(file)})`);
            if (!fs_1.existsSync(file)) {
                return fs_1.writeFile(file, JSON.stringify([obj]))
                    .then(resolve);
            }
            return fs_1.readFile(file).then((ledger) => {
                const ledgerDetails = JSON.parse(ledger);
                ledgerDetails.splice(0, 0, obj);
                return fs_1.writeFile(file, JSON.stringify(ledgerDetails))
                    .then(resolve);
            });
        })).catch(reject);
    });
};
/**
 * @description Saves token details
 * @param {String} name - Name of the token
 * @param {String} token - Token value
 * @param {String} type - Token type
 */
exports.saveCheckpoint = (name, token) => {
    debug(`Save token invoked with name: ${name}, token: ${token}`);
    return new Promise((resolve, reject) => {
        const config = __1.getConfig();
        const path = config.paths.checkpoint;
        const data = {
            name,
            timestamp: new Date().toISOString(),
            token,
        };
        return fs_1.writeFile(path, JSON.stringify(data))
            .then(resolve)
            .catch(reject);
    });
};
