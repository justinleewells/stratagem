'use strict';

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
    let keys = Object.keys(config);
    let values = keys.reduce(function (obj, key) {
      if (opts[key] !== undefined) obj[key] = opts[key];
      return obj;
    }, {});
    for (let key in values) {
      config[key] = values[key];
    }
  }

};

module.exports = API;