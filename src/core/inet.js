"use strict";
/*!
 * Contentstack DataSync Manager
 * Copyright (c) 2019 Contentstack LLC
 * MIT Licensed
 */
exports.__esModule = true;
var debug_1 = require("debug");
var dns_socket_1 = require("dns-socket");
var events_1 = require("events");
var index_1 = require("../index");
var logger_1 = require("../util/logger");
var index_2 = require("./index");
var emitter = new events_1.EventEmitter();
var debug = debug_1["default"]('inet');
var disconnected = false;
var sm;
var query;
var port;
var dns;
var currentTimeout;
exports.init = function () {
    sm = index_1.getConfig().syncManager;
    query = {
        questions: [
            {
                name: sm.inet.host,
                type: sm.inet.type
            },
        ]
    };
    port = sm.inet.port;
    dns = sm.inet.dns;
    currentTimeout = sm.inet.retryTimeout;
    debug("inet initiated - waiting " + currentTimeout + " before checking connectivity.");
    // start checking for net connectivity, 30 seconds after the app has started
    setTimeout(exports.checkNetConnectivity, currentTimeout);
};
exports.checkNetConnectivity = function () {
    var socket = dns_socket_1["default"]({
        retries: sm.inet.retries,
        timeout: sm.inet.timeout
    });
    debug('checking network connectivity');
    socket.query(query, port, dns, function (err) {
        if (err) {
            debug("errorred.. " + err);
            disconnected = true;
            return socket.destroy(function () {
                debug('socket destroyed');
                emitter.emit('disconnected', currentTimeout += sm.inet.retryIncrement);
            });
        }
        else if (disconnected) {
            index_2.poke();
        }
        disconnected = false;
        return socket.destroy(function () {
            debug('socket destroyed');
            emitter.emit('ok');
        });
    });
};
exports.netConnectivityIssues = function (error) {
    if (error.code === 'ENOTFOUND') {
        return true;
    }
    else if (error.code === 'ETIMEDOUT') {
        return true;
    }
    return false;
};
emitter.on('ok', function () {
    currentTimeout = sm.inet.retryTimeout;
    debug("pinging " + sm.inet.host + " in " + sm.inet.timeout + " ms");
    setTimeout(exports.checkNetConnectivity, sm.inet.timeout);
});
emitter.on('disconnected', function (timeout) {
    logger_1.logger.warn('Network disconnected');
    debug("pinging " + sm.inet.host + " in " + timeout + " ms");
    setTimeout(exports.checkNetConnectivity, timeout);
});
