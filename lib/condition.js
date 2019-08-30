const Strategy = require('./strategy')
const Utils = require('./utils')
const Value = require('./value')

module.exports = class Condition {
  constructor({type, strategy, values, conditions}) {
    Object.assign(this, {
      type,
      strategy,
      values: Utils.mapClass(Value, values),
      conditions: Utils.mapClass(Condition, conditions)
    })
  }
  evaluate(context) {
    switch (this.type) {
      case 'true':
        return Strategy.invoke(this.strategy, context, this.values.map(v => v.transform(context)))
      case 'false':
        return !Strategy.invoke(this.strategy, context, this.values.map(v => v.transform(context)))
      case 'and':
        return this.conditions.every(c => c.evaluate(context))
      case 'or':
        return this.conditions.some(c => c.evaluate(context))
      case 'xor':
        return this.conditions.reduce((n, c) => c.evaluate(context) ? ++n : n, 0) == 1
    }
  }
}
