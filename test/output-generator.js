const OutputGenerator = require('../lib/output-generator')
const Event = require('../lib/event')

const expect = require('chai').expect

describe('OutputGenerator', () => {
  describe('#start', () => {
    it('assigns the event to head if it is the first time calling start for the current event chain', (done) => {
      let generator = new OutputGenerator()
      let event = new Event({type: 'foo'})
      generator.start(event)
      expect(generator.head).to.equal(event)
      done()
    })
    it('assigns the event to current', (done) => {
      let generator = new OutputGenerator()
      let event = new Event({type: 'foo'})
      generator.start(event)
      expect(generator.current).to.equal(event)
      done()
    })
    it('adds the provided event to the current events children array if a current event exists', (done) => {
      let generator = new OutputGenerator()
      let parentEvent = new Event({type: 'parent'})
      let childEvent = new Event({type: 'child'})
      generator.start(parentEvent)
      generator.start(childEvent)
      expect(parentEvent.children[0]).to.equal(childEvent)
      done()
    })
    it('sets the current event as the provided events parent if a current event exists', (done) => {
      let generator = new OutputGenerator()
      let parentEvent = new Event({type: 'parent'})
      let childEvent = new Event({type: 'child'})
      generator.start(parentEvent)
      generator.start(childEvent)
      expect(childEvent.parent).to.equal(parentEvent)
      done()
    })
  })
  describe('#end', (done) => {
    it('assigns the current event to result if it is the head', (done) => {
      let generator = new OutputGenerator()
      let event = new Event({type: 'foo'})
      generator.start(event)
      generator.finish()
      expect(generator.result).to.equal(event)
      done()
    })
    it('assigns the current events parent to current if it is not the head', (done) => {
      let generator = new OutputGenerator()
      let parentEvent = new Event({type: 'parent'})
      let childEvent = new Event({type: 'child'})
      generator.start(parentEvent)
      generator.start(childEvent)
      generator.finish()
      expect(generator.current).to.equal(parentEvent)
      done()
    })
  })
})
