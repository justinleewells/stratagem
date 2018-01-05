const OutputEmitter = require('./output-emitter')
class RangeAttribute extends OutputEmitter {
  constructor(unit, base) {
    super(unit.getOutput())
    this.base = base
    this.value = base
    this.max = base
  }
  getValue() {
    return this.value
  }
  setValue(val) {
    this.value = val
    if (this.value > this.max) this.value = this.max
    else if (this.value < 0) this.value = 0
    this.addOutput({type: 'set-value', value: this.value})
  }
  getMax() {
    return this.max
  }
  setMax(val) {
    let d = val - this.max
    this.max = val
    this.addOutput({type: 'set-max', value: this.max})
    if (d > 0) this.setValue(this.getValue() + d)
  }
  toJSON() {
    return {
      base: this.base,
      value: this.value,
      max: this.max,
    }
  }
}
module.exports = RangeAttribute
