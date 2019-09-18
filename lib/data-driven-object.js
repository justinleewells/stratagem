let objects = {}

module.exports = class DataDrivenObject {
  constructor(id, state) {
    Object.assign(this, {id, state})
  }
  static define(id, data) {
    let cls = this.prototype.constructor.name
    if (!objects[cls]) objects[cls] = {}
    if (objects[cls][id]) throw new Error(`${cls}+${id} is already defined`)
    objects[cls][id] = this.format(data)
  }
  static create(id, state) {
    let cls = this.prototype.constructor.name
    let data = objects[cls] ? objects[cls][id] : false
    if (!data) throw new Error(`${cls}+${id} is undefined`)
    return new this.prototype.constructor(id, state, data)
  }
  // Exposed for testing
  static _objects() {
    return objects
  }
  static _empty() {
    objects = {}
  }
}
