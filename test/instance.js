const Instance = require('../lib/instance')
const Unit = require('../lib/unit')

const expect = require('chai').expect

describe('Instance', () => {
  describe('#addUnit', () => {
    it('adds the unit to the units array', (done) => {
      let instance = new Instance()
      let unit = new Unit({})
      instance.addUnit(unit)
      expect(instance.units[0]).to.equal(unit)
      done()
    })
  })
  describe('#findUnit', () => {
    it('returns the unit if it exists', (done) => {
      let unit = new Unit({id: 0})
      let instance = new Instance([unit])
      expect(instance.findUnit(0)).to.equal(unit)
      done()
    })
    it('returns null if the unit does not exist', (done) => {
      let unit = new Unit({id: 0})
      let instance = new Instance([unit])
      expect(instance.findUnit(1)).to.equal(undefined)
      done()
    })
  })
  describe('#removeUnit', () => {
    it('removes the unit from the units array', (done) => {
      let instance = new Instance([new Unit({id: 0})])
      instance.removeUnit(0)
      expect(instance.units.length).to.equal(0)
      done()
    })
    it('does nothing if the unit does not exist', (done) => {
      let instance = new Instance([new Unit({id: 0})])
      instance.removeUnit(1)
      expect(instance.units.length).to.equal(1)
      done()
    })
  })
  describe('#getTeam', () => {
    it('returns all units on the specified team', (done) => {
      let unitA = new Unit({team: 'a'})
      let unitB = new Unit({team: 'b'})
      let instance = new Instance([unitA, unitB])
      expect(instance.getTeam('a')[0]).to.equal(unitA)
      done()
    })
  })
})
