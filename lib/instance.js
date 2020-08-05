const SerializableObject = require('serializable-object')

const Executor = require('./executor')
const Handler = require('./handler')
const Output = require('./output')

class Instance extends SerializableObject {
  constructor() {
    super()
    this.output = new Output()
    this.units = []
    this.unitMap = {}
    this.turns = 0
  }
  _preSerialize() {
    delete this.output
    delete this.unitMap
  }
  _postDeserialize() {
    this.unitMap = {}
    this.units.forEach(unit => this.unitMap[unit.id] = unit)
  }
  addUnit(unit) {
    this.units.push(unit)
    this.unitMap[unit.id] = unit
  }
  removeUnit(id) {
    let i = this.units.findIndex(unit => this.units[unit.id] == id)
    if (i >= 0) this.units.splice(i, 1)
    delete this.unitMap[id]
  }
  getUnit(id) {
    return this.unitMap[id]
  }
  getFriendlyUnits(id) {
    let team = this.unitMap[id].team
    return this.units.filter(unit => unit.team == team).map(unit => unit.id)
  }
  getEnemyUnits(id) {
    let team = this.unitMap[id].team
    return this.units.filter(unit => unit.team != team).map(unit => unit.id)
  }
  getFriendlyUnitsByTeam(team) {
    return this.units.filter(unit => unit.team == team).map(unit => unit.id)
  }
  getEnemyUnitsByTeam(team) {
    return this.units.filter(unit => unit.team != team).map(unit => unit.id)
  }
  execute(event) {
    let context = {
      instance: this,
      event: event
    }
    this.output.start(event)
    Handler.invokeAll(`pre-${event.type}`, context)
    if (!event.canceled) Executor.invoke(event.type, [context])
    Handler.invokeAll(`post-${event.type}`, context)
    this.output.stop()
  }
}

SerializableObject.register(Instance)

module.exports = Instance
