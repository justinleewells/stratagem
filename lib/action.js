const Serializable = require('serializable-class')

const GameObject = require('./game-object')
const Event = require('./event')
const Result = require('./result')
const Utils = require('./utils')
const Value = require('./value')

const sym = Symbol('Action')

class Action extends GameObject {
  constructor(id, state, data) {
    super(id, state)

    let cls = this.constructor.name
    if (cls == 'Action') this[sym] = data
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
  get results() {
    return this[sym].results
  }
  _postDeserialize(object) {
    let cls = this.constructor.name
    if (cls == 'Action') this[sym] = Action.get(this.id)
  }
  invoke(context, selection) {
    context = context.clone()
    Object.entries(this.initializers).forEach(([k, v]) => {
      context.properties[k] = v.transform(context)
    })
    return this.results.flatMap((result) => {
      if (result.isInvocable(context)) return result.invoke(context, selection)
    })
      .filter(e => e instanceof Event)
  }
  static format(data) {
    return {
      properties: Object.freeze(data.properties),
      selector: data.selector,
      initializers: Object.freeze(Utils.assignClass(Value, data.initializers)),
      results: Object.freeze(Utils.mapClass(Result, data.results)),
    }
  }
}

Serializable.register(Action)

module.exports = Action
