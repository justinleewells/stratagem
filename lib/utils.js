exports.mapClass = (Class, data) => data ? data.map(d => new Class(d)) : []
exports.assignFunction = (fn, obj) => obj ? Object.entries(obj).reduce((o, [k, v]) => Object.assign(o, {[k]: fn(v)}), {}) : {}
exports.assignClass = (Class, obj) => obj ? this.assignFunction((v) => new Class(v), obj) : {}
exports.exportAsJSON = (obj) => {
  if (obj.toJSON !== undefined) return obj.toJSON()
  else if (obj instanceof Array) return obj.map(v => this.exportAsJSON(v)) 
  else if (typeof(obj) == 'object') return this.assignFunction((v) => this.exportAsJSON(v), obj)
  else return obj
}
