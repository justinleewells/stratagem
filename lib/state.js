const OutputEmitter = require('./output-emitter')
const classes = {}
const information = {}
class State extends OutputEmitter {
  constructor(id, params) {
    super(params.output)
    this.info = information[id]
  } 

  getId() {
    return this.info.id
  }

  canExecute() {}
  execute() {}

  _execute(params) {
    this.startOutput({type: 'execute-state', state: this.getId()})
    this.execute(params)
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
module.exports = State
