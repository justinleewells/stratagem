import Attribute from './attribute.js'

export default class Resource extends Attribute {
  constructor(base) {
    super(base)
    this.current = base
  }
  get max() {
    return this.value
  }
  add(value) {
    this.current += value
    this._handleBounds()
    return this
  }
  subtract(value) {
    this.current -= value
    this._handleBounds()
    return this
  }
  fill() {
    this.current = this.max
    return this
  }
  empty() {
    this.current = 0
    return this
  }
  _calculate() {
    super._calculate()
    this._handleBounds()
  }
  _handleBounds() {
    if (this.current > this.max) {
      this.current = this.max
    } else if (this.current < 0) {
      this.current = 0
    }
  }
}
