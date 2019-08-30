const Selector = require('../lib/selector')
const expect = require('chai').expect

describe('Selector', () => {
  beforeEach(() => {
    Selector._empty()
  })
  describe('#define', () => {
    it('saves the function', (done) => {
      let foo = () => 'foo'
      Selector.define('foo', foo)
      expect(Selector._selectors().foo).to.equal(foo)
      done()
    })
    it('throws an error if the selector is already defined', (done) => {
      let foo = () => 'foo'
      Selector.define('foo', foo)
      expect(() => { Selector.define('foo', foo) }).to.throw('Selector foo is already defined')
      done()
    })
  })
  describe('#invoke', () => {
    it('returns the result of the invoked selector', (done) => {
      let foo = () => 'foo'
      Selector.define('foo', foo)
      expect(Selector.invoke('foo', {}, {})).to.equal('foo')
      done()
    })
    it('passes the context and input to the invoked selector', (done) => {
      let foo = (context, input) => context.a + input.b
      Selector.define('foo', foo)
      expect(Selector.invoke('foo', {a: 1}, {b: 2})).to.equal(3)
      done()
    })
    it('throws an error if the selector is undefined', (done) => {
      expect(() => { Selector.invoke('foo', {}, []) }).to.throw('Selector foo is undefined')
      done()
    })
  })
})
