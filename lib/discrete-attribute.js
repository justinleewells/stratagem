const Serializable = require('serializable-class')

const Attribute = require('./attribute')

class DiscreteAttribute extends Attribute {
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
}

Serializable.register(DiscreteAttribute)

module.exports = DiscreteAttribute
