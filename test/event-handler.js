const EventHandler = require('../lib/event-handler')
const Event = require('../lib/event')
const Modifier = require('../lib/modifier')
const Unit = require('../lib/unit')
const Selection = require('../lib/selection')
const Strategy = require('../lib/strategy')

const expect = require('chai').expect

const createUnit = (id, team) => {
  return new Unit({id, team})
}

describe('EventHandler', () => {
  beforeEach(() => {
    EventHandler.define('damage', (instance, event) => {
      event.target.attributes.hp.subtract(event.attributes.value.current)
    })
  })
  afterEach(() => {
    EventHandler._empty()
  })
  before(() => {
    Strategy.define('sel_source', (context) => {
      return new Selection({
        source: [context.properties.event.source]
      })
    })
    Strategy.define('con_isTarget', (context) => {
      let source = context.properties.source
      let target = context.properties.event.target
      return target == source
    })
    Modifier.define(0, {
      selector: 'sel_source',
      results: [
        {
          selection: 'source',
          conditions: [
            {
              type: 'true',
              strategy: 'con_isTarget'
            }
          ],
          effects: [
            {
              type: 'damage',
              attributes: {
                power: 1
              }
            }
          ]
        }
      ]
    })
  })
  after(() => {
    Strategy._empty()
    Modifier._empty()
  })
  describe('#define', (done) => {
    it('saves the function', (done) => {
      let foo = () => 'foo'
      EventHandler.define('foo', foo)
      expect(EventHandler._handlers().foo).to.equal(foo)
      done()
    })
    it('throws an error if the strategy is already defined', (done) => {
      let foo = () => 'foo'
      EventHandler.define('foo', foo)
      expect(() => { EventHandler.define('foo', foo) }).to.throw('Handler foo is already defined')
      done()
    })
  })
  describe('#handle', () => {
    it('throws an error if the handler is undefined', (done) => {
      let handler = new EventHandler()
      expect(() => { handler.handle({type: 'foo'})}).to.throw('Handler foo is undefined')
      done()
    })
  })
  // TODO: Add proper tests
})
