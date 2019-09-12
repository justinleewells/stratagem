const DiscreteAttribute = require('./discrete-attribute')
const Result = require('./result')
const Utils = require('./utils')
const Value = require('./value')

module.exports = class Action {
  constructor({id, selector, initializers, attributes, results}) {
    Object.assign(this, {
      id,
      selector,
      initializers: Utils.assignClass(Value, initializers),
      attributes: Utils.assignFunction((v) => new DiscreteAttribute({base: v, current: v}), attributes),
      results: Utils.mapClass(Result, results)
    })
  }
  invoke(context, selection) {
    context = context.clone()
    Object.entries(this.initializers).forEach(([k, v]) => {
      context.properties[k] = v.transform(context)
    })
    return this.results.map((result) => {
      if (result.isInvocable(context)) return result.invoke(context, selection)
    })
      .filter(e => Array.isArray(e))
  }
}
