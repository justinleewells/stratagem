const SerializableObject = require('serializable-object')

class AttributeModifier extends SerializableObject {
  constructor(args = {}) {
    super()
    this.id = args.id
    this.type = args.type
    this.value = args.value
  }
}

SerializableObject.register(AttributeModifier)

module.exports = AttributeModifier
