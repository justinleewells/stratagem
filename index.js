'use strict';

// Libraries
var _ = require('lodash');

// Objects
var config = require('./lib/config');

/**
 * Namespace that exposes all functions available to the programmer.
 * @namespace
 */
const API = {

  /**
   * Allows the programmer to customize the framework
   * @function
   * @param {Object} opts - The configuration object
   */
  configure: (opts) => {
    var values = _.pick(opts, ['resModType']);
    _.forEach(values, (value, key) => {
      config[key] = value;
    });
  }

};

module.exports = API;