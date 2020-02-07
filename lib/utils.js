exports.mapClass = (Class, data) => data ? data.map(d => new Class(d)) : []
exports.assignFunction = (fn, obj) => obj ? Object.entries(obj).reduce((o, [k, v]) => Object.assign(o, {[k]: fn(v)}), {}) : {}
exports.assignClass = (Class, obj) => obj ? this.assignFunction((v) => new Class(v), obj) : {}
