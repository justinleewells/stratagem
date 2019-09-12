const Action = require('../lib/action')
const Context = require('../lib/context')
const Event = require('../lib/event')
const Result = require('../lib/result')
const Strategy = require('../lib/strategy')
const Selection = require('../lib/selection')

const sinon = require('sinon')
const expect = require('chai').expect

const context = new Context({
  properties: {
    source: 'a'
  }
})

const selection = new Selection({
  foo: ['b']
})

describe('Action', () => {
  before(() => {
    Strategy.define('value', (context, value) => value)
    Strategy.define('oneAndTwoSet', (context) => context.properties.one == 1 && context.properties.two == 2)
  })
  after(() => {
    Strategy._empty()
  })
  describe('#invoke', () => {
    it('runs all initializers', (done) => {
      let action = new Action({
        id: 0,
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
      })
      let spy = sinon.spy(Result.prototype, 'invoke')
      let events = action.invoke(context, selection)
      expect(spy.getCall(0).args[0].properties.one).to.equal(1)
      Result.prototype.invoke.restore()
      done()
    })
    it('returns the events from each invoked result', (done) => {
      let action = new Action({
        id: 0,
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
      })
      let events = action.invoke(context, selection)
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
