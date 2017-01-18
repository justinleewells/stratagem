var should = require('should');
var config = require('../lib/config');
var Attribute = require('../lib/objects/attribute');

describe('Attribute', function () {

  describe('#getBase()', function () {

    it('should return the base value', function (done) {
      var attribute = new Attribute();
      attribute.getBase().should.equal(0);
      done();
    });

  });

  describe('#setBase()', function () {

    it('should set the base value', function (done) {
      config.attrModType = 'integer';
      var attribute = new Attribute();
      attribute.setBase(10);
      attribute.getBase().should.equal(10);
      done();
    });

    it('should recalculate the current value', function (done) {
      config.attrModType = 'integer';
      var attribute = new Attribute();
      attribute.initialize(10);
      attribute.setMod(50);
      attribute.setBase(5);
      attribute.getCurrent().should.equal(55);
      done();
    });

  });

  describe('#getCurrent()', function () {

    it('should return the base value', function (done) {
      var attribute = new Attribute();
      attribute.getCurrent().should.equal(0);
      done();
    });

  });

  describe('#getBase()', function () {

    it('should return the base value', function (done) {
      var attribute = new Attribute();
      attribute.getBase().should.equal(0);
      done();
    });

  });

  describe('#setMod()', function () {

    it('should set the mod value', function (done) {
      config.attrModType = 'integer';
      var attribute = new Attribute();
      attribute.setMod(10);
      attribute.getMod().should.equal(10);
      done();
    });

    it('should recalculate the current value', function (done) {
      config.attrModType = 'integer';
      var attribute = new Attribute();
      attribute.initialize(10);
      attribute.setMod(50);
      attribute.getCurrent().should.equal(60);
      done();
    });

  });

  describe('#initialize()', function () {

    it('should set the base value', function (done) {
      var attribute = new Attribute();
      attribute.initialize(10);
      attribute.getBase().should.equal(10);
      done();
    });

    it('should set the current value', function (done) {
      var attribute = new Attribute();
      attribute.initialize(10);
      attribute.getCurrent().should.equal(10);
      done();
    });

    it('should reset the mod value', function (done) {
      var attribute = new Attribute();
      attribute.setMod(10);
      attribute.initialize(10);
      attribute.getMod().should.equal(0);
      done();
    });

  });

});