import ModifierTypes from "./modifier-types.js";

export default class Attribute {
  constructor(base) {
    this.base = base;
    this.value = base;
    this.modifiers = {};
  }
  setBase(base) {
    this.base = base;
    this._calculate();
  }
  setModifier(id, type, value) {
    this.modifiers[id] = { type, value };
    this._calculate();
  }
  deleteModifier(id) {
    delete this.modifiers[id];
    this._calculate();
  }
  getModifier(id) {
    return this.modifiers[id];
  }
  hasModifier(id) {
    return this.modifiers[id] != undefined;
  }
  _calculate() {
    let multiplier = 1.0;
    let addend = 0;
    Object.values(this.modifiers).forEach(({ type, value }) => {
      switch (type) {
        case ModifierTypes.MULTIPLIER:
          multiplier *= value;
          break;
        case ModifierTypes.ADDEND:
          addend += value;
          break;
      }
    });
    this.value = (this.base + addend) * multiplier;
  }
}
