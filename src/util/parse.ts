/*!
* Contentstack Sync Manager
* Copyright © 2019 Contentstack LLC
* MIT Licensed
*/

export const parse = (data) => {
  try {
    return JSON.parse(data)
  } catch (error) {
    // data could not be parsed
    // corrupted data?
    return data
  }
}
