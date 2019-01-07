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
const request_1 = __importDefault(require("request"));
const stringify_1 = require("./util/stringify");
const debug = debug_1.default('api:get-requests');
let MAX_RETRY_LIMIT = 5;
let Contentstack;
exports.init = (contentstack) => {
    Contentstack = contentstack;
    Contentstack.headers = {
        'X-User-Agent': 'contentstack-sync-manager',
        'access_token': Contentstack.token,
        'api_key': Contentstack.apiKey,
    };
    if (Contentstack.MAX_RETRY_LIMIT) {
        MAX_RETRY_LIMIT = Contentstack.MAX_RETRY_LIMIT;
    }
    Contentstack.syncAPI = `${Contentstack.cdn}${Contentstack.restAPIS.sync}`;
};
const validate = (req) => {
    if (typeof req !== 'object') {
        const error = new Error(`Invalid params passed for request\n${stringify_1.stringify(req)}`);
        error.code = 'VE';
        throw error;
    }
};
const normalize = (req) => {
    if (typeof req.uri === 'undefined' && typeof req.url === 'undefined') {
        req.uri = Contentstack.syncAPI;
    }
    if (typeof req.headers === 'undefined') {
        debug(`${req.uri || req.url} had no headers`);
        req.headers = Contentstack.headers;
    }
};
exports.get = (req, RETRY = 1) => {
    return new Promise((resolve, reject) => {
        if (RETRY > MAX_RETRY_LIMIT) {
            return reject(new Error('Max retry limit exceeded!'));
        }
        req.method = Contentstack.methods.get;
        req.json = true;
        validate(req);
        normalize(req);
        try {
            debug(`${req.method.toUpperCase()}: ${req.uri || req.url}`);
            let timeDelay;
            return request_1.default(req, (error, response, body) => {
                if (error) {
                    console.error(error);
                    return reject(error);
                }
                debug(`API response received. \nStatus code: ${response.statusCode}.`);
                if (response.statusCode >= 200 && response.statusCode <= 399) {
                    return resolve(body);
                }
                else if (response.statusCode === 429) {
                    timeDelay = Math.pow(Math.SQRT2, RETRY) * 200;
                    debug(`API rate limit exceeded. Retrying ${req.uri || req.url} with ${timeDelay} sec delay`);
                    return setTimeout(() => {
                        return exports.get(req, RETRY).then(resolve).catch(reject);
                    }, timeDelay);
                }
                else if (response.statusCode >= 500) {
                    timeDelay = Math.pow(Math.SQRT2, RETRY) * 200;
                    debug(`Retrying ${req.uri || req.url} with ${timeDelay} sec delay`);
                    RETRY++;
                    return setTimeout(() => {
                        return exports.get(req, RETRY).then(resolve).catch(reject);
                    }, timeDelay);
                }
                else {
                    debug(`Request failed\n${stringify_1.stringify(req)}`);
                    debug(`Response received\n${stringify_1.stringify(body)}`);
                    return reject(body);
                }
            });
        }
        catch (error) {
            return reject(error);
        }
    });
};
//# sourceMappingURL=api.js.map