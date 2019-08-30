const Event = require('./event')
const Condition = require('./condition')
const Utils = require('./utils')

module.exports = class Effect {
  constructor({type, attributes, conditions}) {
    Object.assign(this, {
      type,
      attributes,
      conditions: Utils.mapClass(Condition, conditions)
    })
  }
  isInvocable(context) {
    return this.conditions.every(c => c.evaluate(context))
  }
  invoke(context) {
    return new Event({
      type: this.type,
      source: context.properties.source,
      targets: context.properties.targets,
      attributes: this.attributes
    })
  }
}
