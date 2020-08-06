const Utils = require('./utils')
const Strategy = require('./strategy')

const sym = Symbol('type')

module.exports = class Value {
  constructor(arg) {
    if (typeof(arg) == 'object') {
      if (arg.static) {
        this[sym] = 'static'
        this.static = arg.static
      }
      else if (arg.path) {
        this[sym] = 'path'
        this.path = arg.path
      }
      else if (arg.strategy) {
        this[sym] = 'strategy'
        this.strategy = {
          id: arg.strategy.id,
          arguments: Utils.mapClass(Value, arg.strategy.arguments)
        }
      }
      else if (arg.unit) {
        this[sym] = 'unit'
        this.unit = new Value(arg.unit)
      }
      else {
        this[sym] = 'object'
        Object.entries(arg).forEach(([k, v]) => this[k] = new Value(v))
      }
    } else {
      this[sym] = 'static'
      this.static = arg
    }
  }
  unbox(context) {
    switch (this[sym]) {
      case 'static':
        return this.static
      case 'path':
        return this.path.split('.').reduce((obj, p) => obj !== undefined ? obj[p] : undefined, context)
      case 'strategy':
        return Strategy.invoke(this.strategy.id, this.strategy.arguments.map(v => v.unbox(context)))
      case 'object':
        return Utils.assignFunction(v => v.unbox(context), this)
      case 'unit':
        return context.instance.getUnit(this.unit.unbox(context))
    }
  }
}
