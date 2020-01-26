const Serializable = require('serializable-class')

const Modifier = require('./modifier')

const compare = (e, id) => e.id == id

const remove = (arr, id, fn) => {
  let i = arr.findIndex(e => fn(e, id))
  if (i > -1) arr.splice(i, 1)
}

const contains = (arr, id) => {
  return arr.findIndex(e => e.id == id) > -1
}

class Unit extends Serializable {
  constructor(args = {}) {
    super()
    Object.assign(this, {
      id: args.id,
      team: args.team,
      attributes: args.attributes || {},
      actions: args.actions || [],
      modifiers: args.modifiers || {},
      flags: args.flags || [],
      statusEffects: args.statusEffects || []
    })
  }
  addAttribute(key, attribute) {
    this.attributes[key] = attribute
  }
  removeAttribute(key) {
    delete this.attributes[key]
  }
  addAction(action) {
    this.actions.push(action)
  }
  removeAction(id, fn = compare) {
    remove(this.actions, id, fn)
  }
  hasAction(id) {
    return contains(this.actions, id)
  }
  addModifier(modifier) {
    if (!this.modifiers[modifier.key]) this.modifiers[modifier.key] = []
    this.modifiers[modifier.key].push(modifier)
  }
  removeModifier(id, data = id, fn = compare) {
    let modifier = Modifier.get(id)
    if (this.modifiers[modifier.key]) {
      remove(this.modifiers[modifier.key], data, fn)
    }
  }
  hasModifier(id) {
    let modifier = Modifier.get(id)
    if (this.modifiers[modifier.key]) {
      return contains(this.modifiers[modifier.key], id)
    } else {
      return false
    }
  }
  getModifiers(key) {
    return this.modifiers[key] || []
  }
  addFlag(flag) {
    this.flags.push(flag)
  }
  removeFlag(id, fn = compare) {
    remove(this.flags, id, fn)
  }
  hasFlag(id) {
    return contains(this.flags, id)
  }
  addStatusEffect(statusEffect) {
    this.statusEffects.push(statusEffect)
  }
  removeStatusEffect(id, fn = compare) {
    remove(this.statusEffects, id, fn)
  }
  hasStatusEffect(id) {
    return contains(this.statusEffects, id)
  }
}

Serializable.register(Unit)

module.exports = Unit
