exports.mapClass = (Class, data) => data ? data.map(d => new Class(d)) : []
exports.assignClass = (Class, obj) => obj ? Object.entries(obj).reduce((o, [k, v]) => Object.assign(o, {[k]: new Class(v)}), {}) : {}
