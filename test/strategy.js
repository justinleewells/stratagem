const Strategy = require('../lib/strategy')
const expect = require('chai').expect

describe('Strategy', () => {
  beforeEach(() => {
    Strategy._empty()
  })
  describe('#define', () => {
    it('saves the function', (done) => {
      let foo = () => 'foo'
      Strategy.define('foo', foo)
      expect(Strategy._strategies().foo).to.equal(foo)
      done()
    })
    it('throws an error if the strategy is already defined', (done) => {
      let foo = () => 'foo'
      Strategy.define('foo', foo)
      expect(() => { Strategy.define('foo', foo) }).to.throw('Strategy foo is already defined')
      done()
    })
  })
  describe('#invoke', () => {
    it('returns the result of the invoked strategy', (done) => {
      let foo = () => 'foo'
      Strategy.define('foo', foo)
      expect(Strategy.invoke('foo', {}, [])).to.equal('foo')
      done()
    })
    it('passes the context to the invoked strategy', (done) => {
      let foo = (context) => context.bar
      Strategy.define('foo', foo)
      expect(Strategy.invoke('foo', {bar: 'bar'}, [])).to.equal('bar')
      done()
    })
    it('expands the values when calling the invoked strategy', (done) => {
      let foo = (context, a, b) => a + b
      Strategy.define('foo', foo)
      expect(Strategy.invoke('foo', {}, [1, 2])).to.equal(3)
      done()
    })
    it('throws an error if the strategy is undefined', (done) => {
      expect(() => { Strategy.invoke('foo', {}, []) }).to.throw('Strategy foo is undefined')
      done()
    })
  })
})
