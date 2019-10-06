const DiscreteAttribute = require('../lib/discrete-attribute')
const expect = require('chai').expect

describe('DiscreteAttribute', () => {
  describe('#constructor', () => {
    it('accepts a single number as an argument', (done) => {
      let attribute = new DiscreteAttribute(10)
      expect(attribute.base).to.equal(10)
      expect(attribute.current).to.equal(10)
      done()
    })
  })
  describe('#_recalculate', () => {
    it('sets the result of _calculateModifiedBase to current', (done) => {
      let attribute = new DiscreteAttribute({
        base: 10,
        current: 10,
        modifiers: []
      })
      attribute.modifiers.push({
        id: 'foo',
        type: 'add',
        value: 5
      })
      attribute._recalculate()
      expect(attribute.current).to.equal(15)
      done()
    })
  })
  describe('#toJSON', () => {
    it('returns a JSON object', (done) => {
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
      expect(json.base).to.equal(10)
      expect(json.current).to.equal(15)
      expect(json.modifiers[0].id).to.equal('foo')
      expect(json.modifiers[0].type).to.equal('add')
      expect(json.modifiers[0].value).to.equal(5)
      expect(json instanceof Object).to.be.true
      done()
    })
  })
})
