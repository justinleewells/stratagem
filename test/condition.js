const Condition = require('../lib/condition')
const Strategy = require('../lib/strategy')
const expect = require('chai').expect

Strategy.define('false', () => false)
Strategy.define('true', () => true)
Strategy.define('context', (context) => context.return)
Strategy.define('values', (context, b) => b)

describe('Condition', () => {
  describe('#evaluate', () => {
    describe('true', () => {
      it('returns true for a truthy strategy', (done) => {
        let condition = new Condition({
          type: 'true',
          strategy: 'true'
        })
        expect(condition.evaluate({})).to.be.true
        done()
      })
      it('returns false for a falsey strategy', (done) => {
        let condition = new Condition({
          type: 'true',
          strategy: 'false'
        })
        expect(condition.evaluate({})).to.be.false
        done()
      })
      it('passes the context to the strategy', (done) => {
        let condition = new Condition({
          type: 'true',
          strategy: 'context'
        })
        expect(condition.evaluate({return: true})).to.be.true
        done()
      })
      it('passes the values to the strategy', (done) => {
        let condition = new Condition({
          type: 'true',
          strategy: 'values',
          values: [
            {
              type: 'static',
              static: true
            }
          ]
        })
        expect(condition.evaluate({})).to.be.true
        done()
      })
    })
    describe('false', () => {
      it('returns false for a truthy strategy', (done) => {
        let condition = new Condition({
          type: 'false',
          strategy: 'true'
        })
        expect(condition.evaluate({})).to.be.false
        done()
      })
      it('returns true for a falsey strategy', (done) => {
        let condition = new Condition({
          type: 'false',
          strategy: 'false'
        })
        expect(condition.evaluate({})).to.be.true
        done()
      })
      it('passes the context to the strategy', (done) => {
        let condition = new Condition({
          type: 'false',
          strategy: 'context'
        })
        expect(condition.evaluate({return: false})).to.be.true
        done()
      })
      it('passes the values to the strategy', (done) => {
        let condition = new Condition({
          type: 'false',
          strategy: 'values',
          values: [
            {
              type: 'static',
              static: false
            }
          ]
        })
        expect(condition.evaluate({})).to.be.true
        done()
      })
    })
    describe('and', () => {
      it('returns true if all subconditions are true', (done) => {
        let condition = new Condition({
          type: 'and',
          conditions: [
            {
              type: 'true',
              strategy: 'true'
            },
            {
              type: 'true',
              strategy: 'true'
            }
          ]
        })
        expect(condition.evaluate({})).to.be.true
        done()
      })
      it('returns false if any subconditions are false', (done) => {
        let condition = new Condition({
          type: 'and',
          conditions: [
            {
              type: 'true',
              strategy: 'true'
            },
            {
              type: 'true',
              strategy: 'false'
            }
          ]
        })
        expect(condition.evaluate({})).to.be.false
        done()
      })
      it('passes the context to subconditions', (done) => {
        let condition = new Condition({
          type: 'and',
          conditions: [
            {
              type: 'true',
              strategy: 'context'
            },
            {
              type: 'true',
              strategy: 'context'
            }
          ]
        })
        expect(condition.evaluate({return: true})).to.be.true
        done()
      })
    })
    describe('or', () => {
      it('returns true if any subcondition is true', (done) => {
        let condition = new Condition({
          type: 'or',
          conditions: [
            {
              type: 'true',
              strategy: 'true'
            },
            {
              type: 'true',
              strategy: 'false'
            }
          ]
        })
        expect(condition.evaluate({})).to.be.true
        done()
      })
      it('returns true if all subconditions are false', (done) => {
        let condition = new Condition({
          type: 'or',
          conditions: [
            {
              type: 'true',
              strategy: 'false'
            },
            {
              type: 'true',
              strategy: 'false'
            }
          ]
        })
        expect(condition.evaluate({})).to.be.false
        done()
      })
      it('passes the context to subconditions', (done) => {
        let condition = new Condition({
          type: 'or',
          conditions: [
            {
              type: 'true',
              strategy: 'context'
            },
            {
              type: 'true',
              strategy: 'context'
            }
          ]
        })
        expect(condition.evaluate({return: true})).to.be.true
        done()
      })
    })
    describe('xor', (done) => {
      it('returns true if only one condition is true', (done) => {
        let condition = new Condition({
          type: 'or',
          conditions: [
            {
              type: 'true',
              strategy: 'true'
            },
            {
              type: 'true',
              strategy: 'false'
            },
            {
              type: 'true',
              strategy: 'false'
            }
          ]
        })
        expect(condition.evaluate({})).to.be.true
        done()
      })
      it('returns false if multiple conditions are true', (done) => {
        let condition = new Condition({
          type: 'xor',
          conditions: [
            {
              type: 'true',
              strategy: 'true'
            },
            {
              type: 'true',
              strategy: 'true'
            },
            {
              type: 'true',
              strategy: 'false'
            }
          ]
        })
        expect(condition.evaluate({})).to.be.false
        done()
      })
      it('passes context to subconditions', (done) => {
        let condition = new Condition({
          type: 'xor',
          conditions: [
            {
              type: 'true',
              strategy: 'true'
            },
            {
              type: 'true',
              strategy: 'context'
            },
            {
              type: 'true',
              strategy: 'context'
            }
          ]
        })
        expect(condition.evaluate({return: false})).to.be.true
        done()
      })
    })
  })
})
