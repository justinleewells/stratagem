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

  });

});