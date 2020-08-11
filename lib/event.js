const SerializableObject = require('serializable-object')

const DiscreteAttribute = require('./discrete-attribute')
const Utils = require('./utils')

class Event extends SerializableObject {
  constructor({type, source, target, properties}) {
    super()
    this.type = type
    this.source = source
    this.target = target
    this.parent = null
    this.children = []
    this.canceled = false
    this.properties = Object.assign({}, properties)
  }
  _preSerialize() {
    delete this.parent
    if (this.source === undefined) delete this.source
    if (this.target === undefined) delete this.target
  }
  cancel() {
    this.canceled = true
  }
  addChild(child) {
    child.parent = this
    this.children.push(child)
  }
}

SerializableObject.register(Event)

module.exports = Event
