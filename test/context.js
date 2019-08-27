const Context = require('../lib/context')
const expect = require('chai').expect

describe('Context', () => {
  describe('#setProperty', () => {
    it('sets key to value in the properties object', (done) => {
      let context = new Context({})
      context.setProperty('foo', 'bar')
      expect(context.properties.foo).to.equal('bar')
      done()
    })
  })
  describe('#getProperty', () => {
    it('returns the value in the properties object', (done) => {
      let context = new Context({})
      context.properties.foo = 'bar'
      expect(context.getProperty('foo')).to.equal('bar')
      done()
    })
  })
  describe('#deleteProperty', () => {
    it('deletes key from the properties object', (done) => {
      let context = new Context({properties: {foo: 'bar'}})
      context.deleteProperty('foo')
      expect(context.properties.foo).to.equal(undefined)
      done()
    })
  })
  describe('#clone', () => {
    it('assigns the same instance to the new context', (done) => {
      let instance = {}
      let context = new Context({instance: instance})
      let clone = context.clone()
      expect(clone.instance).to.equal(instance)
      done()
    })
    it('creates a new properties object', (done) => {
      let context = new Context({properties: {foo: 'bar'}})
      let clone = context.clone()
      context.properties.foo = 'baz'
      expect(clone.properties.foo).to.equal('bar')
      done()
    })
  })
})
