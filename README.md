
<div align="center">
  <h1>stratagem</h1>
  <p>a lightweight javascript library for modeling turn-based role-playing games</p>
</div>

## Table of Contents
1. [Install](#install)
2. [Introduction](#introduction)
## Install
Install with npm:
```bash
npm install --save stratagem
```
## Introduction
The primary goal of `stratagem` is to provide a minimal library for modeling turn-based role-playing games so developers can quickly prototype ideas. To achieve this goal, `stratagem` heavily utilizes code reuse and data-driven programming.

### Get Started
To begin, the rules of battle are defined as `Executors`:
```javascript
Executor.define('damage', (context) => {
  let {instance, event} = context
  let target = instance.getUnit(event.target)
  target.attributes.hp.subtract(event.properties.value)
})
```
Next, a `Selector` must be defined, which determines the units that can be affected by an `Action` or `Handler`:
```javascript
Selector.define('enemy', (source, instance, input) => {
  return {
    enemy: instance.getEnemyUnits(source)
  }
})
```
After defining a `Selector`, `Actions` can be defined:
```javascript
Action.define('attack', {
  selector: 'enemy',
  effects: {
    enemy: [
      {
        results: [
          {
            type: 'damage',
            properties: {
              value: 1
            }
          }
        ]
      }
    ]
  }
})
```
Next, `Units` are initialized with `Attributes` and `Actions`:
```javascript
let unitA = new Unit({
  team: 0,
  attributes: {
    hp: new ContinuousAttribute(10)
  },
  actions: {
    attack: Action.create('attack')
  }
})

let unitB = new Unit({
  team: 1,
  attributes: {
    hp: new ContinuousAttribute(10)
  },
  actions: {
    attack: Action.create('attack')
  }
})
```
The initialized `Units`are then added to an `Instance`:
```javascript
let instance = new Instance()
instance.addUnit(unitA)
instance.addUnit(unitB)
```
Finally, `Actions` are used and the resulting `Events` are executed by the `Instance`:
```javascript
let action = unitA.actions.attack
let results = action.use(unitA, instance)
results.forEach((result) => {
  result.events.forEach((event) => instance.execute(event))
})
```
