const DiscreteAttribute = require('./discrete-attribute')
const SerializableClass = require('serializable-class')

class Event extends SerializableClass {
  constructor({type, source, target, parent, attributes}) {
    super()
    Object.assign(this, {
      type,
      source,
      target,
      parent,
      attributes: {},
      children: [],
      origin: null,
      canceled: false
    })
    if (attributes) {
      for (let key in attributes) {
        let value = attributes[key]
        this.attributes[key] = new DiscreteAttribute({base: value, current: value})
      }
    }
  }
  _preSerialize() {
    this.parent = null
    if (this.source) this.source = this.source.id
    if (this.target) this.target = this.target.id
  }
  cancel() {
    this.canceled = true
  }
  setOrigin(obj) {
    this.origin = obj
  }
  addChild(child) {
    this.children.push(child)
  }
}

SerializableClass.register(Event)

module.exports = Event
