const Condition = require('./condition')
const Effect = require('./effect')
const Event = require('./event')
const Utils = require('./utils')

module.exports = class Result {
  constructor({selection, conditions, effects}) {
    Object.assign(this, {
      selection,
      conditions: Utils.mapClass(Condition, conditions),
      effects: Utils.mapClass(Effect, effects)
    })
  }
  isInvocable(context) {
    return this.conditions.every(c => c.evaluate(context))
  }
  invoke(context, selection) {
    let targets = selection.entries[this.selection] || []
    return targets.flatMap((target) => {
      let current = context.clone()
      current.setProperty('targets', [target])
      return this.effects.flatMap((effect) => effect.isInvocable(current) ? effect.invoke(current) : null)
    })
      .filter(e => e instanceof Event)
  }
}
