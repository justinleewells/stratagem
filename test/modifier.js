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
  before(() => {
    Strategy.define('true', () => true)
  })
  after(() => {
    Strategy._empty()
  })
  describe('#isInvocable', () => {
    it('returns true if all conditions evaluate to true', (done) => {
      let modifier = new Modifier({
        conditions: [
          trueCondition,
          trueCondition
        ]
      })
      expect(modifier.isInvocable({})).to.be.true
      done()
    })
    it('returns false if any conditions evaluate to false', (done) => {
      let modifier = new Modifier({
        conditions: [
          trueCondition,
          falseCondition
        ]
      })
      expect(modifier.isInvocable({})).to.be.false
      done()
    })
  })
})
