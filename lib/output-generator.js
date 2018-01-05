class OutputGenerator {
  constructor() {
    this.head = []
    this.current = this.head
    this.history = []
  }
  finish() {
    let ret = this.head
    this.head = []
    this.current = this.head
    this.history = []
    return ret
  }
  register(unit) {
    unit.on('event', (ev) => {
      if (ev.type === 'end') this.end()
      else if (ev.type === 'cancel') this.cancel(ev.depth)
      else this.add(ev)
    })
  }
  add(event) {
    if (this.current === this.head) this.current.push(event)
    else this.current.result.push(event)
    if (event.result) {
      if (this.head === null) this.head = event
      this.history.push(this.current)
      this.current = event
    }
  }
  end() {
    this.current = this.history.pop()
  }
  cancel(depth) {
    if (depth === undefined) this.current.canceled = true
    else this.history[this.history.length-depth].canceled = true
  }
  isCanceled() {
    return this.current.canceled === true
  }
}
module.exports = OutputGenerator
