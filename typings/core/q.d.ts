/*!
* Contentstack Sync Manager
* Copyright (c) 2019 Contentstack LLC
* MIT Licensed
*/
/// <reference types="node" />
import { EventEmitter } from 'events';
declare const notifications: EventEmitter;
export declare class Q extends EventEmitter {
    private config;
    private iLock;
    private inProgress;
    private pluginInstances;
    private connectorInstance;
    private q;
    constructor(connector: any, config: any);
    push(data: any): void;
    errorHandler(obj: any): void;
    private next;
    peek(): any;
    private process;
    private exec;
}
export { notifications };
