const Condition = require('./condition')
const Result = require('./result')
const Utils = require('./utils')

module.exports = class Effect {
  constructor({conditions, results}) {
    this.conditions = Utils.mapClass(Condition, conditions)
    this.results = Utils.mapClass(Result, results)
  }
  isApplicable(context) {
    return this.conditions.every(c => c.evaluate(context))
  }
  apply(context) {
    let result = []
    this.results.forEach((r) => {
      if (r.isApplicable(context)) result.push(r.create(context))
    })
    return result
  }
}
