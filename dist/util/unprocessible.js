"use strict";
/*!
* Contentstack Sync Manager
* This module saves filtered/failed items
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
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("../");
const core_utilities_1 = require("./core-utilities");
const fs_1 = require("./fs");
const logger_1 = require("./logger");
const counter = {
    failed: 0,
    filtered: 0,
};
exports.saveFailedItems = (obj) => {
    return new Promise((resolve) => {
        return resolve(obj);
    });
};
exports.saveFilteredItems = (items, name, token) => {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        try {
            const config = __1.getConfig();
            if (!config.syncManager.saveFilteredItems) {
                return resolve();
            }
            const objDetails = {
                items,
                name,
                timestamp: new Date().toISOString(),
                token,
            };
            let filename;
            if (counter.filtered === 0) {
                filename = `${config.paths.filtered}.json`;
            }
            else {
                filename = `${config.paths.filtered}-${counter.filtered}.json`;
            }
            const file = yield core_utilities_1.getFile(filename, () => {
                counter.filtered++;
                return `${config.paths.filtered}-${counter.filtered}.json`;
            });
            if (fs_1.existsSync(file)) {
                return fs_1.readFile(file).then((data) => {
                    const loggedItems = JSON.parse(data);
                    loggedItems.push(objDetails);
                    return fs_1.writeFile(file, JSON.stringify(loggedItems)).then(resolve).catch((error) => {
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
