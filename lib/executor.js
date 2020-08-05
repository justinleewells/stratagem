const Strategy = require('./strategy')
class Executor extends Strategy {}
Executor.define('trigger-handler', ({instance, event}) => {
  event.properties.events.forEach(e => instance.execute(e))
  delete event.properties.events
})
module.exports = Executor
