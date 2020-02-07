let strategies = {}

module.exports = class Strategy {
  static define(key, fn) {
    let cls = this.prototype.constructor.name
    if (!strategies[cls]) strategies[cls] = {}
    if (strategies[cls][key]) throw new Error(`${cls}+${key} is already defined`)
    strategies[cls][key] = fn
  }
  static invoke(key, context, args = []) {
    let cls = this.prototype.constructor.name
    if (!strategies[cls] || !strategies[cls][key]) throw new Error(`${cls}+${key} is undefined`)
    return strategies[cls][key](context, ...args)
  }
  /* Exposed for testing */
  static _strategies() {
    let cls = this.prototype.constructor.name
    return strategies[cls]
  }
  static _empty() {
    strategies = {}
  }
}
