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
  beforeEach(() => {
    Action._empty()
  })
  before(() => {
    Strategy.define('value', (context, value) => value)
  })
  after(() => {
    Strategy._empty()
  })
  describe('#invoke', () => {
    it('runs all initializers', (done) => {
      Action.define(0, {
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
      let action = Action.create(0, {})
      let spy = sinon.spy(Result.prototype, 'invoke')
      let events = action.invoke(context, selection)
      expect(spy.getCall(0).args[0].properties.one).to.equal(1)
      Result.prototype.invoke.restore()
      done()
    })
    it('returns the events from each invoked result', (done) => {
      Action.define(0, {
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
      let action = Action.create(0, {})
      let events = action.invoke(context, selection)
      let eventOne = events[0]
      expect(eventOne).to.be.instanceOf(Event)
      expect(eventOne.type).to.equal('damage')
      let eventTwo = events[1]
      expect(eventTwo).to.be.instanceOf(Event)
      expect(eventTwo.type).to.equal('interrupt')
      done()
    })
  })
})
