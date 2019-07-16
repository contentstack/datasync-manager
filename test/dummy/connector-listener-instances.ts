let consumer

// Build a dummy asset connector
export const assetConnector = {
  getAssetLocation: () => {
    return Promise.resolve('/assets/dummy/file.jpg')
  },
  getConfig: () => {
    return {}
  },
  // tslint:disable-next-line: object-literal-sort-keys
  delete: () => {
    return Promise.resolve()
  },
  download: () => {
    return Promise.resolve()
  },
  start: () => {
    return Promise.resolve(assetConnector)
  },
  unpublish: () => {
    return Promise.resolve()
  },
}

// Build a dummy content connector
export const contentConnector = {
  delete: () => {
    return Promise.resolve()
  },
  publish: () => {
    return Promise.resolve()
  },
  start: () => {
    return Promise.resolve(contentConnector)
  },
  unpublish: () => {
    return Promise.resolve()
  },
  updateContentType: () => {
    return Promise.resolve()
  }
}

let lConfig

// Dummy listener instance
export const listener = {
  register: (fn) => {
    if (typeof fn !== 'function') {
      throw new Error(`${fn} should be a function!`)
    }
    consumer = fn

    return
  },
  getConfig: () => {
    return lConfig
  },
  setConfig: (config) => {
    lConfig = config
  },
  start: () => {
    // simply fire events every 10 seconds
    setInterval(consumer, 10 * 1000)

    return Promise.resolve()
  },
}
