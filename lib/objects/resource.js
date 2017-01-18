var config = require('../config');

/**
 * Class representing a unit property that may differ in
 * current and maximum value.
 * @class
 */
class Resource {

  /** Creates a new resource. */
  constructor() {
    this.base = 0;
    this.current = 0;
    this.max = 0;
    this.mod = 0;
  }

  /**
   * Sets the base value, which is then copied to the max and
   * current values. Mod is reset to 0.
   * @function
   */
  initialize(base) {
    this.base = base;
    this.current = this.base;
    this.max = this.base;
    this.mod = 0;
  }

  /**
   * Calculates the maximum value based on the modType configuration.
   * @function
   */
  calcMax() {
    if (config.modType === 'integer') {
      this.max = this.base + this.mod;
    }
    else if (config.modType === 'percent') {
      this.max = this.base + (this.base * (this.mod / 100));
    }
  }

}

module.exports = Resource;