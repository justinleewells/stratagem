const Utils = require('./utils')
const Strategy = require('./strategy')

module.exports = class Value {
  constructor(args) {
    if (typeof(args) == 'object') {
      Object.assign(this, {
        type: args.type,
        static: args.static,
        path: args.path,
        strategy: args.strategy,
        values: Utils.mapClass(Value, args.values)
      })
    } else {
      Object.assign(this, {
        type: 'static',
        static: args
      })
    }
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
