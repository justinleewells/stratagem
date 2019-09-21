const Value = require('../lib/value')
const Strategy = require('../lib/strategy')
const expect = require('chai').expect

describe('Value', () => {
  describe('#constructor', () => {
    it('sets the static value if a non-object argument is passed', (done) => {
      let value = new Value(10)
      expect(value.static).to.equal(10)
      done()
    })
  })
  describe('#transform', () => {
    it('returns the static value if it is a static type', (done) => {
      let value = new Value({
        type: 'static',
        static: 10
      })
      expect(value.transform({})).to.equal(10)
      done()
    })
    it('returns the path of a context object if it is a path type', (done) => {
      let value = new Value({
        type: 'path',
        path: 'a.b.c'
      })
      let context = {a: {b: {c: 1}}}
      expect(value.transform(context)).to.equal(1)
      done()
    })
    it('returns undefined if the path does not exist', (done) => {
      let value = new Value({
        type: 'path',
        path: 'a.b.c'
      })
      expect(value.transform({})).to.equal(undefined)
      done()
    })
    it('returns the result of a strategy if it is a strategy type', (done) => {
      Strategy.define('foo', (context, a, b) => a + b)
      let value = new Value({
        type: 'strategy',
        strategy: 'foo',
        values: [
          {
            type: 'static',
            static: 1
          },
          {
            type: 'static',
            static: 2
          }
        ]
      })
      expect(value.transform({})).to.equal(3)
      done()
    })
    it('returns null if any other type is provided', (done) => {
      let value = new Value({
        type: 'foo'
      })
      expect(value.transform({})).to.equal(null)
      done()
    })
  })
})
