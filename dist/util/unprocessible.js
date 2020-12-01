"use strict";
/*!
* Contentstack DataSync Manager
* This module saves filtered/failed items
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveFilteredItems = exports.saveFailedItems = void 0;
const index_1 = require("../index");
const fs_1 = require("./fs");
const index_2 = require("./index");
const logger_1 = require("./logger");
const counter = {
    failed: 0,
    filtered: 0,
};
/**
 * TODO
 * This method logs all failed items.
 * Failed items should be 'retried' when app is started Or after a specific interval
 * @param {Object} obj - Contains 'error' and 'data' key
 * @returns {Promise} Returns a promisified object
 */
exports.saveFailedItems = (obj) => {
    return new Promise((resolve) => {
        // const path = getConfig().paths.failedItems
        return resolve(obj);
    });
};
/**
 * @description Saves items filtered from SYNC API response
 * @param {Object} items - Filtered items
 * @param {String} name - Page name where items were filtered
 * @param {String} token - Page token value
 * @returns {Promise} Returns a promise
 */
exports.saveFilteredItems = (items, name, token) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const config = index_1.getConfig();
            let filename;
            if (!config.syncManager.saveFilteredItems) {
                return resolve();
            }
            const objDetails = {
                items,
                name,
                timestamp: new Date().toISOString(),
                token,
            };
            if (counter.filtered === 0) {
                filename = `${config.paths.filtered}.json`;
            }
            else {
                filename = `${config.paths.filtered}-${counter.filtered}.json`;
            }
            const file = yield index_2.getFile(filename, () => {
                counter.filtered++;
                return `${config.paths.filtered}-${counter.filtered}.json`;
            });
            if (fs_1.existsSync(file)) {
                return fs_1.readFile(file).then((data) => {
                    const loggedItems = JSON.parse(data);
                    loggedItems.push(objDetails);
                    return fs_1.writeFile(file, JSON.stringify(loggedItems)).then(resolve).catch((error) => {
                        // failed to log failed items
                        logger_1.logger.error(`Failed to write ${JSON.stringify(loggedItems)} at ${error}`);
                        logger_1.logger.error(error);
                        return resolve();
                    });
                }).catch((error) => {
                    logger_1.logger.error(`Failed to read file from path ${fail}`);
                    logger_1.logger.error(error);
                    return resolve();
                });
            }
            return fs_1.writeFile(file, JSON.stringify([objDetails])).then(resolve).catch((error) => {
                logger_1.logger.error(`Failed while writing ${JSON.stringify(objDetails)} at ${file}`);
                logger_1.logger.error(error);
                return resolve();
            });
        }
        catch (error) {
            return reject(error);
        }
    }));
};
