const OutputEmitter = require('./output-emitter')
const AttributeWrapper = require('./attribute-wrapper')
const StatusEffectWrapper = require('./status-effect-wrapper')
const StateWrapper = require('./state-wrapper')
const ActionWrapper = require('./action-wrapper')

const classes = {}
const information = {}

class Unit extends OutputEmitter {
  constructor(id, params = {}) {
    super(params.instance.output)
    this.info = information[id]
    this.uuid = params.uuid
    this.team = params.team
    this.position = params.position
    this.instance = params.instance
    this.attributes = new AttributeWrapper(this, this.info.attributes)
    this.actions = new ActionWrapper(this, this.info.actions)
    this.states = new StateWrapper(this, this.info.states)
    this.statusEffects = new StatusEffectWrapper(this)
    this.instance.units.push(this)
    this.instance.output.register(this)
  }

  _emit(ev) {
    ev.unit = this.getUUID()
    this.emit('event', ev)
  }

  getUUID() {
    return this.uuid
  }
  getTeam() {
    return this.team
  }
  setTeam(val) {
    this.team = val
  }
  getPosition() {
    return this.position
  }
  setPosition(val) {
    this.position = val
  }
  getInstance() {
    return this.instance
  }
  setInstance(val) {
    this.instance = val
  }
  getOutput() {
    return this.getInstance().getOutput()
  }

  static register(id, cls, info) {
    classes[id] = cls 
    information[id] = info
  }
  static create(id, params) {
    return new classes[id](params)
  }
}
module.exports = Unit
