import { Instance, Unit, Selectors, Selector } from "./index.js";

const a = new Unit(0, 0);
const b = new Unit(1, 0);
const c = new Unit(2, 1);
const d = new Unit(3, 1);
const i = new Instance();
i.addUnit(a);
i.addUnit(b);
i.addUnit(c);
i.addUnit(d);

console.log(Selector.select(Selectors.ALL_ENEMIES, i, a, null));
