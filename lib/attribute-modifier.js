module.exports = class AttributeModifier {
  constructor({id, type, value}) {
    Object.assign(this, {id, type, value})
  }
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      value: this.value
    }
  }
}
