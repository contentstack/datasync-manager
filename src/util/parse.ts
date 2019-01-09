/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

/**
 * @description Wrapper around JS's 'JSON.parse' to safely parse contents
 * @param {Any} data - Data that's to be parsed
 */
export const parse = (data) => {
  try {
    if (typeof data === 'object') {
      return data
    }

    return JSON.parse(data)
  } catch (error) {
    return data
  }
}
