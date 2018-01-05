const EventEmitter = require('events')
class OutputEmitter extends EventEmitter {
  constructor(output) {
    super()
    this.output = output
  }
  addOutput(event) {
    this.emit('event', event)
  }
  startOutput(event) {
    event.result = []
    this.emit('event', event)
  }
  endOutput() {
    this.emit('event', {type: 'end'})
  }
  cancelOutput(depth) {
    this.emit('event', {type: 'cancel', depth: depth})
  }
  isOutputCanceled() {
    return this.output.isCanceled()
  }
}
module.exports = OutputEmitter
