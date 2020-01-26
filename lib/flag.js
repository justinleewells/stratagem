const Serializable = require('serializable-class')

class Flag extends Serializable {
  constructor(id) {
    super()
    Object.assign(this, {
      id: id
    })
  }
}

Serializable.register(Flag)

module.exports = Flag
