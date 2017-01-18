var should = require('should');
var config = require('../lib/config');
var Resource = require('../lib/objects/resource');

describe('Resource', function () {

  describe('#getBase()', function () {

    it('should return the base value', function (done) {
      var resource = new Resource();
      resource.getBase().should.equal(0);
      done();
    });

  });

  describe('#getCurrent()', function () {

    it('should return the current value', function (done) {
      var resource = new Resource();
      resource.getCurrent().should.equal(0);
      done();
    });

  });

  describe('#getMax()', function () {

    it('should return the maximum value', function (done) {
      var resource = new Resource();
      resource.getMaximum().should.equal(0);
      done();
    });

  });

  describe('#getMod()', function () {

    it('should return the mod value', function (done) {
      var resource = new Resource();
      resource.getMod().should.equal(0);
      done();
    });

  });

  describe('#initialize()', function () {

    it('should set the base value', function (done) {
      var resource = new Resource();
      resource.initialize(10);
      resource.getBase().should.equal(10);
      done();
    });

    it('should set the current value', function (done) {
      var resource = new Resource();
      resource.initialize(10);
      resource.getCurrent().should.equal(10);
      done();
    });

    it('should set the maximum value', function (done) {
      var resource = new Resource();
      resource.initialize(10);
      resource.getMaximum().should.equal(10);
      done();
    });

    it('should reset the mod value', function (done) {
      var resource = new Resource();
      resource.addMod(10);
      resource.initialize(10);
      resource.getMod().should.equal(0);
      done();
    });

  });

  describe('#addMod()', function () {

    it('should add the mod value', function (done) {
      config.modType = 'integer';
      var resource = new Resource();
      resource.initialize(10);
      resource.addMod(50);
      resource.getMod().should.equal(50);
      done();
    });

    it('should recalculate the max value', function (done) {
      config.modType = 'integer';
      var resource = new Resource();
      resource.initialize(10);
      resource.addMod(50);
      resource.getMaximum().should.equal(60);
      done();
    });

  });

});