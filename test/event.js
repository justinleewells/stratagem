const Event = require('../lib/event')
const expect = require('chai').expect

describe('Event', () => {
  describe('#constructor', () => {
    it('creates a discrete attribute for each provided attribute', (done) => {
      let event = new Event({
        attributes: {
          power: 10,
          interruptible: false
        }
      })
      expect(event.attributes.power.current).to.equal(10)
      expect(event.attributes.interruptible.current).to.be.false
      console.log(event.serialize());
      done()
    })
  })
  describe('#cancel', () => {
    it('sets canceled to true', (done) => {
      let event = new Event({})
      event.cancel()
      expect(event.canceled).to.be.true
      done()
    })
  })
  describe('#setOrigin', () => {
    it('sets the origin to the provided object', (done) => {
      let event = new Event({})
      let origin = {}
      event.setOrigin(origin)
      expect(event.origin).to.equal(origin)
      done()
    })
  })
  describe('#addChild', () => {
    it('adds the child event to the children array', (done) => {
      let parent = new Event({})
      let child = new Event({})
      parent.addChild(child)
      expect(parent.children[0]).to.equal(child)
      done()
    })
  })
})
