const DiscreteAttribute = require('../lib/discrete-attribute')
const AttributeModifier = require('../lib/attribute-modifier')
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
      attribute.modifiers.push(new AttributeModifier({
        id: 'foo',
        type: 'add',
        value: 5
      }))
      attribute._recalculate()
      expect(attribute.current).to.equal(15)
      done()
    })
  })
})
