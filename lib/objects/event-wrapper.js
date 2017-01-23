var config = require('../config');

// Libraries
var _ = require('lodash');

// Objects
var Event = require('./event');

/**
 * Provides an interface for initializing, adding, and removing
 * events from a Unit.
 */
class EventWrapper {

  /**
   * Iterates through each property in the unitEvents
   * configuration value and initializes a new array.
   * @function
   */
  constructor() {
    _.forEach(config.unitEvents, (value) => {
      this[value] = [];
    });
  }

  /**
   * Adds an event to the specified eventId.
   */
  addEvent() {
  }

  /**
   * Removes an event from the specified eventId.
   */
  removeEvent() {
  }

}