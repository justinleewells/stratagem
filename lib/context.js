module.exports = class Context {
  constructor({instance, properties}) {
    Object.assign(this, {
      instance,
      properties: properties || {}
    })
  }
  setProperty(key, value) {
    this.properties[key] = value
  }
  getProperty(key, value) {
    return this.properties[key]
  }
  deleteProperty(key) {
    delete this.properties[key]
  }
  clone() {
    return new Context({
      instance: this.instance,
      properties: Object.assign({}, this.properties)
    })
  }
}
