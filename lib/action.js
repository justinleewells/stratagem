const SerializableObject = require('serializable-object')

const Effect = require('./effect')
const GameObject = require('./game-object')
const Selector = require('./selector')
const Utils = require('./utils')
const Value = require('./value')

const sym = Symbol('Action')

class Action extends GameObject {
  constructor(id, state, data) {
    super(id, state)
    this[sym] = data
  }
  get properties() {
    return this[sym].properties
  }
  get selector() {
    return this[sym].selector
  }
  get initializers() {
    return this[sym].initializers
  }
  get effects() {
    return this[sym].effects
  }
  _postDeserialize(object) {
    this[sym] = Action.get(this.id)
  }
  use(source, instance, input) {
    let selection = Selector.invoke(this.selector, [source, instance, input])
    let context = {
      instance: instance,
      selection: selection,
      source: {
        unit: source,
        action: this.id
      }
    }
    if (this.initializers) {
      context.initializers = {}
      for (let key in this.initializers) {
        context.initializers[key] = this.initializers[key].unbox(context)
      }
    }
    let result = []
    for (let key in selection) {
      if (this.effects[key]) {
        selection[key].forEach(unit => {
          context.target = unit
          this.effects[key].forEach(effect => {
            if (effect.isApplicable(context)) {
              result.push({
                events: effect.apply(context),
                target: unit,
                action: this.id
              })
            }
          })
        })
      }
    }
    return result
  }
  static format(data) {
    return Object.freeze({
      properties: Object.freeze(data.properties),
      selector: data.selector,
      initializers: Object.freeze(Utils.assignClass(Value, data.initializers)),
      effects: Object.freeze(Utils.assignFunction((v) => Utils.mapClass(Effect, v), data.effects))
    })
  }
}

SerializableObject.register(Action)

module.exports = Action
