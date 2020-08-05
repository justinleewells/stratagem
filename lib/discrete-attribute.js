const SerializableObject = require('serializable-object')

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

SerializableObject.register(DiscreteAttribute)

module.exports = DiscreteAttribute
