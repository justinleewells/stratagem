const Action = require('./action')
const Condition = require('./condition')
const Utils = require('./utils')

module.exports = class Modifier extends Action {
  constructor(args) {
    super(args)
    Object.assign(this, {
      priority: args.priority || 0,
      conditions: Utils.mapClass(Condition, args.conditions)
    })
  }
  isInvocable(context) {
    return this.conditions.every(c => c.evaluate(context))
  }
}
