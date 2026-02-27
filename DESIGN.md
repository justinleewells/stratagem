# Stratagem

`stratagem` is a data-driven, deterministic library for simulating role-playing game battles that is optimized for use by AI agents. JSON files define game objects (entities, actions, effects) which the engine uses to simulate combat logic.

## Design Philosophy

**Unopinionated Primitives**: The engine provides composable building blocks (modifiers, events, formulas) rather than prescriptive game rules. No hardcoded damage types, elements, or mechanics.

**Data-Driven**: Entire games are defined via validated JSON. AI agents can generate, read, and modify game logic without code generation.

**Deterministic**: Given identical inputs and random seeds, the engine always produces identical outputs. Critical for AI testing and simulation.

**Performant**: Optimized hot paths, minimal allocations, and caching strategies for high-throughput simulation.

**Type-Safe**: TypeScript provides compile-time guarantees and excellent IDE support for AI tooling.

---

# Core Concepts

## Entity

A participant in combat. Acts as a container for:
- **Attributes**: Numerical stats (e.g., `attack`, `defense`)
- **Resources**: Bounded values (e.g., `health`, `mana`)
- **Tags**: Arbitrary labels for game logic (e.g., `["undead", "elite"]`)
- **Modifier Sources**: Passives, Equipment, Status Effects

Entities have no inherent behavior—they are pure state containers.

## Attribute

A named numerical value computed via modifier stacking:
- **Base Value**: Starting value (e.g., `attack: 10`)
- **Modifiers**: Collected from all sources on the entity
- **Final Value**: Computed deterministically by `ModifierStack`

Example: An entity with `base attack: 10`, equipment `+5 attack`, and buff `×1.2 attack` would have `final attack: 18` (calculated as `(10 + 5) × 1.2`).

## Resource

An `Attribute` with minimum and maximum bounds:
- **Current Value**: Can be spent/restored (e.g., current health)
- **Max Value**: Computed via modifiers (e.g., max health can be buffed)
- **Min Value**: Usually 0, but configurable

Emits events on depletion, making it easy to implement death/exhaustion mechanics.

## Modifier

**The universal extension mechanism.** Modifiers change how values are calculated:

```typescript
{
  target: string;           // What to modify (e.g., "attack", "incoming_damage")
  type: 'add' | 'multiply' | 'set' | 'min' | 'max';
  value: number | Formula;  // Static number or formula string
  condition?: Formula;      // Optional: only apply if condition is true
  priority: number;         // Controls application order
  source: ModifierSource;   // What created this modifier
}
```

**Example Use Cases:**
- Damage types: `{ target: "incoming_damage", type: "multiply", value: "0.5", condition: "source.tags.includes('fire')" }`
- Critical hits: `{ target: "outgoing_damage", type: "multiply", value: "2.0", condition: "random.next() < 0.1" }`
- Stat caps: `{ target: "speed", type: "max", value: "100" }`

Game designers create modifiers via JSON—the engine just applies them.

## ModifierStack

Deterministic algorithm for computing final values:

```
1. Collect all modifiers targeting this value
2. Sort by:
   a. Priority (higher first)
   b. Type: set → add → multiply → min → max
   c. Source type: Passive → Equipment → StatusEffect → Temporary
   d. Creation order (stable sort)
3. Apply modifiers in order:
   value = base
   for each set:      value = modifier.value
   for each add:      value = value + modifier.value
   for each multiply: value = value × modifier.value
   for each min:      value = max(value, modifier.value)
   for each max:      value = min(value, modifier.value)
4. Return final value
```

**Performance**: Cache computed values and invalidate on modifier add/remove.

## Action

Defines what an entity can do:
- **Target Rules**: Who/what can be targeted (e.g., `single_enemy`, `all_allies`)
- **Costs**: Resources consumed (e.g., `{ mana: 10 }`)
- **Conditions**: Requirements to use (e.g., `"actor.resources.health.current > 0.5 * actor.resources.health.max"`)
- **Effects**: State changes to apply (damage, healing, status application)

Actions are pure data—execution is handled by the engine.

## Effect

Atomic state change applied during action execution:
- **Type**: `damage`, `heal`, `apply_status`, `modify_resource`, `add_modifier`, etc.
- **Formula**: Calculation for magnitude (e.g., `"attacker.attack * 1.5 - target.defense * 0.5"`)
- **Target**: Who receives the effect

