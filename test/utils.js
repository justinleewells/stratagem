const Utils = require('../lib/utils')
const expect = require('chai').expect

class A {
  constructor({x, y}) {
    Object.assign(this, {x, y})
  }
}

describe('Utils', () => {
  describe('#mapClass', () => {
    it('returns an array of new instantiated classes', (done) => {
      let result = Utils.mapClass(A, [{x: 1, y: 2}, {x: 3, y: 4}])
      expect(result[0].x).to.equal(1)
      expect(result[0].y).to.equal(2)
      expect(result[1].x).to.equal(3)
      expect(result[1].y).to.equal(4)
      done()
    })
    it('returns an empty array if null is provided', (done) => {
      let result = Utils.mapClass(A, null)
      expect(result.length).to.equal(0)
      done()
    })
  })
})
