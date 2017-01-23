var config = require('../config');

// Libraries
var _ = require('lodash');

// Objects
var Resource = require('./resource');
var Attribute = require('./attribute');

/**
 * Holds and creates all default unit properties.
 * @class
 */
class PropertyWrapper {

  /**
   * Iterates through each property in the unitProperties
   * configuration value and initializes the property with
   * the specified default value type. Logs a warning if an unsupported
   * default value is provided.
   * @function
   */
  constructor() {
    _.forEach(config.unitProperties, (value, key) => {
      switch(value) {
        case 'Number':
          this[key] = 0;
          break;
        case 'String':
          this[key] = '';
          break;
        case 'Null':
          this[key] = null;
          break;
        case 'Resource':
          this[key] = new Resource();
          break;
        case 'Attribute':
          this[key] = new Attribute();
          break;
        default:
          console.warn("An unsupported property type of " + value + " was provided for " + key);
          this[key] = null;
      }
    });
  }
  
}

module.exports = PropertyWrapper;