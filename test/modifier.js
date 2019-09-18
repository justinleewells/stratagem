const Modifier = require('../lib/modifier')
const Strategy = require('../lib/strategy')
const expect = require('chai').expect

const trueCondition = {
  type: 'true',
  strategy: 'true'
}

const falseCondition = {
  type: 'false',
  strategy: 'true'
}

describe('Modifier', () => {
  beforeEach(() => {
    Modifier._empty()
  })
  before(() => {
    Strategy.define('true', () => true)
  })
  after(() => {
    Strategy._empty()
  })
  describe('#isInvocable', () => {
    it('returns true if all conditions evaluate to true', (done) => {
      Modifier.define(0, {
        conditions: [
          trueCondition,
          trueCondition
        ]
      })
      let modifier = Modifier.create(0, {})
      expect(modifier.isInvocable({})).to.be.true
      done()
    })
    it('returns false if any conditions evaluate to false', (done) => {
      Modifier.define(0, {
        conditions: [
          trueCondition,
          falseCondition
        ]
      })
      let modifier = Modifier.create(0, {})
      expect(modifier.isInvocable({})).to.be.false
      done()
    })
  })
})