Effects can be chained: "Deal damage, then apply burning status if target health < 30%."

## Status Effect

Temporary modifier source with lifecycle:
- **Duration**: Measured in turns, phases, or custom units
- **Tick Behavior**: Applied at start/end of turn
- **Stacking Rules**: `replace` (default), `stack` (duplicate), `refresh` (reset duration)
- **Effects on Tick**: Can deal damage, heal, or trigger other effects each turn

Example: Poison deals 5 damage per turn for 3 turns.

## Passive

Permanent modifier source attached to an entity. Active as long as the entity has it.

Example: "Heavy Armor Training: +10% defense"

## Equipment

Togglable modifier source. Can be added/removed dynamically.

Example: "Iron Sword: +5 attack"

## Instance

The combat state container:
- **Entities**: All participants (allies and enemies)
- **Turn State**: Current actor, turn number, phase
- **History**: Event log for replay/debugging
- **Configuration**: Victory conditions, turn strategy, random seed

Supports full serialization to/from JSON for save states or AI simulation.

## TurnStrategy

Pluggable interface that determines combat flow:

```typescript
interface TurnStrategy {
  getNextActor(instance: Instance): Entity | null;
  isPhaseComplete(instance: Instance): boolean;
}
```

**Implementations:**
- `SequentialTurnStrategy`: Fixed turn order (classic JRPG)
- `InitiativeTurnStrategy`: Speed-based ordering (re-sort each round)
- `SimultaneousTurnStrategy`: All entities act at once
- `ActionPointStrategy`: Time-unit based (fastest acts first, can act multiple times)

Game designers choose or implement custom strategies.

## EventBus

Pub/sub system for injecting game logic:

```typescript
eventBus.on('effect:applied', (event) => {
  if (event.effect.tags.includes('poison') && event.target.tags.includes('undead')) {
    event.cancel(); // Undead immune to poison
  }
});
```

All events are immutable. Listeners can:
- Observe (logging, UI updates)
- Modify (change damage values, add effects)
- Cancel (prevent actions, block damage)

**Event Types:**
- **Combat**: `combat:started`, `combat:ended`
- **Turn**: `turn:started`, `turn:ended`
- **Action**: `action:before_execute`, `action:executed`, `action:failed`
- **Effect**: `effect:before_apply`, `effect:applied`, `effect:after_apply`
- **Damage**: `damage:calculated`, `damage:applied`
- **Resource**: `resource:changed`, `resource:depleted`
- **Status**: `status:applied`, `status:ticked`, `status:removed`
- **Entity**: `entity:defeated`, `entity:revived`

## Formula

Safe, readonly expression evaluator for data-driven calculations:

**Syntax:**
- Operators: `+`, `-`, `*`, `/`, `%`, `()`, `<`, `>`, `<=`, `>=`, `==`, `!=`
- Ternary: `condition ? true_value : false_value`
- Dot access: `attacker.attack`, `target.resources.health.current`
- Functions: `max()`, `min()`, `floor()`, `ceil()`, `abs()`, `clamp()`

**Context Variables:**
- `attacker`: The entity performing the action
- `target`: The entity receiving the effect
- `action`: The action being performed
- `random`: Seeded random source (for deterministic variance)

**Examples:**
```javascript
"attacker.attack * 1.5 - target.defense * 0.5"
"max(0, attacker.magic - target.magic) * 2"
"target.resources.health.current < target.resources.health.max * 0.3 ? 50 : 30"
```

No assignments, loops, or side effects—formulas are pure calculations.

## RandomSource

Seeded pseudo-random number generator (PRNG):
- Deterministic: Same seed → same sequence
- Serializable: Full state can be saved/restored
- API: `next()` returns float in [0, 1), `nextInt(min, max)`, `choose(array)`, etc.

Critical for determinism: All randomness must flow through this source.

---

# Architecture

## Modifier Calculation Pipeline

