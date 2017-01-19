var should = require('should');
var config = require('../lib/config');
var API    = require('../index');
var PropertyWrapper = require('../lib/objects/property-wrapper');

describe('PropertyWrapper', function () {

  describe('#constructor()', function () {

    it('should assign a Number value', function (done) {
      API.configure({unitProperties: {
        test: 'Number'
      }});
      var props = new PropertyWrapper();
      props.test.should.equal(0);
      done();
    });

    it('should assign a String value', function (done) {
      API.configure({unitProperties: {
        test: 'String'
      }});
      var props = new PropertyWrapper();
      props.test.should.equal('');
      done();
    });

    it('should assign a Null value', function (done) {
      API.configure({unitProperties: {
        test: 'Null'
      }});
      var props = new PropertyWrapper();
      should(props.test).not.be.ok();
      done();
    });

    it('should assign a Resource value', function (done) {
      var Resource = require('../lib/objects/resource');
      API.configure({unitProperties: {
        test: 'Resource'
      }});
      var props = new PropertyWrapper();
      should(props.test instanceof Resource).be.ok();
      done();
    });

    it('should assign an Attribute value', function (done) {
      var Attribute = require('../lib/objects/attribute');
      API.configure({unitProperties: {
        test: 'Attribute'
      }});
      var props = new PropertyWrapper();
      should(props.test instanceof Attribute).be.ok();
      done();
    });

    it('should set an unrecognized value to null', function (done) {
      var Resource = require('../lib/objects/resource');
      API.configure({unitProperties: {
        test: 'Blueberry'
      }});
      var props = new PropertyWrapper();
      should(props.test).not.be.ok();
      done();
    });

  });

});