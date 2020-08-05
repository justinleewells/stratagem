const SerializableObject = require('serializable-object')

class Unit extends SerializableObject {
  constructor(args = {}) {
    super()
    Object.assign(this, {
      id: args.id,
      team: args.team,
      attributes: args.attributes || {},
      actions: args.actions || {},
      statusEffects: args.statusEffects || []
    })
  }
  setAttribute(key, attribute) {
    this.attributes[key] = attribute
  }
  removeAttribute(key) {
    delete this.attributes[key]
  }
  addAction(action) {
    this.actions[action.id] = action
  }
  removeAction(id) {
    delete this.actions[id] 
  }
  hasAction(id) {
    return this.actions[id] != undefined
  }
  getAction(id) {
    return this.actions[id]
  }
  addStatusEffect(statusEffect) {
    this.statusEffects.push(statusEffect)
  }
  removeStatusEffect(id) {
    let index = this.statusEffects.findIndex(se => se.id == id)
    if (index > -1) this.statusEffects.splice(index, 1)
  }
  getStatusEffect(id) {
    return this.statusEffects.find(se => se.id == id)
  }
  hasStatusEffect(id) {
    return this.statusEffects.findIndex(se => se.id == id) != -1
  }
}

SerializableObject.register(Unit)

module.exports = Unit
