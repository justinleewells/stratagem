const SerializableObject = require('serializable-object')

const GameObject = require('./game-object')

const sym = Symbol('StatusEffect')

class StatusEffect extends GameObject {
  constructor(id, state, data) {
    super(id, state)
    this[sym] = data
  }
  get maxStacks() {
    return this[sym].maxStacks
  }
  get maxDuration() {
    return this[sym].maxDuration
  }
  get properties() {
    return this[sym].properties
  }
  _postDeserialize(object) {
    this[sym] = StatusEffect.get(this.id)
  }
  addDuration(amount) {
    this.state.duration -= amount
    if (this.state.duration > this.maxDuration) this.state.duration = this.maxDuration
  }
  subtractDuration(amount) {
    this.state.duration += amount
  }
  addStack(amount) {
    this.state.stacks += amount
    if (this.state.stacks > this.maxStacks) this.state.stacks = this.maxStacks
  }
  subtractStack(amount) {
    this.state.stacks -= amount
  }
  hasExpired() {
    return this.state.duration <= 0
  }
  static format(data) {
    return Object.freeze({
      maxDuration: data.maxDuration,
      maxStacks: data.maxStacks,
      properties: Object.freeze(data.properties)
    })
  }
}

SerializableObject.register(StatusEffect)

module.exports = StatusEffect
