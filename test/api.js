var should = require('should');
var config = require('../lib/config');
var API    = require('../index');

describe('API', function () {

  describe('#configure()', function () {

    it('should set resModType', function (done) {
      API.configure({resModType: 'percent'});
      config.resModType.should.equal('percent');
      done();
    });

    it('should set attrModType', function (done) {
      API.configure({attrModType: 'percent'});
      config.attrModType.should.equal('percent');
      done();
    });

    it('should set addResourceDiff', function (done) {
      API.configure({addResourceDiff: false});
      config.addResourceDiff.should.equal(false);
      done();
    });

    it('should set unitProperties', function (done) {
      API.configure({unitProperties: {name: 'String'}});
      config.unitProperties.name.should.equal('String');
      done();
    });

  });

});