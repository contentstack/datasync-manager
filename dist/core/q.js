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
const events_1 = require("events");
const failedItems_1 = require("../util/log/failedItems");
const parse_1 = require("../util/parse");
const stringify_1 = require("../util/stringify");
const plugins_1 = require("./plugins");
const token_management_1 = require("./token-management");
const debug = debug_1.default('sm:core-q');
let instance = null;
class Q extends events_1.EventEmitter {
    constructor(connector, config) {
        if (!instance && connector && config) {
            super();
            this.pluginInstances = plugins_1.load(config);
            this.connectorInstance = connector;
            this.inProgress = false;
            this.q = [];
            this.on('next', this.next);
            this.on('error', this.errorHandler);
            instance = this;
            debug('Core \'Q\' constructor initiated');
        }
        return instance;
    }
    push(data) {
        this.q.push(data);
        debug(`Content type '${data.content_type_uid}' received for '${data.action}'`);
        this.next();
    }
    errorHandler(obj) {
        debug(`Error handler called with ${stringify_1.stringify(obj)}`);
        if (obj.data.checkpoint) {
            return token_management_1.saveToken(obj.data.checkpoint.name, obj.data.checkpoint.token, 'checkpoint').then(() => {
                return failedItems_1.saveFailedItems(obj).then(this.next).catch((error) => {
                    debug(`Save failed items failed after saving token!\n${stringify_1.stringify(error)}`);
                    this.next();
                });
            }).catch((error) => {
                debug(`Save token failed!\n${stringify_1.stringify(error)}`);
                this.next();
            });
        }
        return failedItems_1.saveFailedItems(obj).then(this.next).catch((error) => {
            debug(`Save failed items failed!\n${stringify_1.stringify(error)}`);
            this.next();
        });
    }
    next() {
        debug(`Calling 'next'. In progress status is ${this.inProgress} and Q length is ${this.q.length}`);
        if (!this.inProgress && this.q.length) {
            this.inProgress = true;
            const item = this.q.shift();
            if (item.checkpoint) {
                token_management_1.saveToken(item.checkpoint.name, item.checkpoint.token, 'checkpoint').then(() => {
                    this.process(item);
                }).catch((error) => {
                    debug(`Save token failed to save a checkpoint!\n${stringify_1.stringify(error)}`);
                    this.process(item);
                });
            }
            this.process(item);
        }
    }
    process(data) {
        debug(`Process called on '${data.action}'`);
        switch (data.action) {
            case 'publish':
                this.exec(data, data.action, 'beforePublish', 'afterPublish');
                break;
            case 'unpublish':
                this.exec(data, data.action, 'beforeUnpublish', 'afterUnpublish');
                break;
            case 'delete':
                this.exec(data, data.action, 'beforeDelete', 'afterDelete');
                break;
            default:
                break;
        }
    }
    exec(data, action, beforeAction, afterAction) {
        try {
            debug(`Exec called. Action is ${action}`);
            const promisifiedBucket = [];
            const clonedData = parse_1.parse(stringify_1.stringify(data));
            this.pluginInstances[beforeAction].forEach((action1) => {
                promisifiedBucket.push(action1(data));
            });
            Promise.all(promisifiedBucket)
                .then(() => {
                debug('Before action plugins executed successfully!');
                return this.connectorInstance[action](clonedData);
            }).then(() => {
                debug('Connector instance called successfully!');
                const promisifiedBucket2 = [];
                this.pluginInstances[afterAction].forEach((action2) => {
                    promisifiedBucket2.push(action2(clonedData));
                });
                return Promise.all(promisifiedBucket2);
            }).then(() => {
                debug('After action plugins executed successfully!');
                this.inProgress = false;
                this.emit('next', data);
            }).catch((error) => {
                throw error;
            });
        }
        catch (error) {
            this.emit('error', {
                data,
                error,
            });
        }
    }
}
exports.Q = Q;
//# sourceMappingURL=q.js.map