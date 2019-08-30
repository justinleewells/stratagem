module.exports = class Selection {
  constructor(entries) {
    this.entries = {}
    if (entries) {
      for (let key in entries) {
        this.addEntries(key, entries[key])
      }
    }
  }
  addEntries(key, entries) {
    if (!this.entries[key]) this.entries[key] = []
    this.entries[key] = this.entries[key].concat(entries)
  }
}
