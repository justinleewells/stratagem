var config = require('../config');

/**
 * A unit property that may differ in current and maximum value.
 * @class
 */
class Resource {

  /** Creates a new resource and sets all values to zero. */
  constructor() {
    this._base    = 0;
    this._current = 0;
    this._max     = 0;
    this._mod     = 0;
  }

  /**
   * Internally calculates maximum based on the modType 
   * configuration.
   * If the addResourceDiff configuration is true, any positive
   * change is added to current.
   * @function
   * @protected
   */
  _calcMax() {

    let m = this._max;

    // calculate depending on modType
    if (config.modType === 'integer') {
      this._max = this._base + this._mod;
    }
    else if (config.modType === 'percent') {
      this._max = this._base + (this._base * (this._mod / 100));
    }

    // adjust current depending on the new max
    if (m < this._max) {
      if (config.addResourceDiff) {
        this._current += this._max - m;
      }
    }
    else {
      if (this._current > this._max) {
        this._current = this._max;
      }
    }

  }
  
  /**
   * Returns base.
   * @return {Number} 
   */
  getBase() {
    return this._base;
  }

  /**
   * Sets base to value and recalculates maximum.
   * @param {Number} value - The number to set.
   */
  setBase(value) {
    this._base = value;
    this._calcMax();
  }

  /**
   * Returns current.
   * @return {Number} 
   */
  getCurrent() {
    return this._current;
  }

  /**
   * Sets current to value.
   * @param {Number} value - The number to set.
   */
  setCurrent(value) {
    this._current = value;
    if (this._current > this._max) {
      this._current = this._max;
    }
  }

  /**
   * Returns maximum.
   * @return {Number} 
   */
  getMaximum() {
    return this._max;
  }

  /**
   * Returns mod.
   * @return {Number} 
   */
  getMod() {
    return this._mod;
  }

  /**
   * Sets mod to value and recalculates maximum.
   * @param {Number} value - The number to set.
   */
  setMod(value) {
    this._mod = value;
    this._calcMax();
  }

  /**
   * Sets base to value. Sets max and current equal to base. Sets mod equal to zero.
   * @param {Number} value - The new value for base.
   */
  initialize(value) {
    this._base    = value;
    this._current = this._base;
    this._max     = this._base;
    this._mod     = 0;
  }

}

module.exports = Resource;