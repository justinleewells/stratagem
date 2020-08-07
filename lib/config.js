const config = {
  triggerHandlerEventId: 'trigger-handler'
}

module.exports = class Config {
  static set(data) {
    Object.assign(config, data)
  }
  static get(key) {
    return config[key]
  }
}
