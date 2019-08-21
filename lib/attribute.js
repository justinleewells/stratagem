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
  _recalculate() {}
}
