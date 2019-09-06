const Condition = require('./condition')
const Effect = require('./effect')
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
    return targets.map((target) => {
      let current = context.clone()
      current.setProperty('targets', [target])
      return this.effects.reduce((arr, e) => {
        if (e.isInvocable(current)) {
          arr.push(e.invoke(current))
        }
        return arr
      }, [])
    })
      .filter(element => element.length > 0)
  }
}
