const config = require('./config')
const StaticAttribute = require('./static-attribute')
const DynamicAttribute = require('./dynamic-attribute')
const RangeAttribute = require('./range-attribute')
class AttributeWrapper {
  constructor(unit, attrs) {
    Object.entries(config.attributes).forEach(entry => {
      let key = entry[0]
      let type = entry[1]
      switch (type) {
        case 'static':
          this[key] = new StaticAttribute(attrs[key] || 0)
          break
        case 'dynamic':
          this[key] = new DynamicAttribute(unit, attrs[key] || 0)
          break
        case 'range':
          this[key] = new RangeAttribute(unit, attrs[key] || 0)
          break
      }
      if (type === 'range' || type === 'dynamic') {
        this[key].on('event', (ev) => {
          ev.key = key
          unit._emit(ev)
        })
      }
    })
  }
}
module.exports = AttributeWrapper
