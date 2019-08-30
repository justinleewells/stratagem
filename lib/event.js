const DiscreteAttribute = require('./discrete-attribute')

module.exports = class Event {
  constructor({type, source, targets, parent, attributes}) {
    Object.assign(this, {
      type,
      source,
      targets,
      parent,
      attributes: {},
      children: [],
      canceled: false
    })
    if (attributes) {
      for (let key in attributes) {
        let value = attributes[key]
        this.attributes[key] = new DiscreteAttribute({base: value, current: value})
      }
    }
  }
  cancel() {
    this.canceled = true
  }
  addChild(child) {
    this.children.push(child)
  }
}