const Action = require('./action')
const Condition = require('./condition')
const Utils = require('./utils')

const sym = Symbol('Modifier')

module.exports = class Modifier extends Action {
  constructor(id, state, data) {
    super(id, state, data)
    this[sym] = data
  }
  get priority() {
    return this[sym].priority
  }
  get conditions() {
    return this[sym].conditions
  }
  get key() {
    return this[sym].key
  }
  isInvocable(context) {
    return this.conditions.every(c => c.evaluate(context))
  }
  static format(data) {
    return Object.assign(super.format(data), {
      priority: 0 || data.priority,
      key: data.key,
      conditions: Object.freeze(Utils.mapClass(Condition, data.conditions))
    })
  }
}
