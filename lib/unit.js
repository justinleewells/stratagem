module.exports = class Unit {
  constructor({id, team, attributes, actions, modifiers, flags, statusEffects}) {
    Object.assign(this, {
      id,
      team,
      attributes,
      actions,
      modifiers,
      flags,
      statusEffects
    })
  }
}
