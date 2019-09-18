const DataDrivenObject = require('./data-driven-object')
const Result = require('./result')
const Utils = require('./utils')
const Value = require('./value')

const sym = Symbol('Action')

module.exports = class Action extends DataDrivenObject {
  constructor(id, state, data) {
    super(id, state)
    this[sym] = data
  }
  get selector() {
    return this[sym].selector
  }
  get initializers() {
    return this[sym].initializers
  }
  get results() {
    return this[sym].results
  }
  invoke(context, selection) {
    context = context.clone()
    Object.entries(this.initializers).forEach(([k, v]) => {
      context.properties[k] = v.transform(context)
    })
    return this.results.map((result) => {
      if (result.isInvocable(context)) return result.invoke(context, selection)
    })
      .filter(e => Array.isArray(e))
  }
  static format(data) {
    return {
      properties: data.properties,
      selector: data.selector,
      initializers: Object.freeze(Utils.assignClass(Value, data.initializers)),
      results: Object.freeze(Utils.mapClass(Result, data.results)),
    }
  }
}
