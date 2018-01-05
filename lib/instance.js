const OutputGenerator = require('./output-generator')
class Instance {
  constructor() {
    this.output = new OutputGenerator()
    this.units = []
  } 
  getOutput() {
    return this.output
  }
  getUnit(uuid) {
    return this.units.find(unit => unit.getUUID() === uuid)
  }
}
module.exports = Instance
