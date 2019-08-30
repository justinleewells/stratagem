const Selection = require('../lib/selection')
const expect = require('chai').expect

describe('Selection', () => {
  describe('#constructor', () => {
    it('assigns entries to their associated key if an array is provided', (done) => {
      let selection = new Selection({test: [1, 2]})
      expect(selection.entries.test[0]).to.equal(1)
      expect(selection.entries.test[1]).to.equal(2)
      done()
    })
    it('wraps the provided value in an array if it is not already one', (done) => {
      let selection = new Selection({test: 1})
      expect(Array.isArray(selection.entries.test)).to.be.true
      expect(selection.entries.test[0]).to.equal(1)
      done()
    })
  })
  describe('#addEntry', () => {
    it('creates a new key in the entries field if it does not exist', (done) => {
      let selection = new Selection()
      selection.addEntries('test', [1])
      expect(selection.entries.test[0]).to.equal(1)
      done()
    })
    it('adds provided entries into the existing array if it already exists', (done) => {
      let selection = new Selection({test: [1]})
      selection.addEntries('test', [2])
      expect(selection.entries.test[0]).to.equal(1)
      expect(selection.entries.test[1]).to.equal(2)
      done()
    })
    it('wraps the provided value in an array if it is not already one', (done) => {
      let selection = new Selection()
      selection.addEntries('test', 1)
      expect(Array.isArray(selection.entries.test)).to.be.true
      expect(selection.entries.test[0]).to.equal(1)
      done()
    })
  })
})
