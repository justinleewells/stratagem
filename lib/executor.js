let executors = {}

class Executor {
  static define(key, fn, opts = {}) {
    if (executors[key]) throw new Error(`Executor+${key} is already defined`)
    executors[key] = {fn: fn, opts: opts}
  }
  static invoke(key, args = []) {
    if (!executors[key]) throw new Error(`Executor+${key} is undefined`)
    return executors[key].fn(...args)
  }
  static isTransient(key) {
    return executors[key].opts.transient
  }
}

module.exports = Executor
