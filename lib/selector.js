let selectors = {}

module.exports = class Selector {
  static define(key, fn) {
    if (selectors[key]) throw new Error(`Selector ${key} is already defined`)
    selectors[key] = fn
  }
  static invoke(key, context, input) {
    if (!selectors[key]) throw new Error(`Selector ${key} is undefined`)
    return selectors[key](context, input)
  }
  /* Exposed for testing */
  static _selectors() {
    return selectors
  }
  static _empty() {
    Object.keys(selectors).forEach(key => delete selectors[key])
  }
}
