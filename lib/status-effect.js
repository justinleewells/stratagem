const OutputEmitter = require('./output-emitter')
const classes = {}
const information = {}

class StatusEffect extends OutputEmitter {
  constructor(id, params) {
    super(params.output)
    this.info = information[id]
    this.duration = this.getMaxDuration()
    this.stacks = 1
  }

  getId() {
    return this.info.id
  }
  getName() {
    return this.info.name
  }
  getMaxDuration() {
    return this.info.maxDuration
  }
  getMaxStacks() {
    return this.info.maxStacks
  }
  getDuration() {
    return this.duration
  }
  setDuration(val) {
    this.duration = val
  }
  getStacks() {
    return this.stacks
  }
  setStacks(val) {
    this.stacks = val
  }
  canStack() {
    return this.getStacks() < this.getMaxStacks()
  }

  add(source, target) {}
  remove(source, target) {}
  refresh(source, target) {}
  expire() {}
  tick() {}

  _add(source, target) {
    this.startOutput({type: 'add-status-effect', statusEffect: this.getId()})
    target.states.execute('pre-receive-status-effect', {source: source, target: target, statusEffect: this})
    if (!this.output.isCanceled()) {
      if (source) source.states.execute('pre-apply-status-effect', {source: source, target: target, statusEffect: this})
      this.add(source, target)
      this.emit('add')
      target.states.execute('post-receive-status-effect', {source: source, target: target, statusEffect: this})
      if (source) source.states.execute('post-apply-status-effect', {source: source, target: target, statusEffect: this})
    }
    this.endOutput()
  }
  _remove(source, target) {
    this.startOutput({type: 'remove-status-effect', statusEffect: this.getId()})
    target.states.execute('pre-remove-status-effect', {source: source, target: target, statusEffect: this})
    if (!this.output.isCanceled()) {
      if (source) source.states.execute('pre-purge-status-effect', {source: source, target: target, statusEffect: this})
      this.remove(source, target)
      target.states.execute('post-remove-status-effect', {source: source, target: target, statusEffect: this})
      if (source) source.states.execute('post-purge-status-effect', {source: source, target: target, statusEffect: this})
      this.emit('remove')
    }
    this.endOutput()
  }
  _refresh(source, target) {
    this.startOutput({type: 'refresh-status-effect', statusEffect: this.getId()})
    target.states.execute('pre-receive-status-effect', {source: source, target: target, statusEffect: this})
    if (!this.output.isCanceled()) {
      this.duration = this.getMaxDuration()
      if (this.canStack()) this.setStacks(this.getStacks() + 1)
      if (source) source.states.execute('pre-apply-status-effect', {source: source, target: target, statusEffect: this})
      this.refresh(source, target)
      target.states.execute('post-receive-status-effect', {source: source, target: target, statusEffect: this})
      if (source) source.states.execute('post-apply-status-effect', {source: source, target: target, statusEffect: this})
    }
    this.endOutput()
  }
  _expire() {
    this.startOutput({type: 'expire-status-effect', statusEffect: this.getId()})
    this.expire()
    this.emit('remove')
    this.endOutput()
  }
  _tick() {
    this.startOutput({type: 'tick-status-effect', statusEffect: this.getId()})
    this.tick()
    this.endOutput()
  }

  static register(id, cls, info) {
    classes[id] = cls 
    information[id] = info
  }
  static create(id, params) {
    return new classes[id](params)
  }

  toJSON() {
    return {
      id: this.getId(),
      duration: this.getDuration(),
      stacks: this.getStacks(),
    }
  }
}
module.exports = StatusEffect
