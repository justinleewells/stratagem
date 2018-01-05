class StaticAttribute {
  constructor(value) {
    this.value = value
  }
  getValue() {
    return this.value
  }
  toJSON() {
    return {
      value: this.value
    }
  }
}
module.exports = StaticAttribute
