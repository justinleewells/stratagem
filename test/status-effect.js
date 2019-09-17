const StatusEffect = require('../lib/status-effect')
const Context = require('../lib/context')
const Event = require('../lib/event')
const Result = require('../lib/result')
const Selection = require('../lib/selection')
const Strategy = require('../lib/strategy')

const sinon = require('sinon')
const expect = require('chai').expect

const trueCondition = {
  type: 'true',
  strategy: 'true'
}

const falseCondition = {
  type: 'false',
  strategy: 'true'
}

const context = new Context({
  properties: {
    source: 'a'
  }
})

const selection = new Selection({
  foo: ['b']
})

describe('StatusEffect', () => {
  before(() => {
    Strategy.define('true', () => true)
    Strategy.define('value', (context, value) => value)
  })
  after(() => {
    Strategy._empty()
  })
  describe('#isInvocable', () => {
    it('returns true if all conditions for the given event type evaluate to true', (done) => {
      let statusEffect = new StatusEffect({
        events: {
          foo: {
            conditions: [
              trueCondition,
              trueCondition
            ]
          }
        }
      }) 
      expect(statusEffect.isInvocable('foo', {})).to.be.true
      done()
    })
    it('returns false if any conditions for the given event type evaluate to false', (done) => {
      let statusEffect = new StatusEffect({
        events: {
          foo: {
            conditions: [
              trueCondition,
              falseCondition
            ]
          }
        }
      }) 
      expect(statusEffect.isInvocable('foo', {})).to.be.false
      done()
    })
    it('returns false if the given event does not exist', (done) => {
      let statusEffect = new StatusEffect({})
      expect(statusEffect.isInvocable('foo', {})).to.be.false
      done()
    })
  })
  describe('#invoke', () => {
    it('runs all initializers for the given event type', (done) => {
      let statusEffect = new StatusEffect({
        events: {
          foo: {
            initializers: {
              one: {
                type: 'strategy',
                strategy: 'value',
                values: [1]
              }
            },
            results: [
              {
                selection: 'foo',
                effects: [
                  {
                    type: 'damage',
                    attributes: {
                      power: 10
                    }
                  }
                ]
              }
            ]
          }
        }
      })
      let spy = sinon.spy(Result.prototype, 'invoke')
      let events = statusEffect.invoke('foo', context, selection)
      expect(spy.getCall(0).args[0].properties.one).to.equal(1)
      Result.prototype.invoke.restore()
      done()
    })
    it('returns the events from each invoked result for the given event', (done) => {
      let statusEffect = new StatusEffect({
        events: {
          foo: {
            results: [
              {
                selection: 'foo',
                effects: [
                  {
                    type: 'damage',
                    attributes: {
                      power: 10
                    }
                  }
                ]
              },
              {
                selection: 'foo',
                effects: [
                  {
                    type: 'interrupt'
                  }
                ]
              }
            ]
          }
        }
      })
      let events = statusEffect.invoke('foo', context, selection)
      let eventOne = events[0][0][0]
      expect(eventOne).to.be.instanceOf(Event)
      expect(eventOne.type).to.equal('damage')
      let eventTwo = events[1][0][0]
      expect(eventTwo).to.be.instanceOf(Event)
      expect(eventTwo.type).to.equal('interrupt')
      done()
    })
  })
})
