/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
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
