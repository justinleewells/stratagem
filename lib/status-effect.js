const Condition = require('./condition')
const DiscreteAttribute = require('./discrete-attribute')
const Result = require('./result')
const Utils = require('./utils')
const Value = require('./value')

module.exports = class StatusEffect {
  constructor({id, initializers, attributes, events = {}}) {
    Object.assign(this, {
      id,
      events: {},
      initializers: Utils.assignClass(Value, initializers),
      attributes: Utils.assignClass(DiscreteAttribute, attributes)
    })
    Object.entries(events).forEach(([k, v]) => {
      this.events[k] = {
        selector: v.selector,
        initializers: Utils.assignClass(Value, v.initializers),
        conditions: Utils.mapClass(Condition, v.conditions),
        results: Utils.mapClass(Result, v.results)
      }
    })
  }
  isInvocable(type, context) {
    return this.events[type] ? this.events[type].conditions.every(c => c.evaluate(context)) : false
  }
  invoke(type, context, selection) {
    let event = this.events[type]
    context = context.clone()
    Object.entries(event.initializers).forEach(([k, v]) => {
      context.properties[k] = v.transform(context)
    })
    return event.results.map((result) => {
      if (result.isInvocable(context)) return result.invoke(context, selection)
    })
      .filter(e => Array.isArray(e))
  }
}
