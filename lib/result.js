const Condition = require('./condition')
const Event = require('./event')
const Utils = require('./utils')
const Value = require('./value')

module.exports = class Result {
  constructor({conditions, type, properties, source}) {
    this.conditions = Utils.mapClass(Condition, conditions)
    this.type = type
    this.properties = Utils.assignClass(Value, properties)
    if (source) {
      this.source = source
      if (this.source.unit) this.source.unit = new Value(this.source.unit)
    }
  }
  isApplicable(context) {
    return this.conditions.every(c => c.evaluate(context))
  }
  create(context) {
    let source = context.source
    if (this.source) {
      source = Object.assign({}, this.source)
      if (source.unit instanceof Value) {
        source.unit = source.unit.unbox(context)
      }
    }
    return new Event({
      type: this.type,
      source: source,
      target: context.target,
      properties: Utils.assignFunction(p => p.unbox(context), this.properties)
    })
  }
}
