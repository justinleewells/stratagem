const Utils = require('./utils')
const Strategy = require('./strategy')

module.exports = class Value {
  constructor(args) {
    Object.assign(this, {
      type: args.type,
      static: args.static,
      path: args.path,
      strategy: args.strategy,
      values: Utils.mapClass(Value, args.values)
    })
  }
  transform(context) {
    switch (this.type) {
      case 'static':
        return this.static
      case 'path':
        return this.path.split('.').reduce((obj, p) => obj !== undefined ? obj[p] : undefined, context)
      case 'strategy':
        return Strategy.invoke(this.strategy, context, this.values.map(v => v.transform(context)))
      default:
        return null
    }
  }
}
