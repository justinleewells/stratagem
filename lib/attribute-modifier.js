const Serializable = require('serializable-class')

class AttributeModifier extends Serializable {
  constructor(args = {}) {
    super()
    Object.assign(this, {
      id: args.id,
      type: args.type,
      value: args.value
    })
  }
}

Serializable.register(AttributeModifier)

module.exports = AttributeModifier