```
Input: Attribute name (e.g., "attack")
  ↓
1. Get base value from entity
  ↓
2. Collect all modifiers targeting this attribute from:
   - Entity.passives[]
   - Entity.equipment[]
   - Entity.statusEffects[]
   - Entity.temporaryModifiers[]
  ↓
3. Filter modifiers where condition evaluates to true
  ↓
4. Sort modifiers: priority → type → source type → creation order
  ↓
5. Apply modifiers in order:
   - All 'set' modifiers (last one wins)
   - All 'add' modifiers (sum)
   - All 'multiply' modifiers (product)
   - All 'min' modifiers (max of value and modifier)
   - All 'max' modifiers (min of value and modifier)
  ↓
Output: Final computed value
```

**Performance**: Cache results, invalidate on modifier add/remove/change.

## Action Execution Flow

```
1. Validate target(s) via TargetSelector
2. Check costs (resources, cooldowns, conditions)
3. Emit 'action:before_execute' event
   - Listeners can cancel or modify
4. If cancelled, emit 'action:failed' and stop
5. Deduct costs from actor
6. For each effect in action:
   a. Evaluate formula in context
   b. Emit 'effect:before_apply' event
   c. Apply effect (modify resources, add status, etc.)
   d. Emit 'effect:applied' event
7. Emit 'action:executed' event
8. Record in history
```

## Combat Loop

```
1. Initialize Instance (load entities, seed random, set strategy)
2. Emit 'combat:started'
3. While no victory/defeat condition met:
   a. Call turnStrategy.getNextActor()
   b. If null, check if phase complete:
      - If yes, start new phase (tick status effects, etc.)
      - If no, combat is over
   c. Emit 'turn:started' with current actor
   d. Determine available actions for actor
   e. Execute chosen action (via AI or predefined behavior)
   f. Tick status effects on actor (if end-of-turn tick)
   g. Emit 'turn:ended'
   h. Check victory conditions
4. Emit 'combat:ended' with result
```

## Event System

**Event Structure:**
```typescript
{
  type: string;           // Event name (e.g., 'damage:calculated')
  timestamp: number;      // Turn/tick number
  data: any;              // Event-specific payload
  cancelled: boolean;     // Can be set by listeners
  metadata: any;          // Modified values from listeners
}
```

**Listener Flow:**
```
1. Event emitted
2. Listeners invoked by priority (highest first)
3. Each listener receives immutable event
4. Listener can return:
   - Modified event (with changed data)
   - Cancellation signal
   - Nothing (pass-through)
5. Next listener receives output of previous
6. Final event state returned to emitter
```

---

# Data Schema

## Entity Template

```json
{
  "id": "knight",
  "name": "Knight",
  "tags": ["warrior", "armored"],
  "attributes": {
    "attack": { "base": 15 },
    "defense": { "base": 12 },
    "speed": { "base": 8 }
  },
  "resources": {
    "health": { "base": 100, "current": 100 },
    "stamina": { "base": 50, "current": 50 }
  },
  "passives": ["heavy_armor_training"],
  "equipment": ["iron_sword", "iron_shield"],
  "actions": ["slash", "defend", "rest"]
}
```

## Action Definition

```json
{
  "id": "slash",
  "name": "Slash",
  "tags": ["physical", "melee"],
  "targetType": "single_enemy",
  "costs": { "stamina": 5 },
  "condition": "actor.resources.stamina.current >= 5",
  "effects": [
    {
      "type": "damage",
      "formula": "max(0, attacker.attack * 1.5 - target.defense * 0.5)",
      "target": "selected"
    }
  ]
}
```

## Status Effect Template

```json
{
  "id": "poison",
  "name": "Poison",
  "tags": ["damage_over_time", "poison"],
  "duration": 3,
  "stackRule": "refresh",
  "tickTiming": "turn_end",
  "modifiers": [],
  "onTick": [
    {
      "type": "damage",
      "formula": "5",
      "target": "self"
    }
  ]
}
```

## Passive Trait

```json
{
  "id": "heavy_armor_training",
  "name": "Heavy Armor Training",
  "modifiers": [
    {
      "target": "defense",
      "type": "multiply",
      "value": "1.1",
      "priority": 0
    }
  ]
}
```

## Equipment Item

```json
{
  "id": "iron_sword",
  "name": "Iron Sword",
  "tags": ["weapon", "melee"],
  "modifiers": [
    {
      "target": "attack",
      "type": "add",
      "value": "5",
      "priority": 0
    }
  ]
}
```

## Instance Configuration

