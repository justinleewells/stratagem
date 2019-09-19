module.exports = class OutputGenerator {
  constructor() {
    Object.assign(this, {
      head: null,
      current: null,
      result: null
    })
  }
  start(event) {
    if (this.head == null) this.head = event
    if (this.current !== null) {
      this.current.children.push(event)
      event.parent = this.current
    }
    this.current = event
  }
  finish() {
    if (this.head == this.current) this.result = this.current
    this.current = this.current.parent
  }
}
