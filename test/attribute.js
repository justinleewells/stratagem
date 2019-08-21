const Attribute = require('../lib/attribute')
const expect = require('chai').expect
const sinon = require('sinon')

describe('Attribute', () => {
  describe('#addModifier', () => {
    it('adds the new modifier to the modifiers array', (done) => {
      let attribute = new Attribute({})
      attribute.addModifier('foo', 'add', 10)
      expect(attribute.modifiers[0].id).to.equal('foo')
      expect(attribute.modifiers[0].type).to.equal('add')
      expect(attribute.modifiers[0].value).to.equal(10)
      done()
    })
    it('calls recalculate after adding the modifier', (done) => {
      let attribute = new Attribute({})
      let spy = sinon.spy(attribute, '_recalculate')
      attribute.addModifier('foo', 'add', 10)
      expect(spy.calledOnce).to.equal(true)
      done()
    })
  })
  describe('#removeModifier', () => {
    it('removes a modifier from the modifiers array', (done) => {
      let attribute = new Attribute({})
      attribute.addModifier('foo', 'add', 10)
      attribute.removeModifier('foo')
      expect(attribute.modifiers.length).to.equal(0)
      done()
    })
    it('calls recalculate after removing the modifier', (done) => {
      let attribute = new Attribute({})
      let spy = sinon.spy(attribute, '_recalculate')
      attribute.addModifier('foo', 'add', 10)
      attribute.removeModifier('foo')
      expect(spy.calledTwice).to.equal(true)
      done()
    })
    it('throws an error if the modifier does not exist', (done) => {
      let attribute = new Attribute({})
      expect(() => { attribute.removeModifier('foo') }).to.throw('Modifier foo does not exist')
      done()
    })
  })
  describe('#removeAllModifiers', () => {
    it('empties the modifiers array', (done) => {
      let attribute = new Attribute({})
      attribute.addModifier('foo', 'add', 10)
      attribute.addModifier('foo', 'add', 10)
      attribute.removeAllModifiers()
      expect(attribute.modifiers.length).to.equal(0)
      done()
    })
    it('calls recalculate after removing the modifiers', (done) => {
      let attribute = new Attribute({})
      let spy = sinon.spy(attribute, '_recalculate')
      attribute.addModifier('foo', 'add', 10)
      attribute.removeAllModifiers()
      expect(spy.calledTwice).to.equal(true)
      done()
    })
  })
  describe('#updateModifier', () => {
    it('updates the value of a modifier', (done) => {
      let attribute = new Attribute({})
      attribute.addModifier('foo', 'add', 10)
      attribute.updateModifier('foo', 20)
      expect(attribute.modifiers[0].value).to.equal(20)
      done()
    }) 
    it('calls recalculate after updating the modifier', (done) => {
      let attribute = new Attribute({})
      let spy = sinon.spy(attribute, '_recalculate')
      attribute.addModifier('foo', 'add', 10)
      attribute.updateModifier('foo', 20)
      expect(spy.calledTwice).to.equal(true)
      done()
    })
    it('throws an error if the modifier does not exist', (done) => {
      let attribute = new Attribute({})
      expect(() => { attribute.updateModifier('foo', 20) }).to.throw('Modifier foo does not exist')
      done()
    })
  })
})
