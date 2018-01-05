const StatusEffect = require('./status-effect')
class StatusEffectWrapper {
  constructor(unit) {
    this.unit = unit
    this.statusEffects = []
  }
  add(id, source) {
    let statusEffect = this.get(id)
    if (!statusEffect) {
      statusEffect = StatusEffect.create(id, {output: this.unit.getOutput()})
      statusEffect.on('event', (ev) => {
        this.unit._emit(ev)
      })
      statusEffect.on('remove', (ev) => {
        let i = this.statusEffects.indexOf(statusEffect)
        if (i !== -1) this.statusEffects.splice(i, 1)
      })
      statusEffect.on('add', (ev) => {
        this.statusEffects.push(statusEffect)
      })
      statusEffect._add(source, this.unit)
    } else {
      statusEffect._refresh(source, this.unit)
    }
  }
  remove(id, source) {
    let statusEffect = this.get(id)
    if (statusEffect) statusEffect._remove(source, this.unit)
  }
  get(id) {
    return this.statusEffects.find(statusEffect => statusEffect.getId() === id)
  }
  tick() {
    this.statusEffects.forEach(statusEffect => statusEffect._tick())  
  }
}
module.exports = StatusEffectWrapper
