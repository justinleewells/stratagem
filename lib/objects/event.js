/**
 * Base class that encapsulates game logic.
 * @class
 */
class Event {}

/**
 * Function that is called during runtime execution.
 * @abstract
 */
Event.prototype.execute = function (instance, source) {
  console.log('Execute must be implemented on this event.');
}

module.exports = Event;