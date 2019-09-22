const Context = require('./context')
const Strategy = require('./strategy')

let handlers = {}

module.exports = class EventHandler {
  static define(key, fn) {
    if (handlers[key]) throw new Error(`Handler ${key} is already defined`)
    handlers[key] = fn
  }
  static _empty() {
    handlers = {}
  }
  static _handlers() {
    return handlers
  }
  constructor(instance) {
    Object.assign(this, {instance})
  }
  handle(event) {
    if (!handlers[event.type]) throw new Error(`Handler ${event.type} is undefined`)
    this.instance.output.start(event)
    this.modify('pre', event)
    if (!event.canceled) handlers[event.type](this, event)
    this.modify('post', event)
    this.instance.output.finish()
  }
  modify(prefix, event) {
    this.instance.units
      .flatMap((u) => u.getModifiers(`${prefix}-${event.type}`).map(m => {
        return {modifier: m, unit: u}
      }))
      .sort((a, b) => a.modifier.priority - b.modifier.priority)
      .forEach(({modifier, unit}) => {
        let context = new Context({
          instance: this.instance,
          properties: {
            event: event,
            owner: unit,
            modifier: modifier
          }
        })
        if (modifier.isInvocable(context)) {
          let selection = Strategy.invoke(modifier.selector, context)
          let events = modifier.invoke(context, selection)
          events.forEach((e) => {
            e.setOrigin(modifier)
            this.handle(e)
          })
        } 
      })
  }
}
