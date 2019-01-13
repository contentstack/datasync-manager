"use strict";
/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("../fs");
const logger_1 = require("../logger");
exports.saveFilteredItems = (items, name, token, paths) => {
    return new Promise((resolve) => {
        const path = paths.filteredItems;
        const objDetails = {
            items,
            name,
            timestamp: new Date().toISOString(),
            token,
        };
        if (fs_1.existsSync(path)) {
            return fs_1.readFile(path).then((data) => {
                const loggedItems = JSON.parse(data);
                loggedItems.push(objDetails);
                return fs_1.writeFile(path, JSON.stringify(loggedItems)).then(resolve).catch((error) => {
                    logger_1.logger.error(`Failed to write ${JSON.stringify(loggedItems)} at ${path}`);
                    logger_1.logger.error(error);
                    return resolve();
                });
            }).catch((error) => {
                logger_1.logger.error(`Failed to read file from path ${path}`);
                logger_1.logger.error(error);
                return resolve();
            });
        }
        return fs_1.writeFile(path, JSON.stringify([objDetails])).then(resolve).catch((error) => {
            logger_1.logger.error(`Failed while writing ${JSON.stringify(objDetails)} at ${path}`);
            logger_1.logger.error(error);
            return resolve();
        });
    });
};
//# sourceMappingURL=filteredItems.js.map