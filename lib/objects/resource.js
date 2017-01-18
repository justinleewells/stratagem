var config = require('../config');

/**
 * Class representing a unit property that may differ in
 * current and maximum value.
 * @class
 */
class Resource {

  /**
   * Internally calculates the maximum value based on the modType 
   * configuration.
   * @function
   * @protected
   */
  _calcMax() {
    if (config.modType === 'integer') {
      this._max = this._base + this._mod;
    }
    else if (config.modType === 'percent') {
      this._max = this._base + (this._base * (this._mod / 100));
    }
  }

  /** Creates a new resource. */
  constructor() {
    /** @protected */
    this._base    = 0;
    /** @protected */
    this._current = 0;
    /** @protected */
    this._max     = 0;
    /** @protected */
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
   * Sets the base value. Copies max and current from base. Mod is reset to 0.
   * @param {Number} value - The number to set base to.
   */
  initialize(value) {
    this._base    = value;
    this._current = this._base;
    this._max     = this._base;
    this._mod     = 0;
  }

  /**
   * Adds to the mod value and recalculates the maximum value.
   * If the addResourceDiff configuration value is true, then the
   * difference is added to the current value.
   * @param {Number} value - The number to add.
   */
  addMod(value) {
    this._mod += value;
    let m = this._max;
    this._calcMax();
    if (config.addResourceDiff) {
      this._current += this._max - m;
    }
  }

  /**
   * Subtracts from the mod value and recalculates the maximum value.
   * @param {Number} value - The number to substract.
   */
  subtractMod(value) {
    this._mod -= value;
    this.calcMax();
    if (this._current > this._max) {
      this._current = this._max;
    }
  }

}

module.exports = Resource;