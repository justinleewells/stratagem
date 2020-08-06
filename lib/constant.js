const constants = {}

class Constant {
  static define(obj) {
    Object.entries(obj).forEach(([key, value]) => {
      constants[key] = value
    })
  }
  static get(key) {
    if (constants[key] == undefined) throw new Error(`Constant+${key} is undefined`)
    return constants[key]
  }
}

module.exports = Constant
