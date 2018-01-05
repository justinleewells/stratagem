const Action = require('./action')
class ActionWrapper {
  constructor(unit, ids) {
    this.unit = unit
    this.actions = ids.map(id => Action.create(id, {output: unit.getOutput()}))
    this.actions.forEach(action => {
      action.on('event', (ev) => {
        unit._emit(ev)
      })
    })
  }
  get(id) {
    return this.actions.find(action => action.getId() === id)
  }
  use(id, tar) {
    let action = this.get(id)
    if (action) action._execute(this.unit.getInstance(), this.unit, tar)
  }
}
module.exports = ActionWrapper
