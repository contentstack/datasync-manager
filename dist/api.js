"use strict";
/*!
* Contentstack DataSync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const https_1 = require("https");
const path_1 = require("path");
const querystring_1 = require("querystring");
const fs_1 = require("./util/fs");
const debug = debug_1.default('api');
let MAX_RETRY_LIMIT;
let Contentstack;
/**
 * @description Initialize sync utilities API requests
 * @param {Object} contentstack - Contentstack configuration details
 */
exports.init = (contentstack) => {
    const packageInfo = JSON.parse(fs_1.readFileSync(path_1.join(__dirname, '..', 'package.json')));
    Contentstack = contentstack;
    Contentstack.headers = {
        'X-User-Agent': `datasync-manager/v${packageInfo.version}`,
        'access_token': Contentstack.deliveryToken,
        'api_key': Contentstack.apiKey,
    };
    if (Contentstack.MAX_RETRY_LIMIT) {
        MAX_RETRY_LIMIT = Contentstack.MAX_RETRY_LIMIT;
    }
};
/**
 * @description Make API requests to Contentstack
 * @param {Object} req - API request object
 * @param {Number} RETRY - API request retry counter
 */
let count = 0;
exports.get = (req, RETRY = 1) => {
    return new Promise((resolve, reject) => {
        if (RETRY > MAX_RETRY_LIMIT) {
            return reject(new Error('Max retry limit exceeded!'));
        }
        req.method = Contentstack.verbs.get;
        if (req.path) {
            console.log(req.path, ++count);
        }
        req.path = req.path || Contentstack.apis.sync;
        if (req.qs) {
            req.path += `?${querystring_1.stringify(req.qs)}`;
        }
        const options = {
            headers: Contentstack.headers,
            hostname: Contentstack.host,
            method: Contentstack.verbs.get,
            path: req.path,
            port: Contentstack.port,
            protocol: Contentstack.protocol,
        };
        try {
            debug(`${options.method.toUpperCase()}: ${options.path}`);
            let timeDelay;
            let body = '';
            https_1.request(options, (response) => {
                response
                    .setEncoding('utf-8')
                    .on('data', (chunk) => body += chunk)
                    .on('end', () => {
                    debug(`status: ${response.statusCode}.`);
                    if (response.statusCode >= 200 && response.statusCode <= 399) {
                        return resolve(JSON.parse(body));
                    }
                    else if (response.statusCode === 429) {
                        timeDelay = Math.pow(Math.SQRT2, RETRY) * 200;
                        debug(`API rate limit exceeded. Retrying ${options.path} with ${timeDelay} sec delay`);
                        return setTimeout(() => {
                            return exports.get(req, RETRY)
                                .then(resolve)
                                .catch(reject);
                        }, timeDelay);
                    }
                    else if (response.statusCode >= 500) {
                        // retry, with delay
                        timeDelay = Math.pow(Math.SQRT2, RETRY) * 200;
                        debug(`Retrying ${options.path} with ${timeDelay} sec delay`);
                        RETRY++;
                        return setTimeout(() => {
                            return exports.get(req, RETRY)
                                .then(resolve)
                                .catch(reject);
                        }, timeDelay);
                    }
                    else {
                        debug(`Request failed\n${JSON.stringify(options)}`);
                        return reject(body);
                    }
                });
            })
                .on('error', reject)
                .end();
        }
        catch (error) {
            return reject(error);
        }
    });
};
