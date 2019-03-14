let consumer

module.exports = {
  register: (fn) => {
    if (typeof fn !== 'function') {
      throw new Error(`${fn} should be a function!`)
    }
    consumer = fn
    console.log(`${fn} has been registered with the listener`)
    return
  },
  start: () => {
    console.log('Listener started')
    // simply fire events every 20 seconds
    setInterval(consumer, 10 * 1000)
    return Promise.resolve()
  }
}