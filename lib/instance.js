const Serializable = require('serializable-class')

const OutputGenerator = require('./output-generator')

class Instance extends Serializable {
  constructor(units) {
    super()
    Object.assign(this, {
      units: units || [],
      output: new OutputGenerator()
    })
  }
  _preSerialize() {
    this.output = null
  }
  _postDeserialize(object) {
    this.output = new OutputGenerator()
  }
  addUnit(unit) {
    this.units.push(unit)
  }
  findUnit(id) {
    return this.units.find(u => u.id == id)
  }
  removeUnit(id) {
    let i = this.units.findIndex(u => u.id == id)
    if (i > -1) this.units.splice(i, 1)
  }
  getTeam(team) {
    return this.units.filter(u => u.team == team)
  }
}

Serializable.register(Instance)

module.exports = Instance
