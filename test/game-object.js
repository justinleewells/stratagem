const GameObject = require('../lib/game-object')
const Serializable = require('serializable-class')

const expect = require('chai').expect
const sinon = require('sinon')

class A extends GameObject {
  constructor(id, state, data) {
    super(id, state)
    this.data = data
  }
  static format(data) {
    return {
      a: data.a + '+a'
    }
  }
}
Serializable.register(A)

class B extends GameObject {
  constructor(id, state, data) {
    super(id, state)
    this.data = data
  }
  static format(data) {
    return {
      b: data.b + '+b'
    }
  }
}
Serializable.register(B)

describe('GameObject', () => {
  beforeEach(() => {
    GameObject._empty()
  })
  describe('#define', () => {
    it('saves the data in the objects object', (done) => {
      A.define(0, {})
      expect(GameObject._objects().A[0]).to.not.be.null
      done()
    })
    it('throws an error if the provided id is already defined', (done) => {
      A.define(0, {})
      expect(() => { A.define(0, {}) }).to.throw('A+0 is already defined')
      done()
    })
    it('does not throw an error if an id is registered for two different classes', (done) => {
      A.define(0, {})
      expect(() => { B.define(0, {}) }).to.not.throw('B+0 is already defined')
      done()
    })
    it('calls format when saving the data', (done) => {
      let spy = sinon.spy(A, 'format')
      A.define(0, {})
      expect(spy.calledOnce).to.be.true
      done()
    })
  })
  describe('#create', () => {
    it('returns a newly constructed object with the data that was defined', (done) => {
      A.define(0, {a: 'foo'})
      let a = A.create(0, {b: 'bar'})
      expect(a.data.a).to.equal('foo+a')
      expect(a.state.b).to.equal('bar')
      done()
    })
    it('throws an error if no objects are defined for the provided class', (done) => {
      expect(() => { A.create(0, {}) }).to.throw('A+0 is undefined')
      done()
    })
    it('throws an error if no object is defined for the provided id', (done) => {
      A.define(1, {})
      expect(() => { A.create(0, {}) }).to.throw('A+0 is undefined')
      done()
    })
  })
  describe('#get', () => {
    it('returns the data that was previously defined', (done) => {
      A.define(0, {a: 'foo'})
      let data = A.get(0)
      expect(data.a).to.equal('foo+a')
      done()
    })
    it('throws an error if the data is not defined', (done) => {
      expect(() => { A.get(0) }).to.throw('A+0 is undefined')
      done()
    })
  })
})
