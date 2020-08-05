const SerializableObject = require('serializable-object')

const Executor = require('./executor')
const Handler = require('./handler')
const Output = require('./output')

class Instance extends SerializableObject {
  constructor() {
    super()
    this.output = new Output()
    this.unitMap = {}
  }
  _preSerialize() {
    delete this.output
  }
  addUnit(unit) {
    this.unitMap[unit.id] = unit
  }
  removeUnit(id) {
    delete this.unitMap[id]
  }
  getUnit(id) {
    return this.unitMap[id]
  }
  getAlliedUnits(id) {
    let team = this.unitMap[id].team
    return Object.values(this.unitMap).filter(unit => unit.team == team).map(unit => unit.id)
  }
  getEnemyUnits(id) {
    let team = this.unitMap[id].team
    return Object.values(this.unitMap).filter(unit => unit.team != team).map(unit => unit.id)
  }
  getAlliedUnitsByTeam(team) {
    return Object.values(this.unitMap).filter(unit => unit.team == team).map(unit => unit.id)
  }
  getEnemyUnitsByTeam(team) {
    return Object.values(this.unitMap).filter(unit => unit.team != team).map(unit => unit.id)
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
    if (Executor.isTransient(event.type)) {
      let parent = event.parent
      if (parent) {
        event.children.forEach(child => parent.addChild(child))
        parent.children.splice(parent.children.indexOf(event), 1)
      }
    }
    this.output.stop()
  }
}

SerializableObject.register(Instance)

module.exports = Instance
