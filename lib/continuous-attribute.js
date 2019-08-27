const Attribute = require('./attribute')

module.exports = class ContinuousAttribute extends Attribute {
  constructor({base, current, modifiers, min, max}) {
    super({base, current, modifiers})
    Object.assign(this, {min, max})
  }
  add(value) {
    this.current += value
    this._handleBounds()
  }
  subtract(value) {
    this.current -= value
    this._handleBounds()
  }
  _handleBounds() {
    if (this.current < this.min) this.current = this.min
    else if (this.current > this.max) this.current = this.max
  }
  _recalculate() {
    this.max = this._calculateModifiedBase()
    this._handleBounds()
  }
  toJSON() {
    return {
      type: 'continuous',
      base: this.base,
      current: this.current,
      min: this.min,
      max: this.max,
      modifiers: this.modifiers
    }
  }
}
