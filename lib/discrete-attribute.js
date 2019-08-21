const Attribute = require('./attribute')

module.exports = class DiscreteAttribute extends Attribute {
  constructor({base, current, modifiers}) {
    super({base, current, modifiers})
  }
  _recalculate() {
    this.current = this.modifiers.reduce((v, m) => {
      switch(m.type) {
        case 'add':
          return v += m.value
        case 'subtract':
          return v -= m.value
        case 'multiply':
          return v *= m.value
        case 'divide':
          return v /= m.value
        case 'set':
          return m.value
        default:
          return v
      }
    }, this.base)
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
