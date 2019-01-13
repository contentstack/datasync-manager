/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

/**
 * Decision pending
 * This method logs all failed items.
 * Failed items should be 'retried' when app is started Or after a specific interval
 * @param {Object} obj : Contains 'error' and 'data' key
 */
export const saveFailedItems = (obj) => {
  return new Promise((resolve) => {
    // const path = getConfig().paths.failedItems

    return resolve(obj)
  })
}
