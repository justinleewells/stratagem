const Attribute = require('./attribute')

module.exports = class DiscreteAttribute extends Attribute {
  constructor({base, current, modifiers}) {
    super({base, current, modifiers})
  }
  _recalculate() {
    this.current = this._calculateModifiedBase()
  }
  toJSON() {
    return {
      type: 'discrete',
      base: this.base,
      current: this.current,
      modifiers: this.modifiers
    }
  }
}
