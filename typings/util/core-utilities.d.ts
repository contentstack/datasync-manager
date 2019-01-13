/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
export declare const filterItems: (response: any, config: any) => Promise<{}>;
export declare const groupItems: (items: any) => {};
export declare const formatItems: (items: any, config: any) => void;
export declare const markCheckpoint: (groupedItems: any, syncResponse: any) => void;
