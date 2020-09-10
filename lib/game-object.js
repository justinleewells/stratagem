const Utils = require('./utils')
const SerializableObject = require('serializable-object')

let objects = {}

class GameObject extends SerializableObject {
  constructor(id, state) {
    super()
    this.id = id
    this.state = state || {}
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
  static get(id) {
    let cls = this.prototype.constructor.name
    let data = objects[cls] ? objects[cls][id] : false
    if (!data) throw new Error(`${cls}+${id} is undefined`)
    return data
  }
}

SerializableObject.register(GameObject)

module.exports = GameObject
