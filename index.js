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
   * @param {Object} opts - The configuration object.
   * @param {string} opts.modType - Determines if integers or percentages are
   *                 used for attribute and resource modifications. Accepts 'integer' and
   *                 'percent'.
   */
  configure: (opts) => {
    var values = _.pick(opts, ['modType']);
    _.forEach(values, (value, key) => {
      config[key] = value;
    });
  }

};

module.exports = API;