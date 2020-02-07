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
      actions: args.actions || {},
      modifiers: args.modifiers || {},
      flags: args.flags || {},
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
    this.actions[action.id] = action
  }
  removeAction(id, fn = null) {
    if (!fn) {
      delete this.actions[id]
    } else {
      for (let key in this.actions) {
        if (fn(this.actions[key], id)) delete this.actions[key]
      }
    }
  }
  hasAction(id) {
    return this.actions[id] != undefined
  }
  getAction(id) {
    return this.actions[id]
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
  addFlag(id) {
    if (!this.flags[id]) this.flags[id] = 0
    this.flags[id]++
  }
  removeFlag(id) {
    if (this.flags[id] !== undefined) {
      this.flags[id]--
      if (this.flags[id] == 0) delete this.flags[id]
    }
  }
  hasFlag(id) {
    return this.flags[id] != undefined
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
