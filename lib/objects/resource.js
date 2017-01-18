var config = require('../config');

/**
 * Class representing a unit property that may differ in
 * current and maximum value.
 * @class
 */
class Resource {

  /** Creates a new resource. */
  constructor() {
    this._base    = 0;
    this._current = 0;
    this._max     = 0;
    this._mod     = 0;
  }
  
  /**
   * Returns the base value
   * @return {Number} 
   */
  getBase() {
    return this._base;
  }

  /**
   * Returns the current value
   * @return {Number} 
   */
  getCurrent() {
    return this._current;
  }

  /**
   * Returns the maximum value
   * @return {Number} 
   */
  getMaximum() {
    return this._max;
  }

  /**
   * Returns the mod value
   * @return {Number} 
   */
  getMod() {
    return this._mod;
  }

  /**
   * Sets the base value, which is then copied to the max and
   * current values. Mod is reset to 0.
   * @function
   */
  initialize(base) {
    this._base    = base;
    this._current = this._base;
    this._max     = this._base;
    this._mod     = 0;
  }

  /**
   * Internally calculates the maximum value based on the modType 
   * configuration.
   * @function
   */
  calcMax() {
    if (config.modType === 'integer') {
      this._max = this._base + this._mod;
    }
    else if (config.modType === 'percent') {
      this._max = this._base + (this._base * (this._mod / 100));
    }
  }

}

module.exports = Resource;