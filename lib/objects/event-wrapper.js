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
    this.evs = {};
    _.forEach(config.unitEvents, (value) => {
      this.evs[value] = [];
    });
  }

  /**
   * Adds an event to the specified eventId.
   * @param {string} eventId - The key of the array to append the event to.
   * @param {Event} ev - The event to add to the array.
   */
  addEvent(eventId, ev) {
    if (this.evs[eventId] === undefined) throw 'That\'s not a valid eventId';
    this.evs[eventId].push(ev);
  }

  /**
   * Removes an event from the specified eventId.
   * @param {string} eventId - The key of the array to remove the event from.
   * @param {function} fn - The event to remove from the array
   */
  removeEvent(eventId, ev) {
    if (this.evs[eventId] === undefined) throw 'That\'s not a valid eventId';
    let i = this.evs[eventId].indexOf(ev);
    this.evs[eventId].splice(i, 1);
  }

  /**
   * Executes all events for the specified eventId.
   * @param {string} eventId - The key of the array to execute.
   * @param {object} args - A varying object of arguments that are passed
   *                 to the events.
   * @return {object[]} An array of non-null results.
   */
  execute(eventId, args) {
    return _.reduce(this.evs[eventId], (arr, ev) => {
      let result = ev.execute(args);
      return (result) ? arr.concat(result) : arr;
    }, []);
  }

}

module.exports = EventWrapper;