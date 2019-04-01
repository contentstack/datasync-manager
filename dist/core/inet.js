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
const dns_socket_1 = __importDefault(require("dns-socket"));
const events_1 = require("events");
const index_1 = require("../index");
const index_2 = require("./index");
const emitter = new events_1.EventEmitter();
const sm = index_1.getConfig().syncManager;
const socket = dns_socket_1.default({
    retries: sm.inet.retries,
    timeout: sm.inet.timeout
});
const query = {
    questions: [
        {
            type: sm.inet.type,
            name: sm.inet.host
        }
    ]
};
const port = sm.inet.port;
const dns = sm.inet.dns;
let iLock = false;
let currentTimeout = sm.inet.retryTimeout;
exports.checkNetConnectivity = () => {
    socket.query(query, port, dns, (err) => {
        if (err) {
            index_2.lock();
            iLock = true;
            emitter.emit('disconnected', currentTimeout += sm.inet.retryIncrement);
        }
        else if (iLock) {
            emitter.emit('ok');
            index_2.unlock(true);
        }
        socket.destroy();
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
    setTimeout(exports.checkNetConnectivity, sm.inet.timeout);
});
emitter.on('disconnected', (timeout) => {
    setTimeout(exports.checkNetConnectivity, timeout);
});
