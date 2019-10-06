const Attribute = require('./attribute')

module.exports = class DiscreteAttribute extends Attribute {
  constructor(args) {
    if (typeof(args) == 'object') {
      super(args)
    } else {
      super({base: args, current: args})
    }
  }
  _recalculate() {
    this.current = this._calculateModifiedBase()
  }
  toJSON() {
    return {
      base: this.base,
      current: this.current,
      modifiers: this.modifiers.map(m => m.toJSON())
    }
  }
}
