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
  describe('#assignFunction', () => {
    it('returns an object with the provided function called for each property of the provided object', (done) => {
      let result = Utils.assignFunction((v) => v + 1, {a: 1, b: 2})
      expect(result.a).to.equal(2)
      expect(result.b).to.equal(3)
      done()
    })
    it('returns an empty object if a null value is provided', (done) => {
      let result = Utils.assignFunction((v) => v + 1, null)
      expect(Object.keys(result).length).to.equal(0)
      done()
    })
  })
  describe('#assignClass', () => {
    it('returns an object with the provided class instantiated for each of the values in the provided object', (done) => {
      let result = Utils.assignClass(A, {a: {x: 1, y: 2}, b: {x: 3, y: 4}})
      expect(result.a.x).to.equal(1)
      expect(result.a.y).to.equal(2)
      expect(result.b.x).to.equal(3)
      expect(result.b.y).to.equal(4)
      done()
    })
    it('returns an empty object if a null value is provided', (done) => {
      let result = Utils.assignClass(A, null)
      expect(Object.keys(result).length).to.equal(0)
      done()
    })
  })
})
