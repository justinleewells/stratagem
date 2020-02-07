const Event = require('./event')
const Condition = require('./condition')
const Utils = require('./utils')
const Value = require('./value')

module.exports = class Effect {
  constructor({type, attributes, conditions}) {
    Object.assign(this, {
      type,
      attributes: Utils.assignClass(Value, attributes),
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
      target: context.properties.target,
      attributes: Utils.assignFunction((v) => v.transform(context), this.attributes)
    })
  }
}
