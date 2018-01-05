const State = require('./state')
class StateWrapper {
  constructor(unit) {
    this.unit = unit
    this.states = {}
  }
  add(key, id) {
    let state = State.create(id, {output: this.unit.getOutput()})
    if (this.states[key] === undefined) this.states[key] = []
    this.states[key].push(state)
    state.on('event', (ev) => {
      this.unit._emit(ev)
    })
  }
  remove(key, id) {
    let i = this.states[key].findIndex(state => state.getId() === id)
    if (i !== -1) this.states[key].splice(i, 1)
  }
  execute(key, params) {
    if (this.states[key]) {
      this.states[key].forEach(state => {
        if (!this.unit.getOutput().isCanceled() && state.canExecute(params)) state._execute(params)
      })
    }
  }
}
module.exports = StateWrapper
