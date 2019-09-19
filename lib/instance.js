const OutputGenerator = require('./output-generator')

module.exports = class Instance {
  constructor(units) {
    Object.assign(this, {
      units: units || [],
      output: new OutputGenerator()
    })
  }
  addUnit(unit) {
    this.units.push(unit)
  }
  removeUnit(id) {
    let i = this.units.findIndex(u => u.id == id)
    if (i > -1) this.units.splice(i, 1)
  }
  getTeam(team) {
    return this.units.filter(u => u.team == team)
  }
}
