const Predicate = require('./predicate')
const Utils = require('./utils')
const Value = require('./value')

module.exports = class Condition {
  constructor({type, predicate, conditions}) {
    this.type = type
    this.conditions = Utils.mapClass(Condition, conditions)
    if (predicate) {
      this.predicate = {
        id: predicate.id,
        arguments: Utils.mapClass(Value, predicate.arguments)
      }
    }
  }
  evaluate(context) {
    switch (this.type) {
      case 'true':
        return Predicate.invoke(this.predicate.id, this.predicate.arguments.map(v => v.unbox(context)))
      case 'false':
        return !Predicate.invoke(this.predicate.id, this.predicate.arguments.map(v => v.unbox(context)))
      case 'and':
        return this.conditions.every(c => c.evaluate(context))
      case 'or':
        return this.conditions.some(c => c.evaluate(context))
      case 'xor':
        return this.conditions.reduce((n, c) => c.evaluate(context) ? ++n : n, 0) == 1
    }
  }
}
