const strategies = {}

module.exports = class Strategy {
  static define(key, fn) {
    if (strategies[key]) throw new Error(`Strategy ${key} is already defined`)
    strategies[key] = fn
  }
  static invoke(key, context, args) {
    if (!strategies[key]) throw new Error(`Strategy ${key} is undefined`)
    return strategies[key](context, ...args)
  }
  /* Exposed for testing */
  static _strategies() {
    return strategies
  }
  static _empty() {
    Object.keys(strategies).forEach(key => delete strategies[key])
  }
}
