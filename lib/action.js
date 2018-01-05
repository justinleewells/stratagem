const OutputEmitter = require('./output-emitter')
const Target = require('./target')
const classes = {}
const information = {}
class Action extends OutputEmitter {
  constructor(id, params) {
    super(params.output)
    this.info = information[id]
  }
  getId() {
    return this.info.id
  }
  getTargetType() {
    return this.info.targetType
  }
  getTarget(instance, unit, tar) {
    return Target.get(this.getTargetType()).execute(instance, unit, tar)
  }

  execute(instance, unit, targets) {}
  
  _execute(instance, unit, tar) {
    this.startOutput({type: 'use-action', action: this.getId()})
    let target = this.getTarget(instance, unit, tar) 
    unit.states.execute('pre-use-action', {unit: unit, target: target, action: this})
    this.execute(instance, unit, target)
    unit.states.execute('post-use-action', {unit: unit, target: target, action: this})
    this.endOutput()
  }

  static register(id, cls, info) {
    classes[id] = cls 
    information[id] = info
  }
  static create(id, params) {
    return new classes[id](params)
  }
}
module.exports = Action
