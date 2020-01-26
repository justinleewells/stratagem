const ContinuousAttribute = require('../lib/continuous-attribute')
const expect = require('chai').expect

describe('ContinuousAttribute', () => {
  describe('#constructor', () => {
    it('accepts a single number as an argument', (done) => {
      let attribute = new ContinuousAttribute(10)
      expect(attribute.base).to.equal(10)
      expect(attribute.current).to.equal(10)
      expect(attribute.max).to.equal(10)
      expect(attribute.min).to.equal(0)
      done()
    })
  })
  describe('#add', () => {
    it('increases current', (done) => {
      let attribute = new ContinuousAttribute({
        base: 10,
        current: 0,
        min: 0,
        max: 10,
        modifiers: []
      })
      attribute.add(5)
      expect(attribute.current).to.equal(5)
      done()
    })
    it('sets current to max if adding exceeds max', (done) => {
      let attribute = new ContinuousAttribute({
        base: 10,
        current: 10,
        min: 0,
        max: 10,
        modifiers: []
      })
      attribute.add(5)
      expect(attribute.current).to.equal(10)
      done()
    })
  })
  describe('#subtract', () => {
    it('decreases current', (done) => {
      let attribute = new ContinuousAttribute({
        base: 10,
        current: 10,
        min: 0,
        max: 10,
        modifiers: []
      })
      attribute.subtract(5)
      expect(attribute.current).to.equal(5)
      done()
    })
    it('sets current to min if subtracting exceeds min', (done) => {
      let attribute = new ContinuousAttribute({
        base: 10,
        current: 10,
        min: 0,
        max: 10,
        modifiers: []
      })
      attribute.subtract(15)
      expect(attribute.current).to.equal(0)
      done()
    })
  })
})
