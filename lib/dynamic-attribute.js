const OutputEmitter = require('./output-emitter')
class DynamicAttribute extends OutputEmitter {
  constructor(unit, base) {
    super(unit.getOutput())
    this.base = base
    this.value = base
  }
  getValue() {
    return this.value
  }
  setValue(val) {
    this.value = val
    this.addOutput({type: 'set-value', value: this.value})
  }
  toJSON() {
    return {
      base: this.base,
      value: this.value,
    }
  }
}
module.exports = DynamicAttribute
