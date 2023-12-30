import EventEmitter from 'events'

// An Executor is a special kind of EventBus that allows listeners to modify
// the event in various ways before execution.
//
// The phases of execution are as follows:
// 1. Pre-redirect Modify - Allows listeners to modify the values of an event before
// redirection. Ex: Change the attribute of an action based on the source's trait.
// 2. Redirect - Allows listeners to redirect the event to a different unit.
// 3. Post-redirect Modify - Allows listeners to modify the values of an event after
// redirection. Ex: Increase the power of an action based on the target's type.
// 4. Cancel - Allows listeners to cancel an event altogether.
//
// If the event has not been canceled after step 3, the following phases occur:
// 5. Start - Allows listeners to respond to an event beginning.
// 6. Execution - Executes the event handler corresponding to the event's type.
// 7. End - Allows listeners to respond to an event after it has concluded.
export default class Executor extends EventEmitter {
  constructor() {
    super()
    this.eventHandlers = {}
  }
  addEventHandler(type, fn) {
    if (this.eventHandlers[type])
      throw new Error(`EventHandler is already defined for ${type}`)
    this.eventHandlers[type] = fn
  }
  // TODO: Consider enforcing invariants to ensure listeners aren't breaking
  // the pre-execution rules.
  execute(instance, event) {
    const { type } = event
    if (!this.eventHandlers[type])
      throw new Error(`No EventHandler defined for ${type}.`)
    this.emit(`pre-redirect-modify-${type}`, { instance, event })
    this.emit(`redirect-${type}`, { instance, event })
    this.emit(`post-redirect-modify-${type}`, { instance, event })
    this.emit(`cancel-${type}`, { instance, event })
    if (!event.canceled) {
      this.emit(`start-${type}`, { instance, event })
      this.eventHandlers[type](instance, event)
      this.emit(`end-${type}`, { instance, event })
    }
  }
}
