const Serializable = require('serializable-class')

const Attribute = require('./attribute')

class ContinuousAttribute extends Attribute {
  constructor(args) {
    if (typeof(args) == 'object') {
      super(args)
      Object.assign(this, {
        min: args.min || 0, 
        max: args.max
      })
    } else {
      super({base: args, current: args})
      Object.assign(this, {
        min: 0,
        max: args
      })
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

Serializable.register(ContinuousAttribute)

module.exports = ContinuousAttribute
