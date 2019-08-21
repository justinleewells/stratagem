exports.mapClass = (Class, data) => data ? data.map(d => new Class(d)) : []
