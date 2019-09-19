const Result = require('../lib/result')
const Strategy = require('../lib/strategy')
const Context = require('../lib/context')
const Selection = require('../lib/selection')
const expect = require('chai').expect

const trueCondition = {
  type: 'true',
  strategy: 'true'
}

const falseCondition = {
  type: 'true',
  strategy: 'false'
}

describe('Result', () => {
  before(() => {
    Strategy.define('true', () => true)
    Strategy.define('false', () => false)
    Strategy.define('idEqualsB', (context) => context.properties.targets.indexOf('b') > -1)
    Strategy.define('idEqualsC', (context) => context.properties.targets.indexOf('c') > -1)
  })
  after(() => {
    Strategy._empty()
  })
  describe('#isInvocable', () => {
    it('returns true if all conditions evaluate to true', (done) => {
      let result = new Result({
        conditions: [
          trueCondition,
          trueCondition
        ]
      })
      expect(result.isInvocable({})).to.be.true
      done()
    })
    it('returns false if any conditions are false', (done) => {
      let result = new Result({
        conditions: [
          trueCondition,
          falseCondition
        ]
      })
      expect(result.isInvocable({})).to.be.false
      done()
    })
  })
  describe('#invoke', () => {
    it('returns an event for each invocable effect', (done) => {
      let context = new Context({
        properties: {
          source: 'a'
        }
      })
      let selection = new Selection({
        foo: ['b', 'c', 'd']
      })
      let result = new Result({
        selection: 'foo',
        effects: [
          {
            type: 'damage',
            attributes: {
              power: 10,
              interruptible: false
            },
            conditions: [
              {
                type: 'or',
                conditions: [
                  {
                    type: 'true',
                    strategy: 'idEqualsB'
                  },
                  {
                    type: 'true',
                    strategy: 'idEqualsC'
                  }
                ]
              }
            ]
          }
        ]
      })
      let events = result.invoke(context, selection)
      expect(events.length).to.equal(2)
      let event = events[0]
      expect(event.type).to.equal('damage')
      expect(event.source).to.equal('a')
      expect(event.targets.length).to.equal(1)
      expect(event.targets[0]).to.equal('b')
      expect(event.attributes.power.current).to.equal(10)
      expect(event.attributes.interruptible.current).to.be.false
      done()
    })
    it('returns no events if the selector entry does not exist', (done) => {
      let context = new Context({
        properties: {
          source: 'a'
        }
      })
      let selection = new Selection({
        foo: ['b', 'c'] 
      })
      let result = new Result({
        selection: 'bar',
        effects: [
          {
            type: 'damage',
            attributes: {
              power: 10,
              interruptible: false
            }
          }
        ]
      })
      let events = result.invoke(context, selection)
      expect(events.length).to.equal(0)
      done()
    })
  })
})
