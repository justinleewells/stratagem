const classes = {}
class Target {
  static execute(instance, unit, tar) {}
  static register(id, cls) {
    classes[id] = cls 
  }
  static get(id) {
    return classes[id]
  }
}
module.exports = Target
