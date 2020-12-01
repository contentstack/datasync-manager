"use strict";
/*!
* Contentstack DataSync Manager
*   - This module overrides nodejs internal 'fs' module functionalities
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mkdir = exports.readFileSync = exports.readFile = exports.writeFile = exports.existsSync = void 0;
const Debug = require("debug");
const fs_1 = require("fs");
Object.defineProperty(exports, "existsSync", { enumerable: true, get: function () { return fs_1.existsSync; } });
const mkdirp_1 = __importDefault(require("mkdirp"));
const path_1 = require("path");
const write_file_atomic_1 = __importDefault(require("write-file-atomic"));
const debug = Debug('sm:util-fs');
/**
 * @description A wrapper around nodejs fs module's 'writeFile()'
 * @param {String} filePath - Path where the data is to be written
 * @param {Object} data - Data that's to be written
 * @returns {Promise} Returns a promise
 */
exports.writeFile = (filePath, data) => {
    debug(`Write file called on ${filePath}`);
    return new Promise((resolve, reject) => {
        try {
            const fileDirectory = path_1.dirname(filePath);
            if (!fs_1.existsSync(fileDirectory)) {
                mkdirp_1.default.sync(fileDirectory);
            }
            return write_file_atomic_1.default(filePath, (typeof data === 'object') ? JSON.stringify(data) : data, (wfError) => {
                if (wfError) {
                    return reject(wfError);
                }
                return resolve();
            });
        }
        catch (writeFileError) {
            return reject(writeFileError);
        }
    });
};
/**
 * @description A wrapper around nodejs fs module's 'readFile()'
 * @param {String} filePath - Path from where data is to be read
 * @returns {Promise} Returns a promise
 */
exports.readFile = (filePath) => {
    debug(`Read file called on ${filePath}`);
    return new Promise((resolve, reject) => {
        try {
            return fs_1.stat(filePath, (error, stats) => {
                if (error) {
                    return reject(error);
                }
                else if (stats.isFile) {
                    return fs_1.readFile(filePath, { encoding: 'utf-8' }, (rfError, data) => {
                        if (rfError) {
                            return reject(rfError);
                        }
                        return resolve(data);
                    });
                }
                const err = new Error(`Invalid 'read' operation on file. Expected ${filePath} to be of type 'file'!`);
                err.code = 'IOORF';
                return reject(err);
            });
        }
        catch (error) {
            return reject(error);
        }
    });
};
/**
 * @description A wrapper around nodejs fs module's 'readFileSync()'
 * @param filePath - Path from where data is to be read
 * @returns {String} Returns the data that's been read
 */
exports.readFileSync = (filePath) => {
    debug(`Read file sync called on ${filePath}`);
    if (fs_1.existsSync(filePath)) {
        return fs_1.readFileSync(filePath, { encoding: 'utf-8' });
    }
    const err = new Error(`Invalid 'read' operation on file. Expected ${filePath} to be of type 'file'!`);
    err.code = 'IOORFS';
    throw err;
};
/**
 * @description Safely creats a directory at the specified 'path'
 * @param filePath - Path from where directory is to be created
 * @returns {String} Returns a promise
 */
exports.mkdir = (path) => {
    debug(`mkdir called on ${path}`);
    return new Promise((resolve, reject) => {
        try {
            return mkdirp_1.default(path).then(() => {
                return resolve();
            });
        }
        catch (error) {
            return reject(error);
        }
    });
};
/**
 * @description exports fs.stat
 */
var fs_2 = require("fs");
Object.defineProperty(exports, "stat", { enumerable: true, get: function () { return fs_2.stat; } });
/**
 * @description synchnonous way of creating nested folder directory structure
 */
var mkdirp_2 = require("mkdirp");
Object.defineProperty(exports, "mkdirpSync", { enumerable: true, get: function () { return mkdirp_2.sync; } });
