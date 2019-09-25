"use strict";
/*!
* Contentstack DataSync Manager
*   - This module overrides nodejs internal 'fs' module functionalities
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
exports.__esModule = true;
var Debug = require("debug");
var fs_1 = require("fs");
exports.existsSync = fs_1.existsSync;
var mkdirp_1 = require("mkdirp");
var path_1 = require("path");
var write_file_atomic_1 = require("write-file-atomic");
var debug = Debug('sm:util-fs');
/**
 * @description A wrapper around nodejs fs module's 'writeFile()'
 * @param {String} filePath - Path where the data is to be written
 * @param {Object} data - Data that's to be written
 * @returns {Promise} Returns a promise
 */
exports.writeFile = function (filePath, data) {
    debug("Write file called on " + filePath);
    return new Promise(function (resolve, reject) {
        try {
            var fileDirectory = path_1.dirname(filePath);
            if (!fs_1.existsSync(fileDirectory)) {
                mkdirp_1["default"].sync(fileDirectory);
            }
            return write_file_atomic_1["default"](filePath, (typeof data === 'object') ? JSON.stringify(data) : data, function (wfError) {
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
exports.readFile = function (filePath) {
    debug("Read file called on " + filePath);
    return new Promise(function (resolve, reject) {
        try {
            return fs_1.stat(filePath, function (error, stats) {
                if (error) {
                    return reject(error);
                }
                else if (stats.isFile) {
                    return fs_1.readFile(filePath, { encoding: 'utf-8' }, function (rfError, data) {
                        if (rfError) {
                            return reject(rfError);
                        }
                        return resolve(data);
                    });
                }
                var err = new Error("Invalid 'read' operation on file. Expected " + filePath + " to be of type 'file'!");
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
exports.readFileSync = function (filePath) {
    debug("Read file sync called on " + filePath);
    if (fs_1.existsSync(filePath)) {
        return fs_1.readFileSync(filePath, { encoding: 'utf-8' });
    }
    var err = new Error("Invalid 'read' operation on file. Expected " + filePath + " to be of type 'file'!");
    err.code = 'IOORFS';
    throw err;
};
/**
 * @description Safely creats a directory at the specified 'path'
 * @param filePath - Path from where directory is to be created
 * @returns {String} Returns a promise
 */
exports.mkdir = function (path) {
    debug("mkdir called on " + path);
    return new Promise(function (resolve, reject) {
        try {
            return mkdirp_1["default"](path, function (error) {
                if (error) {
                    return reject(error);
                }
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
exports.stat = fs_2.stat;
/**
 * @description synchnonous way of creating nested folder directory structure
 */
var mkdirp_2 = require("mkdirp");
exports.mkdirpSync = mkdirp_2.sync;
