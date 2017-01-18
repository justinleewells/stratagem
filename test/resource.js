var should = require('should');
var config = require('../lib/config');
var Resource = require('../lib/objects/resource');

describe('Resource', function () {

  var resource = new Resource();

  describe('#calcMax()', function () {

    it('should calculate properly with integers', function (done) {
      config.modType = 'integer';
      resource.base = 10;
      resource.mod = 5;
      resource.calcMax();
      resource.max.should.equal(15);
      done();
    });

    it('should calculate properly with percentages', function (done) {
      config.modType = 'percent';
      resource.base = 10;
      resource.mod = 100;
      resource.calcMax();
      resource.max.should.equal(20);
      done();
    });

  });

  describe('#initialize()', function () {

    it('should set the base value', function (done) {
      resource.initialize(10);
      resource.base.should.equal(10);
      done();
    });

    it('should set the max value', function (done) {
      resource.initialize(20);
      resource.max.should.equal(20);
      done();
    });

    it('should set the current value', function (done) {
      resource.initialize(30);
      resource.current.should.equal(30);
      done();
    });

    it('should reset the mod value', function (done) {
      resource.initialize(40);
      resource.mod.should.equal(0);
      done();
    });

  });

});