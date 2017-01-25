var should = require('should');
var config = require('../lib/config');
var API    = require('../index');
var Event  = require('../lib/objects/event');
var EventWrapper = require('../lib/objects/event-wrapper');

describe('EventWrapper', function () {

  var TestEvent = new Event();
  TestEvent.execute = function () {
    return {id: 'test'};
  }
  TestEvent = Object.freeze(TestEvent);

  describe('#constructor()', function () {

    it('should create an array for the provided keys', function (done) {
      API.configure({unitEvents: ["Attack", "Defend"]});
      var events = new EventWrapper();
      Object.prototype.toString.call(events.evs.Attack).should.equal('[object Array]');
      Object.prototype.toString.call(events.evs.Defend).should.equal('[object Array]');
      done();
    });

  });

  describe('#addEvent()', function () {

    it('should add an event', function (done) {
      API.configure({unitEvents: ["Attack", "Defend"]});
      var events = new EventWrapper();
      events.addEvent('Attack', TestEvent);
      events.evs.Attack.length.should.equal(1);
      done();
    });

  });

  describe('#removeEvent()', function () {

    it('should remove an event', function (done) {
      API.configure({unitEvents: ["Attack", "Defend"]});
      var events = new EventWrapper();
      events.addEvent('Attack', TestEvent);
      events.removeEvent('Attack', TestEvent);
      events.evs.Attack.length.should.equal(0);
      done();
    });

  });

  describe('#execute()', function () {

    it('should execute an event and return a single object in an array', function (done) {
      API.configure({unitEvents: ["Attack", "Defend"]});
      var events = new EventWrapper();
      events.addEvent('Attack', TestEvent);
      var result = events.execute('Attack');
      result.length.should.equal(1);
      result[0].id.should.equal('test');
      done();
    });

  });

});