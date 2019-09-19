const compare = (e, id) => e.id == id

const remove = (arr, id, fn) => {
  let i = arr.findIndex(e => fn(e, id))
  if (i > -1) arr.splice(i, 1)
}

const contains = (arr, id) => {
  return arr.findIndex(e => e.id == id) > -1
}

module.exports = class Unit {
  constructor({id, team, attributes, actions, modifiers, flags, statusEffects}) {
    Object.assign(this, {
      id,
      team,
      attributes: attributes || {},
      actions: actions || [],
      modifiers: modifiers || {},
      flags: flags || [],
      statusEffects: statusEffects || []
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
  addModifier(key, modifier) {
    if (!this.modifiers[key]) this.modifiers[key] = []
    this.modifiers[key].push(modifier)
  }
  removeModifier(key, id, fn = compare) {
    if (this.modifiers[key]) {
      remove(this.modifiers[key], id, fn)
    }
  }
  hasModifier(key, id) {
    if (this.modifiers[key]) {
      return contains(this.modifiers[key], id)
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
