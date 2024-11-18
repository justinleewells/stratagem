import Executor from './executor.js'

export default class Instance {
  constructor() {
    this.units = {}
    this.executor = new Executor(this)
  }
  addUnit(unit) {
    if (this.units[unit.id]) throw new Error(`Unit ${unit.id} already exists.`)
    this.units[unit.id] = unit
  }
  getUnit(id) {
    return this.units[id]
  }
  getAllies(id, includeSelf = false) {
    if (!this.units[id]) throw new Error(`Unit ${id} does not exist.`)
    const team = this.units[id].team
    return Object.values(this.units).reduce((arr, unit) => {
      if (unit.team == team && (includeSelf || unit.id != id)) arr.push(unit)
      return arr
    }, [])
  }
  getEnemies(id) {
    if (!this.units[id]) throw new Error(`Unit ${id} does not exist.`)
    const team = this.units[id].team
    return Object.values(this.units).reduce((arr, unit) => {
      if (unit.team != team) arr.push(unit)
      return arr
    }, [])
  }
  async run(event) {
    await this.executor.execute(event)
  }
}
