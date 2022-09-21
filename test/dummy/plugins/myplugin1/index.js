module.exports = function Myplugin1 () {

  Myplugin1.beforeSync = (action, data, schema) => {
    return new Promise((resolve) => {
      return setTimeout(() => {
        console.log('Before Sync in MYPLUGIN 1')
        return resolve()
      }, 100)
    })
  }

  Myplugin1.afterSync = (action, data, schema) => {
    return new Promise((resolve) => {
      return setTimeout(() => {
        console.log('After Sync in MYPLUGIN 1')
        return resolve()
      }, 100)
    })
  }
}
