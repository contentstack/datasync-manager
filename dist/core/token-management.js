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
const index_1 = require("../index");
const fs_1 = require("../util/fs");
const index_2 = require("../util/index");
const debug = debug_1.default('token-management');
let counter = 0;
/**
 * @description Returns 'token details' based on 'token type'
 * @param {String} type - Token type (checkpoint | current)
 */
exports.getToken = () => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const config = index_1.getConfig();
            const checkpoint = config.paths.checkpoint;
            const token = config.paths.token;
            let data = {};
            if (fs_1.existsSync(checkpoint)) {
                debug(`Checkpoint read: ${checkpoint}`);
                const contents = yield fs_1.readFile(checkpoint);
                data = JSON.parse(contents);
            }
            else if (fs_1.existsSync(token)) {
                debug(`Token read: ${token}`);
                const contents = yield fs_1.readFile(token);
                data = JSON.parse(contents);
            }
            return resolve(data);
        }
        catch (error) {
            return reject(error);
        }
    }));
};
/**
 * @description Saves token details
 * @param {String} name - Name of the token
 * @param {String} token - Token value
 * @param {String} type - Token type
 */
exports.saveToken = (name, token) => {
    debug(`Save token invoked with name: ${name}, token: ${token}`);
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const config = index_1.getConfig();
            const path = config.paths.token;
            const data = {
                name,
                timestamp: new Date().toISOString(),
                token,
            };
            // write token information @path
            yield fs_1.writeFile(path, JSON.stringify(data));
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
            const file = yield index_2.getFile(filename, () => {
                counter++;
                return `${config.paths.ledger}-${counter}`;
            });
            debug(`ledger file: ${file} exists?(${fs_1.existsSync(file)})`);
            if (!fs_1.existsSync(file)) {
                yield fs_1.writeFile(file, JSON.stringify([obj]));
            }
            else {
                const ledger = yield fs_1.readFile(file);
                const ledgerDetails = JSON.parse(ledger);
                ledgerDetails.splice(0, 0, obj);
                yield fs_1.writeFile(file, JSON.stringify(ledgerDetails));
            }
            return resolve();
        }
        catch (error) {
            return reject(error);
        }
    }));
};
/**
 * @description Saves token details
 * @param {String} name - Name of the token
 * @param {String} token - Token value
 * @param {String} type - Token type
 */
exports.saveCheckpoint = (name, token) => __awaiter(this, void 0, void 0, function* () {
    debug(`Save token invoked with name: ${name}, token: ${token}`);
    const config = index_1.getConfig();
    const path = config.paths.checkpoint;
    const data = {
        name,
        timestamp: new Date().toISOString(),
        token,
    };
    yield fs_1.writeFile(path, JSON.stringify(data));
    return;
});
exports.getFinalToken = () => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const config = index_1.getConfig();
            const token = config.paths.token;
            const ledger = config.paths.ledger;
            let data = {};
            if (fs_1.existsSync(ledger)) {
                debug(`Token read:${ledger}`);
                const contents = yield fs_1.readFile(ledger);
                data = JSON.parse(contents)[0];
            }
            else if (fs_1.existsSync(token)) {
                debug(`Token read:${token}`);
                const contents = yield fs_1.readFile(token);
                data = JSON.parse(contents);
            }
            else {
            }
            return resolve(data);
        }
        catch (error) {
            reject(error);
        }
    }));
};
