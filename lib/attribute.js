const Utils = require('./utils')
const AttributeModifier = require('./attribute-modifier')

module.exports = class Attribute {
  constructor({base, current, modifiers}) {
    this.base = base
    this.current = current
    this.modifiers = Utils.mapClass(AttributeModifier, modifiers)
  }
  addModifier(id, type, value) {
    this.modifiers.push(new AttributeModifier({id, type, value}))
    this._recalculate()
  }
  removeModifier(id) {
    let index = this.modifiers.findIndex(m => m.id == id)
    if (index > -1) {
      this.modifiers.splice(index, 1)
      this._recalculate()
    } else {
      throw new Error(`Modifier ${id} does not exist`)
    }
  }
  removeAllModifiers() {
    this.modifiers = []
    this._recalculate()
  }
  updateModifier(id, value) {
    let index = this.modifiers.findIndex(m => m.id == id)
    if (index > -1) {
      this.modifiers[index].value = value
      this._recalculate()
    } else {
      throw new Error(`Modifier ${id} does not exist`)
    }
  }
  _calculateModifiedBase() {
    return this.modifiers.reduce((v, m) => {
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
  _recalculate() {}
}