```json
{
  "seed": 12345,
  "turnStrategy": "sequential",
  "entities": [
    { "templateId": "knight", "team": "player" },
    { "templateId": "goblin", "team": "enemy" },
    { "templateId": "goblin", "team": "enemy" }
  ],
  "victoryCondition": "all_enemies_defeated"
}
```

**Validation**: All JSON must conform to strict schemas (using `ajv` or similar).

---

# Extension Points

## Custom Game Mechanics via Modifiers

**Example: Elemental Damage System**

Define elements via tags:
```json
{
  "id": "fireball",
  "tags": ["magic", "fire"],
  "effects": [{ "type": "damage", "formula": "attacker.magic * 2" }]
}
```

Define resistance via modifiers:
```json
{
  "id": "fire_resistance",
  "modifiers": [{
    "target": "incoming_damage",
    "type": "multiply",
    "value": "0.5",
    "condition": "source.tags.includes('fire')"
  }]
}
```

No engine changes required—purely data-driven.

**Example: Critical Hit System**

```json
{
  "id": "backstab",
  "effects": [{
    "type": "damage",
    "formula": "random.next() < 0.15 ? attacker.attack * 3 : attacker.attack * 1.2"
  }]
}
```

## Custom Combat Flow via TurnStrategy

**Example: Speed-Based Initiative**

```typescript
class InitiativeTurnStrategy implements TurnStrategy {
  getNextActor(instance: Instance): Entity | null {
    // Sort entities by speed attribute (high to low)
    const sorted = [...instance.entities]
      .filter(e => !e.hasActedThisTurn)
      .sort((a, b) => b.getAttribute('speed') - a.getAttribute('speed'));
    return sorted[0] || null;
  }

  isPhaseComplete(instance: Instance): boolean {
    return instance.entities.every(e => e.hasActedThisTurn);
  }
}
```

## Custom Logic via Events

**Example: On-Death Effects**

```typescript
eventBus.on('entity:defeated', (event) => {
  if (event.entity.tags.includes('explosive')) {
    // Deal damage to all nearby entities
    const nearbyEntities = getNearbyEntities(event.entity);
    nearbyEntities.forEach(target => {
      applyEffect(target, { type: 'damage', value: 20 });
    });
  }
});
```

**Example: Counterattack**

```typescript
eventBus.on('damage:applied', (event) => {
  if (event.target.hasPassive('counterattack') && event.source.type === 'physical') {
    // Attack back
    executeAction(event.target, 'counterattack', event.attacker);
  }
});
```

---

# AI Integration

## State Inspection

```typescript
// Get full serializable state
const state = instance.getState();
// Returns: { entities: [...], turnNumber: 5, history: [...], ... }

// Check what an entity can do
const actions = entity.getAvailableActions(instance);
// Returns: Action[] (filtered by costs, conditions, cooldowns)

// Get valid targets for an action
const targets = action.getValidTargets(entity, instance);
// Returns: Entity[] (filtered by targeting rules, range, etc.)
```

## Simulation (Readonly)

```typescript
// Preview outcome without mutating state
const outcome = instance.simulate(action, target);
// Returns: { 
//   damageDealt: 25,
//   resourceChanges: { target: { health: -25 } },
//   statusesApplied: ['poisoned'],
//   willDefeat: false
// }
```

Critical for AI planning: "What happens if I do X?"

## Determinism Guarantees

Given identical:
- Entity configurations
- Action sequence
- Random seed

The engine produces identical:
- Damage values
- Status durations
- Combat outcomes
- Final entity states

**Serialization:**
```typescript
// Save state
const snapshot = instance.serialize();
// ... later ...
const restored = Instance.deserialize(snapshot);
// Restored instance behaves identically to original
```

---

# Performance Considerations

## Hot Paths

1. **ModifierStack calculation**: Cache computed values with dirty flags
2. **Formula evaluation**: Memoize results for identical formulas
3. **Event emission**: Minimize allocations, reuse event objects
4. **Target validation**: Pre-compute valid target sets when possible

## Optimization Strategies

- **Lazy Evaluation**: Don't compute attributes until needed
- **Object Pooling**: Reuse event/effect objects instead of allocating
- **Batch Operations**: Apply multiple effects at once when possible
- **Minimize Deep Cloning**: Use structural sharing for immutable data

**Benchmarking**: Target 1000+ action executions per second on modern hardware.
