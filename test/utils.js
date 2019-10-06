const Utils = require('../lib/utils')
const expect = require('chai').expect
const sinon = require('sinon')

class A {
  constructor({x, y}) {
    Object.assign(this, {x, y})
  }
  toJSON() {
    return {
      x: this.x,
      y: this.y
    }
  }
}

class B {
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
  describe('#exportAsJSON', () => {
    it('calls toJSON on the object if the method exists', (done) => {
      let spy = sinon.spy(A.prototype, 'toJSON')
      let a = new A({x: 0, y: 1})
      let json = Utils.exportAsJSON(a)
      expect(spy.calledOnce).to.be.true
      expect(json instanceof Object).to.be.true
      expect(json.x).to.equal(a.x)
      expect(json.y).to.equal(a.y)
      spy.restore()
      done()
    })
    it('maps the result of calling toJSON on each element if an array is provided', (done) => {
      let spy = sinon.spy(A.prototype, 'toJSON')
      let a1 = new A({x: 0, y: 1})
      let a2 = new A({x: 2, y: 3})
      let arr = [a1, a2]
      let json = Utils.exportAsJSON(arr)
      expect(spy.calledTwice).to.be.true
      expect(json[0].x).to.equal(a1.x)
      expect(json[0].y).to.equal(a1.y)
      expect(json[0] instanceof Object).to.be.true
      expect(json[1].x).to.equal(a2.x)
      expect(json[1].y).to.equal(a2.y)
      expect(json[1] instanceof Object).to.be.true
      spy.restore()
      done()
    })
    it('calls assignFunction on the provided object if toJSON is undefined', (done) => {
      let spy = sinon.spy(A.prototype, 'toJSON')
      let a = {
        b: new A({x: 0, y: 1})
      }
      let json = Utils.exportAsJSON(a)
      expect(spy.calledOnce).to.be.true
      expect(json.b instanceof Object).to.be.true
      done()
    })
    it('returns the provided value if it is a string', (done) => {
      expect(Utils.exportAsJSON('a')).to.equal('a')
      done()
    })
    it('returns the provided value if it is a number', (done) => {
      expect(Utils.exportAsJSON(1)).to.equal(1)
      done()
    })
  })
})
