const SerializableObject = require('serializable-object')

const Event = require('./event')
const Condition = require('./condition')
const Effect = require('./effect')
const Selector = require('./selector')
const Utils = require('./utils')
const Value = require('./value')
const Executor = require('./executor')

let handlers = {}

class Handler {
  constructor({id, transient, properties, selector, initializers, effects, conditions, priority, wrapper, ignoreCanceled}) {
    this.id = id
    this.transient = transient
    this.selector = selector
    this.properties = Utils.assignClass(Value, properties)
    this.initializers = Utils.assignClass(Value, initializers)
    this.effects = Utils.assignFunction((v) => Utils.mapClass(Effect, v), effects)
    this.conditions = Utils.mapClass(Condition, conditions)
    this.priority = priority || 0
    this.wrapper = wrapper
    this.ignoreCanceled = ignoreCanceled
  }
  isInvocable(context) {
    return this.conditions.every(c => c.evaluate(context))
  }
  invoke(context) {
    context = Object.assign({}, context)
    let selection = Selector.invoke(this.selector, [context])
    if (this.initializers) {
      context.initializers = {}
      for (let key in this.initializers) {
        context.initializers[key] = this.initializers[key].unbox(context)
      }
    }
    let result = []
    for (let key in selection) {
      if (this.effects[key]) {
        selection[key].forEach((unit) => {
          context.target = unit
          this.effects[key].forEach((effect) => {
            if (effect.isApplicable(context)) {
              let events = effect.apply(context)
              if (events.length > 0) result = result.concat(events)
            }
          })
        }) 
      }
    }
    return result
  }
  static register(eventType, handler) {
    if (!handlers[eventType]) handlers[eventType] = []
    handlers[eventType].push(handler)
    handlers[eventType].sort((a, b) => b.priority - a.priority)
  }
  static invokeAll(eventType, context) {
    if (!handlers[eventType]) return
    let results = []
    handlers[eventType].forEach(handler => {
      if (handler.isInvocable(context)) {
        let events = handler.invoke(context)
        if (events.length > 0) {
          let properties = Utils.assignFunction((v) => v.unbox(context), handler.properties)
          properties.handler = handler
          properties.events = events
          results.push(properties)
        }
      }
    })
    if (results.length > 0) {
      results.forEach((properties) => {
        let { wrapper, ignoreCanceled, id } = properties.handler
        if (!context.event.canceled || ignoreCanceled) {
          if (wrapper !== undefined) {
            context.instance.output.start(new Event({
              type: wrapper,
              properties: {id}
            }))
          }
          properties.events.forEach(e => context.instance.execute(e))
          if (wrapper !== undefined) {
            context.instance.output.stop()
          }
        }
      })
    }
  }
}

SerializableObject.register(Handler)

module.exports = Handler
