const Condition = require('./condition')
const DataDrivenObject = require('./data-driven-object')
const Event = require('./event')
const Result = require('./result')
const Utils = require('./utils')
const Value = require('./value')

const sym = Symbol('StatusEffect')

module.exports = class StatusEffect extends DataDrivenObject {
  constructor(id, state, data) {
    super(id, state)
    this[sym] = data
  }
  get events() {
    return this[sym].events
  }
  isInvocable(type, context) {
    return this.events[type] ? this.events[type].conditions.every(c => c.evaluate(context)) : false
  }
  invoke(type, context, selection) {
    let event = this.events[type]
    context = context.clone()
    context.setProperty('statusEffect', this)
    Object.entries(event.initializers).forEach(([k, v]) => {
      context.properties[k] = v.transform(context)
    })
    return event.results.flatMap((result) => {
      if (result.isInvocable(context)) return result.invoke(context, selection)
    })
      .filter(e => e instanceof Event)
  }
  static format(data) {
    return {
      events: Utils.assignFunction((event) => {
        return Object.freeze({
          properties: Object.freeze(event.properties),
          selector: event.selector,
          initializers: Utils.assignClass(Value, event.initializers),
          conditions: Utils.mapClass(Condition, event.conditions),
          results: Utils.mapClass(Result, event.results)
        })
      }, data.events)
    }
  }
}
