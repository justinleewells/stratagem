const Utils = require('./utils')
const Strategy = require('./strategy')

module.exports = class Value {
  constructor(args) {
    if (typeof(args) == 'object') {
      Object.assign(this, {
        static: args.static,
        path: args.path,
        strategy: args.strategy,
        values: Utils.mapClass(Value, args.values)
      })
    } else {
      Object.assign(this, {
        static: args
      })
    }
  }
  transform(context) {
    if (this.static !== undefined) {
      return this.static
    } else if (this.path !== undefined) {
      return this.path.split('.').reduce((obj, p) => obj !== undefined ? obj[p] : undefined, context)
    } else if (this.strategy !== undefined) {
      return Strategy.invoke(this.strategy, context, this.values.map(v => v.transform(context)))
    } else {
      return null
    }
  }
}
