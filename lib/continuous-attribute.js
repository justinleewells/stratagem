const SerializableObject = require('serializable-object')

const Attribute = require('./attribute')

class ContinuousAttribute extends Attribute {
  constructor(args) {
    if (typeof(args) == 'object') {
      super(args)
      this.min = args.min || 0
      this.max = args.max
    } else {
      super({base: args, current: args})
      this.min = 0
      this.max = args
    }
  }
  add(value) {
    this.current += value
    this._handleBounds()
  }
  subtract(value) {
    this.current -= value
    this._handleBounds()
  }
  difference() {
    return this.max - this.current
  }
  percentage() {
    return this.current / this.max
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
      base: this.base,
      current: this.current,
      min: this.min,
      max: this.max,
      modifiers: this.modifiers.map(m => m.toJSON())
    }
  }
}

SerializableObject.register(ContinuousAttribute)

module.exports = ContinuousAttribute
