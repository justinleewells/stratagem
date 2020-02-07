const Effect = require('../lib/effect')
const Condition = require('../lib/condition')
const Context = require('../lib/context')
const Event = require('../lib/event')
const Strategy = require('../lib/strategy')
const expect = require('chai').expect

let trueCondition = {
  type: 'true',
  strategy: 'true'
}

let falseCondition = {
  type: 'true',
  strategy: 'false'
}

describe('Effect', () => {
  before(() => {
    Strategy.define('true', () => true)
    Strategy.define('false', () => false)
    Strategy.define('plusOne', (c, a) => a + 1)
  })
  after(() => {
    Strategy._empty()
  })
  describe('#isInvocable', () => {
    it('returns true if all conditions evaluate to true', (done) => {
      let effect = new Effect({
        conditions: [
          trueCondition,
          trueCondition
        ]
      })
      expect(effect.isInvocable({})).to.be.true
      done()
    })
    it('returns false if any conditions are false', (done) => {
      let effect = new Effect({
        conditions: [
          trueCondition,
          falseCondition 
        ]
      })
      expect(effect.isInvocable({})).to.be.false
      done()
    })
  })
  describe('#invoke', () => {
    it('returns a new event based on the provided context', (done) => {
      let context = new Context({
        properties: {
          source: 'a',
          target: 'b'
        }
      })
      let effect = new Effect({
        type: 'foo',
        attributes: {
          power: 10,
          interruptible: false
        }
      })
      let event = effect.invoke(context)
      expect(event instanceof Event).to.be.true
      expect(event.type).to.equal('foo')
      expect(event.source).to.equal('a')
      expect(event.target).to.equal('b')
      expect(event.attributes.power.current).to.equal(10)
      expect(event.attributes.interruptible.current).to.equal(false)
      done()
    })
    it('transforms all attribute values', (done) => {
      let context = new Context({
        properties: {
          source: 'a',
          target: 'b'
        }
      })
      let effect = new Effect({
        type: 'foo',
        attributes: {
          power: {
            type: 'strategy',
            strategy: 'plusOne',
            values: [10]
          },
        }
      })
      let event = effect.invoke(context)
      expect(event.attributes.power.current).to.equal(11)
      done()
    })
  })
})
