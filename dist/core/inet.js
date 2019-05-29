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
const dns_socket_1 = __importDefault(require("dns-socket"));
const events_1 = require("events");
const index_1 = require("../index");
const index_2 = require("./index");
const logger_1 = require("../util/logger");
const emitter = new events_1.EventEmitter();
const debug = debug_1.default('inet');
let disconnected = false;
let sm, query, port, dns, currentTimeout;
exports.init = () => {
    sm = index_1.getConfig().syncManager;
    query = {
        questions: [
            {
                type: sm.inet.type,
                name: sm.inet.host
            }
        ]
    };
    port = sm.inet.port;
    dns = sm.inet.dns;
    currentTimeout = sm.inet.retryTimeout;
    debug(`inet initiated - waiting ${currentTimeout} before checking connectivity.`);
    // start checking for net connectivity, 30 seconds after the app has started
    setTimeout(exports.checkNetConnectivity, currentTimeout);
};
exports.checkNetConnectivity = () => {
    const socket = dns_socket_1.default({
        retries: sm.inet.retries,
        timeout: sm.inet.timeout
    });
    debug('checking network connectivity');
    socket.query(query, port, dns, (err) => {
        if (err) {
            debug(`errorred.. ${err}`);
            disconnected = true;
            return socket.destroy(() => {
                debug('socket destroyed');
                emitter.emit('disconnected', currentTimeout += sm.inet.retryIncrement);
            });
        }
        else if (disconnected) {
            index_2.poke();
        }
        disconnected = false;
        return socket.destroy(() => {
            debug('socket destroyed');
            emitter.emit('ok');
        });
    });
};
exports.netConnectivityIssues = (error) => {
    if (error.code === 'ENOTFOUND') {
        return true;
    }
    else if (error.code === 'ETIMEDOUT') {
        return true;
    }
    return false;
};
emitter.on('ok', () => {
    currentTimeout = sm.inet.retryTimeout;
    debug(`pinging ${sm.inet.host} in ${sm.inet.timeout} ms`);
    setTimeout(exports.checkNetConnectivity, sm.inet.timeout);
});
emitter.on('disconnected', (timeout) => {
    logger_1.logger.warn('Network disconnected');
    debug(`pinging ${sm.inet.host} in ${timeout} ms`);
    setTimeout(exports.checkNetConnectivity, timeout);
});
