let strategies = {}

module.exports = class Strategy {
  static define(key, fn) {
    let cls = this.prototype.constructor.name
    if (!strategies[cls]) strategies[cls] = {}
    if (strategies[cls][key]) throw new Error(`${cls}+${key} is already defined`)
    strategies[cls][key] = fn
  }
  static invoke(key, args = []) {
    let cls = this.prototype.constructor.name
    if (!strategies[cls] || !strategies[cls][key]) throw new Error(`${cls}+${key} is undefined`)
    return strategies[cls][key](...args)
  }
}
