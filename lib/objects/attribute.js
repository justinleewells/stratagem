var config = require('../config');

/**
 * A Unit property that is an integer.
 * @class
 */
class Attribute {

  /** Creates a new Attribute and sets all values to zero. */
  constructor() {
    this._base = 0;
    this._current = 0;
    this._mod = 0;
  }

  /**
   * Internally calculates cureent based on the resModType 
   * configuration.
   * @function
   * @protected
   */
  _calcCurrent() {

    // calculate depending on resModType
    if (config.attrModType === 'integer') {
      this._current = this._base + this._mod;
    }
    else if (config.attrModType === 'percent') {
      this._current = this._base + (this._base * (this._mod / 100));
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
   * Sets base to value and recalculates current.
   * @param {Number} value - The number to set.
   */
  setBase(value) {
    this._base = value;
    this._calcCurrent();
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
    this._calcCurrent();
  }

  /**
   * Sets base to value. Sets current equal to base. Sets mod equal to zero.
   * @param {Number} value - The new value for base.
   */
  initialize(value) {
    this._base    = value;
    this._current = this._base;
    this._mod     = 0;
  }

}

module.exports = Attribute;