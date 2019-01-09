/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

/**
 * @description Wrapper around JS's 'JSON.stringify' to safely stringify contents
 * @param {Any} data - Data that's to be stringified
 */
export const stringify = (input) => {
  if (typeof input === 'object') {
    if (input.message) {
      return input.message
    }

    return JSON.stringify(input)
  }

  return input.toString()
}
