var should = require('should');
var config = require('../lib/config');
var API    = require('../index');

describe('API', function () {

  describe('#configure()', function () {

    it('should set modType', function (done) {
      API.configure({modType: 'percent'});
      config.modType.should.equal('percent');
      done();
    });

  });

});