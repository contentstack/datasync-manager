/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
/// <reference types="node" />
import { EventEmitter } from 'events';
export declare class Q extends EventEmitter {
    private inProgress;
    private pluginInstances;
    private connectorInstance;
    private q;
    constructor(connector: any, config: any);
    push(data: any): void;
    errorHandler(obj: any): void;
    private next;
    private process;
    private exec;
}
//# sourceMappingURL=q.d.ts.map