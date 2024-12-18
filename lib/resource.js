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
  }
  subtract(value) {
    this.current -= value
    this._handleBounds()
  }
  fill() {
    this.current = this.max
  }
  empty() {
    this.current = 0
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
