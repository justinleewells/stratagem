const Unit = require('../lib/unit')
const DiscreteAttribute = require('../lib/discrete-attribute')
const Action = require('../lib/action')
const Modifier = require('../lib/modifier')
const StatusEffect = require('../lib/status-effect')

const expect = require('chai').expect

describe('Unit', () => {
  before(() => {
    Action.define(0, {})
    Modifier.define(0, {key: 'foo'})
    Modifier.define(1, {key: 'foo'})
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
    it('adds the action to the actions object', (done) => {
      let unit = new Unit({})
      let action = Action.create(0, {})
      unit.addAction(action)
      expect(unit.actions[0]).to.equal(action)
      done()
    })
  })
  describe('#removeAction', () => {
    it('removes the action from the actions object', (done) => {
      let unit = new Unit({
        actions: {0: Action.create(0, {})}
      })
      unit.removeAction(0)
      expect(unit.actions[0]).to.equal(undefined)
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
        actions: {0: Action.create(0, {foo: 'bar'})}
      })
      unit.removeAction({foo: 'bar'}, (e, obj) => {
        return e.state.foo == obj.foo
      })
      expect(unit.actions[0]).to.equal(undefined)
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
      let modifier = Modifier.create(0, {})
      unit.addModifier(Modifier.create(0, {}))
      expect(unit.modifiers.foo[0].id).to.equal(0)
      done()
    })
  })
  describe('#removeModifier', () => {
    it('removes the modifier', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {})]
        }
      })
      unit.removeModifier(0)
      expect(unit.modifiers.foo.length).to.equal(0)
      done()
    })
    it('does nothing if a modifier with the provided id does not exist', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {})]
        }
      })
      unit.removeModifier(1)
      expect(unit.modifiers.foo.length).to.equal(1)
      done()
    })
    it('throws an error if the modifier is not defined', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {})]
        }
      })
      expect(() => { unit.removeModifier(100) }).to.throw('Modifier+100 is undefined')
      done()
    })
    it('supports custom comparators', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {foo: 'bar'})]
        }
      })
      unit.removeModifier(0, {foo: 'bar'}, (e, obj) => {
        return e.state.foo == obj.foo
      })
      expect(unit.modifiers.foo.length).to.equal(0)
      done()
    })
  })
  describe('#hasModifier', () => {
    it('returns true if the modifier exists', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {})]
        }
      })
      expect(unit.hasModifier(0)).to.be.true
      done()
    })
    it('returns false if the modifier does not exist', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {})]
        }
      })
      expect(unit.hasModifier(1)).to.be.false
      done()
    })
    it('throws an error if the modifier is not defined', (done) => {
      let unit = new Unit({
        modifiers: {
          foo: [Modifier.create(0, {})]
        }
      })
      expect(() => { unit.hasModifier(100) }).to.throw('Modifier+100 is undefined')
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
    it('sets the id on the flags object equal to 1 if it does not exist', (done) => {
      let unit = new Unit({}) 
      unit.addFlag(0)
      expect(unit.flags[0]).to.equal(1)
      done()
    })
    it('increments the id on the flags object if it already exists', (done) => {
      let unit = new Unit({
        flags: {0: 1}
      })
      unit.addFlag(0)
      expect(unit.flags[0]).to.equal(2)
      done()
    })
  })
  describe('#removeFlag', () => {
    it('deletes the id on the flags object if it is equal to 1', (done) => {
      let unit = new Unit({
        flags: {0: 1}
      })
      unit.removeFlag(0)
      expect(unit.flags[0]).to.equal(undefined)
      done()
    })
    it('does nothing if a flag with the provided id does not exist', (done) => {
      let unit = new Unit({
        flags: {0: 1}
      })
      unit.removeFlag(1)
      expect(unit.flags[1]).to.equal(undefined)
      done()
    })
  })
  describe('#hasFlag', () => {
    it('returns true if the flag exists within the flags object', (done) => {
      let unit = new Unit({
        flags: {0: 1}
      })
      expect(unit.hasFlag(0)).to.be.true
      done()
    })
    it('returns false if the flag does not exist within the flags object', (done) => {
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
