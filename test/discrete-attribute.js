const DiscreteAttribute = require('../lib/discrete-attribute')
const expect = require('chai').expect

describe('DiscreteAttribute', () => {
  describe('#_recalculate', () => {
    it('handles add modifiers', (done) => {
      let attribute = new DiscreteAttribute({
        base: 10,
        current: 10,
        modifiers: [{
          id: 'foo',
          type: 'add',
          value: 10
        }]
      })
      attribute._recalculate()
      expect(attribute.current).to.equal(20)
      done()
    })
    it('handles subtract modifiers', (done) => {
      let attribute = new DiscreteAttribute({
        base: 10,
        current: 10,
        modifiers: [{
          id: 'foo',
          type: 'subtract',
          value: 10
        }]
      })
      attribute._recalculate()
      expect(attribute.current).to.equal(0)
      done()
    })
    it('handles multiply modifiers', (done) => {
      let attribute = new DiscreteAttribute({
        base: 10,
        current: 10,
        modifiers: [{
          id: 'foo',
          type: 'multiply',
          value: 10
        }]
      })
      attribute._recalculate()
      expect(attribute.current).to.equal(100)
      done()
    })
    it('handles divide modifiers', (done) => {
      let attribute = new DiscreteAttribute({
        base: 10,
        current: 10,
        modifiers: [{
          id: 'foo',
          type: 'divide',
          value: 10
        }]
      })
      attribute._recalculate()
      expect(attribute.current).to.equal(1)
      done()
    })
    it('handles set modifiers', (done) => {
      let attribute = new DiscreteAttribute({
        base: 'test',
        current: 'test',
        modifiers: [{
          id: 'foo',
          type: 'set',
          value: 'bar'
        }]
      })
      attribute._recalculate()
      expect(attribute.current).to.equal('bar')
      done()
    })
  })
  describe('#toJSON', () => {
    it('returns a JSON object with discrete as the type', (done) => {
      let attribute = new DiscreteAttribute({
        base: 10,
        current: 15,
        modifiers: [{
          id: 'foo',
          type: 'add',
          value: 5
        }]
      })
      let json = attribute.toJSON()
      expect(json.type).to.equal('discrete')
      expect(json.base).to.equal(10)
      expect(json.current).to.equal(15)
      expect(json.modifiers[0].id).to.equal('foo')
      expect(json.modifiers[0].type).to.equal('add')
      expect(json.modifiers[0].value).to.equal(5)
      done()
    })
  })
})
