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
   * Iterates through each eventId in the unitEvents
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
  addEvent(eventId, fn) {
    if (this[eventId] === undefined) throw 'That\'s not a valid eventId';
    this[eventId].push(fn);
  }

  /**
   * Removes an event from the specified eventId.
   */
  removeEvent(eventId, fn) {
    if (this[eventId] === undefined) throw 'That\'s not a valid eventId';
    let i = this[eventId].indexOf(fn);
    this[eventId].splice(i, 1);
  }

}