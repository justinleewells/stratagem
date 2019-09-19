const Unit = require('../lib/unit')
const DiscreteAttribute = require('../lib/discrete-attribute')
const Action = require('../lib/action')
const Modifier = require('../lib/modifier')
const Flag = require('../lib/flag')
const StatusEffect = require('../lib/status-effect')

const expect = require('chai').expect

describe('Unit', () => {
  before(() => {
    Action.define(0, {})
    Modifier.define(0, {})
    StatusEffect.define(0, {})
  })
  after(() => {
    Action._empty()
  })
  describe('#addAttribute', () => {
    it('adds the attribute to the attributes object', (done) => {
      let attribute = new DiscreteAttribute({
        base: 10,
        current: 10
      })
      let unit = new Unit({})
      unit.addAttribute('str', attribute)
      expect(unit.attributes.str.current).to.equal(10)
      done()
    })
  })
  describe('#removeAttribute', () => {
    it('removes the attribute from the attributes object', (done) => {
      let unit = new Unit({
        attributes: {
          str: new DiscreteAttribute({
            base: 10,
            current: 10
          })
        }
      })
      unit.removeAttribute('str')
      expect(unit.attributes.str).to.be.undefined
      done()
    })
  })
  describe('#addAction', () => {
    it('adds the action to the actions array', (done) => {
      let unit = new Unit({})
      unit.addAction(Action.create(0, {}))
      expect(unit.actions[0].id).to.equal(0)
      done()
    })
  })
  describe('#removeAction', () => {
    it('removes the action from the actions array', (done) => {
      let unit = new Unit({
        actions: [Action.create(0, {})]
      })
      unit.removeAction(0)
      expect(unit.actions.length).to.equal(0)
      done()
    })
    it('does nothing if an action with the provided id does not exist', (done) => {
      let unit = new Unit({
        actions: [Action.create(0, {})]
      })
      unit.removeAction(1)
      expect(unit.actions.length).to.equal(1)
      done()
    })
    it('supports custom comparators', (done) => {
      let unit = new Unit({
        actions: [Action.create(0, {foo: 'bar'})]
      })
      unit.removeAction({foo: 'bar'}, (e, obj) => {
        return e.state.foo == obj.foo
      })
      expect(unit.actions.length).to.equal(0)
      done()
    })
  })
  describe('#hasAction', () => {
    it('returns true if the action exists in the actions array', (done) => {
      let unit = new Unit({
        actions: [Action.create(0, {})]
      })
      expect(unit.hasAction(0)).to.be.true
      done()
    })
    it('returns false if the action does not exist in the actions array', (done) => {
      let unit = new Unit({})
      expect(unit.hasAction(0)).to.be.false
      done()
    })
  })
  describe('#addModifier', () => {
    it('adds the modifier to the specified array', (done) => {
      let unit = new Unit({})
      unit.addModifier('foo', Modifier.create(0, {}))
      expect(unit.modifiers.foo[0].id).to.equal(0)
      done()
    })
  })
  describe('#removeModifier', () => {
    it('removes the modifier from the specified array', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {})]
        }
      })
      unit.removeModifier('foo', 0)
      expect(unit.modifiers.foo.length).to.equal(0)
      done()
    })
    it('does nothing if a modifier with the provided id does not exist within the specified array', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {})]
        }
      })
      unit.removeModifier('foo', 1)
      expect(unit.modifiers.foo.length).to.equal(1)
      done()
    })
    it('does nothing if the specified array does not exist within the modifiers object', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {})]
        }
      })
      unit.removeModifier('bar', 0)
      expect(unit.modifiers.foo.length).to.equal(1)
      done()
    })
    it('supports custom comparators', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {foo: 'bar'})]
        }
      })
      unit.removeModifier('foo', {foo: 'bar'}, (e, obj) => {
        return e.state.foo == obj.foo
      })
      expect(unit.modifiers.foo.length).to.equal(0)
      done()
    })
  })
  describe('#hasModifier', () => {
    it('returns true if the modifier exists within the specified array', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {})]
        }
      })
      expect(unit.hasModifier('foo', 0)).to.be.true
      done()
    })
    it('returns false if the modifier does not exist within the specified array', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {})]
        }
      })
      expect(unit.hasModifier('foo', 1)).to.be.false
      done()
    })
    it('returns false if the specified array does not exist within the modifiers object', (done) => {
      let unit = new Unit({})
      expect(unit.hasModifier('foo', 0)).to.be.false
      done()
    })
  })
  describe('#getModifiers', () => {
    it('returns the modifiers if the specified array exists', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {})]
        }
      })
      expect(unit.getModifiers('foo').length).to.equal(1)
      done()
    })
    it('returns an empty array if the specific array does not exist', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {})]
        }
      })
      expect(unit.getModifiers('bar').length).to.equal(0)
      done()
    })
  })
  describe('#addFlag', () => {
    it('adds the flag to the flags array', (done) => {
      let unit = new Unit({}) 
      unit.addFlag(new Flag(0))
      expect(unit.flags[0].id).to.equal(0)
      done()
    })
  })
  describe('#removeFlag', () => {
    it('removes the flag from the flags array', (done) => {
      let unit = new Unit({
        flags: [new Flag(0)]
      })
      unit.removeFlag(0)
      expect(unit.flags.length).to.equal(0)
      done()
    })
    it('does nothing if a flag with the provided id does not exist', (done) => {
      let unit = new Unit({
        flags: [new Flag(0)]
      })
      unit.removeFlag(1)
      expect(unit.flags.length).to.equal(1)
      done()
    })
  })
  describe('#hasFlag', () => {
    it('returns true if the flag exists within the flags array', (done) => {
      let unit = new Unit({
        flags: [new Flag(0)]
      })
      expect(unit.hasFlag(0)).to.be.true
      done()
    })
    it('returns false if the flag does not exist within the flags array', (done) => {
      let unit = new Unit({})
      expect(unit.hasFlag(0)).to.be.false
      done()
    })
  })
  describe('#addStatusEffect', () => {
    it('adds the status effect to the statusEffects array', (done) => {
      let unit = new Unit({})
      unit.addStatusEffect(StatusEffect.create(0, {}))
      expect(unit.statusEffects[0].id).to.equal(0)
      done()
    })
  })
  describe('#removeStatusEffect', () => {
    it('removes the status effect from the statusEffects array', (done) => {
      let unit = new Unit({
        statusEffects: [StatusEffect.create(0, {})]
      })
      unit.removeStatusEffect(0)
      expect(unit.statusEffects.length).to.equal(0)
      done()
    })
    it('does nothing if the status effect does not exist within the statusEffects array', (done) => {
      let unit = new Unit({
        statusEffects: [StatusEffect.create(0, {})]
      })
      unit.removeStatusEffect(1)
      expect(unit.statusEffects.length).to.equal(1)
      done()
    })
    it('supports custom comparators', (done) => {
      let unit = new Unit({
        statusEffects: [StatusEffect.create(0, {foo: 'bar'})]
      })
      unit.removeStatusEffect({foo: 'bar'}, (e, obj) => {
        return e.state.foo == obj.foo
      })
      expect(unit.statusEffects.length).to.equal(0)
      done()
    })
  })
  describe('#hasStatusEffect', () => {
    it('returns true if the status effect exists within the statusEffects array', (done) => {
      let unit = new Unit({
        statusEffects: [StatusEffect.create(0, {})]
      })
      expect(unit.hasStatusEffect(0)).to.be.true
      done()
    })
    it('returns false if the status effect does not exist within the statusEffects array', (done) => {
      let unit = new Unit({})
      expect(unit.hasStatusEffect(0)).to.be.false
      done()
    })
  })
})
