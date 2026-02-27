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
- **Event Listeners**: Can react to events (NEW)

**Examples:**
- **Simple**: Poison deals 5 damage per turn for 3 turns
- **Reactive**: Thorns reflects 30% damage back to attacker
- **Protective**: Block reduces next incoming damage by 50%

Status effects can be both **proactive** (tick effects) and **reactive** (event listeners).

## Passive

Permanent modifier source attached to an entity. Active as long as the entity has it.

**Types:**
- **Stat Modifiers**: "+10% defense", "+5 attack"
- **Event-Driven Behaviors**: Counterattack, lifesteal, rage generation (NEW)

**Examples:**
- **Simple**: "Heavy Armor Training: +10% defense"
- **Reactive**: "Counterattack: Strike back when hit by physical attacks"
- **Conditional**: "Berserker: +20% attack when below 30% health"

Passives are permanent but can have conditional modifiers or event-driven behaviors.

## Equipment

Togglable modifier source. Can be added/removed dynamically.

**Types:**
- **Stat Modifiers**: "+5 attack", "+10 defense"
- **Event-Driven Behaviors**: On-hit effects, reactive armor (NEW)

**Examples:**
- **Simple**: "Iron Sword: +5 attack"
- **Reactive**: "Thornmail: Reflects 30% of incoming damage"
- **On-Hit**: "Vampiric Blade: Heal for 20% of damage dealt"

Equipment combines the toggleability of gear with the power of reactive behaviors.

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

## Event-Driven Behaviors

**Critical Concept for AI Agents:** Passives, Status Effects, and Equipment can **react to events** in addition to providing stat modifiers.

This enables complex game mechanics entirely through JSON:
- Counterattack
- Damage reflection (Thorns)
- Lifesteal/Vampirism
- Rage generation
- Conditional damage reduction
- On-death effects
- Triggered abilities
- Chain reactions

### Event Listener Structure

```typescript
{
  "event": string,              // What event to listen for
  "condition"?: string,         // Formula: only trigger if true
  "priority"?: "highest" | "high" | "normal" | "low" | "lowest",
  "effects": EffectData[],      // What to do (conditional chain)
  "maxTriggersPerTurn"?: number,
  "maxTriggersPerCombat"?: number,
  "consumeOnTrigger"?: boolean,
  "description"?: string
}
```

### Available Events

**Damage Events:**
- `damage:before_calculate` - Modify base damage before calculation
- `damage:calculated` - Modify final damage value
- `damage:before_apply` - Last chance to modify or cancel
- `damage:applied` - React after damage is dealt (counterattack, thorns)

**Healing Events:**
- `heal:before_apply` - Modify or cancel healing
- `heal:applied` - React after healing

**Action Events:**
- `action:before_execute` - Can cancel or modify action
- `action:executed` - React after action completes
- `action:failed` - React to failed actions

**Effect Events:**
- `effect:before_apply` - Modify or cancel specific effects
- `effect:applied` - React after effect applied

**Resource Events:**
- `resource:changed` - When any resource changes
- `resource:depleted` - When resource reaches 0

**Status Events:**
- `status:before_apply` - Can prevent status application
- `status:applied` - React to gaining status
- `status:removed` - React to losing status

**Entity Events:**
- `entity:defeated` - On-death effects
- `entity:revived` - React to resurrection

**Turn Events:**
- `turn:started` - At start of turn
- `turn:ended` - At end of turn

**Combat Events:**
- `combat:started` - At combat start
- `combat:ended` - At combat end

### Event Context for Formulas

Event listener formulas have access to:

**Core Variables:**
- `self` - Entity that owns this passive/status/equipment
- `event` - Full event object with all data
- `random` - Seeded random source

**Convenient Shortcuts:**
- `source` - Entity that caused the event (same as `event.data.source`)
- `target` - Entity affected by event (same as `event.data.target`)
- `attacker` - For damage events
- `defender` - For damage events
- `damage` - Damage amount (if applicable)
- `healing` - Healing amount (if applicable)
- `action` - Action being executed (if applicable)

**Conditional Chaining:**
- `previousEffect` - Result of previous effect in chain
- `previousEffect.succeeded` - Whether previous effect worked
- `previousEffect.value` - Return value of previous effect

### Effect Types for Event Listeners

**Standard Effects:**
- `damage` - Deal damage
- `heal` - Restore health
- `apply_status` - Apply a status effect
- `remove_status` - Remove a status effect
- `modify_resource` - Change resource value

**Event-Specific Effects:**
- `execute_action` - Trigger an action (counterattack)
- `modify_event` - Change event data (reduce damage)
- `cancel_event` - Prevent event from happening
- `apply_to_source` - Apply effect to event source
- `apply_to_all_allies` - AoE effect to allies
- `apply_to_all_enemies` - AoE effect to enemies

**Effect Targets:**
- `self` - Entity with this passive/status/equipment
- `event_source` - Entity that caused the event
- `event_target` - Entity affected by the event
- `selected` - Explicitly selected target
- `all_allies` - All allies of self
- `all_enemies` - All enemies of self

### Conditional Effect Chaining

Effects in an event listener execute **conditionally in sequence**:

```json
{
  "effects": [
    {
      "type": "damage",
      "formula": "50",
      "target": "event_source",
      "description": "Always executes"
    },
    {
      "type": "heal",
      "formula": "previousEffect.value * 0.5",
      "target": "self",
      "condition": "previousEffect.succeeded",
      "description": "Only if damage succeeded"
    }
  ]
}
```

**Chaining Rules:**
- Effects execute in order
- Each effect can check `previousEffect.succeeded`
- If an effect fails, subsequent effects see the failure
- Use `condition` on effects for branching logic

### Priority System

Event listeners use **semantic priorities** (AI-friendly):

- `highest` - 1000 (block, immunity, cancellation)
- `high` - 750 (damage modification, critical conditions)
- `normal` - 500 (default, most reactions)
- `low` - 250 (aftermath, cleanup)
- `lowest` - 0 (final reactions, logging)

Higher priority listeners execute first. Use priority to control order:
- **Block** (highest) should reduce damage before **Thorns** (normal) reflects it
- **Immunity** (highest) should cancel damage before **Counterattack** (normal) triggers

### Pattern Library

**Pattern 1: Counterattack**
```json
{
  "id": "counterattack",
  "name": "Counterattack",
  "description": "Strike back when hit by physical attacks",
  "modifiers": [],
  "eventListeners": [
    {
      "event": "damage:applied",
      "condition": "event.target.id == self.id && event.tags.includes('physical')",
      "priority": "normal",
      "effects": [
        {
          "type": "execute_action",
          "actionId": "basic_attack",
          "target": "event_source",
          "description": "Attack the attacker"
        }
      ],
      "maxTriggersPerTurn": 1
    }
  ]
}
```

**Pattern 2: Damage Reflection (Thorns)**
```json
{
  "id": "thorns",
  "name": "Thorns",
  "description": "Reflects 30% of damage back to attacker",
  "duration": 3,
  "stackRule": "refresh",
  "tickTiming": "turn_end",
  "modifiers": [],
  "eventListeners": [
    {
      "event": "damage:applied",
      "condition": "target.id == self.id",
      "priority": "normal",
      "effects": [
        {
          "type": "damage",
          "formula": "damage * 0.3",
          "target": "event_source",
          "tags": ["thorns", "reflected"],
          "description": "Reflect 30% damage"
        }
      ]
    }
  ]
}
```

**Pattern 3: Block/Damage Reduction**
```json
{
  "id": "block",
  "name": "Block",
  "description": "Reduces next incoming damage by 50%",
  "duration": 1,
  "stackRule": "replace",
  "tickTiming": "turn_start",
  "modifiers": [],
  "eventListeners": [
    {
      "event": "damage:before_apply",
      "condition": "target.id == self.id",
      "priority": "high",
      "effects": [
        {
          "type": "modify_event",
          "eventModifications": {
            "damage": "damage * 0.5"
          },
          "description": "Reduce damage by 50%"
        }
      ],
      "maxTriggersPerTurn": 1,
      "consumeOnTrigger": true
    }
  ]
}
```

**Pattern 4: Lifesteal/Vampirism**
```json
{
  "id": "vampiric_blade",
  "name": "Vampiric Blade",
  "description": "Heal for 20% of damage dealt",
  "modifiers": [
    { "target": "attack", "type": "add", "value": "5", "priority": 0 }
  ],
  "eventListeners": [
    {
      "event": "damage:applied",
      "condition": "source.id == self.id",
      "priority": "normal",
      "effects": [
        {
          "type": "heal",
          "formula": "damage * 0.2",
          "target": "self",
          "description": "Heal for 20% of damage dealt"
        }
      ]
    }
  ]
}
```

**Pattern 5: Rage Generation**
```json
{
  "id": "berserker_rage",
  "name": "Berserker Rage",
  "description": "Gain rage when taking damage",
  "modifiers": [],
  "eventListeners": [
    {
      "event": "damage:applied",
      "condition": "target.id == self.id",
      "priority": "normal",
      "effects": [
        {
          "type": "modify_resource",
          "formula": "min(100, self.resources.rage.current + damage * 0.2)",
          "target": "self",
          "description": "Gain rage equal to 20% of damage taken"
        }
      ]
    }
  ]
}
```

**Pattern 6: On-Death Explosion**
```json
{
  "id": "vengeful_spirit",
  "name": "Vengeful Spirit",
  "description": "Explode on death, damaging all enemies",
  "modifiers": [],
  "eventListeners": [
    {
      "event": "entity:defeated",
      "condition": "event.entity.id == self.id",
      "priority": "normal",
      "effects": [
        {
          "type": "damage",
          "formula": "self.maxHealth * 0.5",
          "target": "all_enemies",
          "tags": ["explosion", "death"],
          "description": "Deal 50% of max health to all enemies"
        }
      ],
      "consumeOnTrigger": true
    }
  ]
}
```

**Pattern 7: Conditional Execution**
```json
{
  "id": "execute",
  "name": "Execute",
  "description": "Deal bonus damage to low-health targets",
  "modifiers": [],
  "eventListeners": [
    {
      "event": "damage:calculated",
      "condition": "source.id == self.id",
      "priority": "normal",
      "effects": [
        {
          "type": "modify_event",
          "eventModifications": {
            "damage": "damage * 2"
          },
          "condition": "target.resources.health.current < target.resources.health.max * 0.3",
          "description": "Double damage if target below 30% health"
        }
      ]
    }
  ]
}
```

**Pattern 8: Invulnerability**
```json
{
  "id": "divine_shield",
  "name": "Divine Shield",
  "description": "Immune to all damage for 1 turn",
  "duration": 1,
  "stackRule": "replace",
  "tickTiming": "turn_end",
  "modifiers": [],
  "eventListeners": [
    {
      "event": "damage:before_apply",
      "condition": "target.id == self.id",
      "priority": "highest",
      "effects": [
        {
          "type": "cancel_event",
          "description": "Cancel all incoming damage"
        }
      ]
    }
  ]
}
```

### Best Practices for AI Agents

**1. Choose the Right Event:**
- Use `before_apply` events for prevention/modification
- Use `applied` events for reactions
- Use `calculated` events for formula adjustments

**2. Use Semantic Priority:**
- `highest` for immunity, cancellation
- `high` for damage modification
- `normal` for most reactions
- `low` for cleanup, aftermath

**3. Add Descriptions:**
Always include `description` fields - helps debugging and AI understanding.

**4. Test Conditions:**
Validate condition formulas before deployment:
- Check that variables exist (`self`, `event`, `source`, `target`)
- Test edge cases (null values, zero damage, etc.)

**5. Prevent Infinite Loops:**
- Use `maxTriggersPerTurn` for aggressive reactions
- Don't create mutual triggers (A triggers B which triggers A)
- Be careful with `execute_action` in damage events

**6. Use Conditional Chaining:**
Chain effects with `previousEffect.succeeded` for complex logic:
```json
{
  "effects": [
    { "type": "damage", "formula": "50", "target": "event_source" },
    {
      "type": "heal",
      "formula": "previousEffect.value * 0.5",
      "target": "self",
      "condition": "previousEffect.succeeded"
    }
  ]
}
```

### Common Mistakes to Avoid

**❌ Wrong:** Referencing undefined variables
```json
{ "condition": "attacker.health < 50" }  // 'attacker' might not exist
```
**✅ Right:** Check existence first
```json
{ "condition": "source && source.resources.health.current < 50" }
```

**❌ Wrong:** Infinite loop
```json
// Entity A has: on damage -> deal damage to source
// Entity B has: on damage -> deal damage to source
// A damages B → B damages A → A damages B → infinite loop
```
**✅ Right:** Add trigger limits or use tags
```json
{
  "event": "damage:applied",
  "condition": "!event.tags.includes('reflected')",
  "effects": [
    { "type": "damage", "tags": ["reflected"], ... }
  ],
  "maxTriggersPerTurn": 1
}
```

**❌ Wrong:** Modifying after application
```json
{
  "event": "damage:applied",  // Too late to modify
  "effects": [{ "type": "modify_event", ... }]
}
```
**✅ Right:** Use before/calculated events
```json
{
  "event": "damage:before_apply",  // Can still modify
  "effects": [{ "type": "modify_event", ... }]
}
```

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

**Simple (Damage Over Time):**
```json
{
  "id": "poison",
  "name": "Poison",
  "description": "Deals 5 damage per turn",
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

**Reactive (Thorns):**
```json
{
  "id": "thorns",
  "name": "Thorns",
  "description": "Reflects 30% of damage back to attacker",
  "tags": ["buff", "reflection"],
  "duration": 3,
  "stackRule": "refresh",
  "tickTiming": "turn_end",
  "modifiers": [],
  "eventListeners": [
    {
      "event": "damage:applied",
      "condition": "target.id == self.id",
      "priority": "normal",
      "effects": [
        {
          "type": "damage",
          "formula": "damage * 0.3",
          "target": "event_source",
          "tags": ["thorns", "reflected"],
          "description": "Reflect 30% damage"
        }
      ]
    }
  ]
}
```

**Protective (Block):**
```json
{
  "id": "block",
  "name": "Block",
  "description": "Reduces next incoming damage by 50%",
  "tags": ["buff", "protection"],
  "duration": 1,
  "stackRule": "replace",
  "tickTiming": "turn_start",
  "modifiers": [],
  "eventListeners": [
    {
      "event": "damage:before_apply",
      "condition": "target.id == self.id",
      "priority": "high",
      "effects": [
        {
          "type": "modify_event",
          "eventModifications": {
            "damage": "damage * 0.5"
          },
          "description": "Reduce damage by 50%"
        }
      ],
      "maxTriggersPerTurn": 1,
      "consumeOnTrigger": true
    }
  ]
}
```

## Passive Trait

**Simple (Stat Modifier):**
```json
{
  "id": "heavy_armor_training",
  "name": "Heavy Armor Training",
  "description": "Increases defense by 10%",
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

**Reactive (Event-Driven):**
```json
{
  "id": "counterattack",
  "name": "Counterattack",
  "description": "Strike back when hit by physical attacks",
  "modifiers": [],
  "eventListeners": [
    {
      "event": "damage:applied",
      "condition": "target.id == self.id && event.tags.includes('physical')",
      "priority": "normal",
      "effects": [
        {
          "type": "execute_action",
          "actionId": "basic_attack",
          "target": "event_source"
        }
      ],
      "maxTriggersPerTurn": 1
    }
  ]
}
```

## Equipment Item

**Simple (Stat Modifier):**
```json
{
  "id": "iron_sword",
  "name": "Iron Sword",
  "description": "A basic iron sword",
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

**Reactive (Lifesteal):**
```json
{
  "id": "vampiric_blade",
  "name": "Vampiric Blade",
  "description": "Heals wielder for 20% of damage dealt",
  "tags": ["weapon", "melee", "vampiric"],
  "modifiers": [
    {
      "target": "attack",
      "type": "add",
      "value": "5",
      "priority": 0
    }
  ],
  "eventListeners": [
    {
      "event": "damage:applied",
      "condition": "source.id == self.id",
      "priority": "normal",
      "effects": [
        {
          "type": "heal",
          "formula": "damage * 0.2",
          "target": "self",
          "description": "Heal for 20% of damage dealt"
        }
      ]
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

# AI Agent Guidelines

**Target Audience:** This section is for AI agents building games with Stratagem.

## Quick Start for AI Agents

**1. Understand the Primitives**
- **Entities**: Game participants (heroes, monsters, NPCs)
- **Attributes**: Numerical stats (attack, defense, speed)
- **Resources**: Bounded values (health, mana, stamina)
- **Actions**: What entities can do (attack, cast spell, use item)
- **Modifiers**: How stats are changed (+10 attack, ×1.2 damage)
- **Event Listeners**: How to react to game events (counterattack, thorns)

**2. JSON is Your Interface**
Everything is defined in validated JSON. No code generation needed.

**3. Composition Over Complexity**
Build complex behaviors by combining simple primitives:
- Counterattack = Event Listener on `damage:applied` that executes an action
- Lifesteal = Event Listener on `damage:applied` that heals self
- Thorns = Event Listener on `damage:applied` that damages source

## Discovering What's Possible

**Available Events:**
Use these events in `eventListeners`:
- `damage:before_calculate`, `damage:calculated`, `damage:before_apply`, `damage:applied`
- `heal:before_apply`, `heal:applied`
- `action:before_execute`, `action:executed`
- `effect:before_apply`, `effect:applied`
- `status:before_apply`, `status:applied`, `status:removed`
- `entity:defeated`, `entity:revived`
- `turn:started`, `turn:ended`
- `combat:started`, `combat:ended`

**Effect Types:**
Use these in `effects`:
- `damage`, `heal` - Deal/restore hit points
- `apply_status`, `remove_status` - Apply/remove status effects
- `modify_resource` - Change resource values
- `execute_action` - Trigger another action
- `modify_event` - Change event data (reduce damage, etc.)
- `cancel_event` - Prevent event from happening
- `apply_to_source` - Apply effect to event source

**Formula Variables:**
Use these in `formula` and `condition` fields:
- `self` - Entity with this passive/status/equipment
- `event` - Full event data
- `source` / `target` - Shortcuts for event.data.source / event.data.target
- `damage`, `healing`, `action` - Event-specific data
- `random` - Seeded random source
- `previousEffect` - Result of previous effect in chain

## Common Design Patterns

**Pattern: Stat Buff**
```json
{
  "id": "strength_buff",
  "modifiers": [
    { "target": "attack", "type": "add", "value": "10", "priority": 0 }
  ]
}
```

**Pattern: Reactive Damage**
```json
{
  "eventListeners": [
    {
      "event": "damage:applied",
      "condition": "target.id == self.id",
      "effects": [
        { "type": "damage", "formula": "damage * 0.3", "target": "event_source" }
      ]
    }
  ]
}
```

**Pattern: Conditional Modifier**
```json
{
  "modifiers": [
    {
      "target": "attack",
      "type": "multiply",
      "value": "1.5",
      "priority": 0,
      "condition": "self.resources.health.current < self.resources.health.max * 0.3"
    }
  ]
}
```

**Pattern: Action Trigger**
```json
{
  "eventListeners": [
    {
      "event": "damage:applied",
      "condition": "target.id == self.id",
      "effects": [
        { "type": "execute_action", "actionId": "basic_attack", "target": "event_source" }
      ],
      "maxTriggersPerTurn": 1
    }
  ]
}
```

## Validation and Testing

**Before Deploying Game Data:**

1. **Validate JSON Syntax**
   - Ensure proper JSON formatting
   - Check for missing commas, brackets, quotes

2. **Validate Formula Syntax**
   - Test formulas with `Formula.validate(formula)`
   - Ensure variables exist in context
   - Check for typos in property names

3. **Check References**
   - All `actionId` references must exist
   - All `statusId` references must exist
   - All event types should be valid

4. **Test Edge Cases**
   - What happens when health is 0?
   - What if source/target is undefined?
   - What if damage is negative?

5. **Prevent Infinite Loops**
   - Check for mutual triggers
   - Add `maxTriggersPerTurn` when needed
   - Use tags to prevent recursion

## Common Pitfalls

**Pitfall 1: Undefined Variables**
❌ `"condition": "attacker.health < 50"`
- `attacker` might not exist in event context

✅ `"condition": "source && source.resources.health.current < 50"`
- Check existence first, use correct path

**Pitfall 2: Wrong Event Phase**
❌ Using `damage:applied` to modify damage
- Too late - damage already applied

✅ Using `damage:before_apply` or `damage:calculated`
- Can still modify damage value

**Pitfall 3: Infinite Recursion**
❌ Entity A: on damage → damage B; Entity B: on damage → damage A

✅ Add trigger limits or use tags to break cycle

**Pitfall 4: Wrong Target**
❌ `"target": "source"` (invalid)
- Must use predefined target types

✅ `"target": "event_source"`
- Use correct target type

**Pitfall 5: Missing Conditions**
❌ Counterattack triggers on ALL damage (including thorns reflection)

✅ Add condition: `"condition": "!event.tags.includes('reflected')"`

## Iterative Development

**Start Simple:**
1. Create basic entities with stat modifiers
2. Add simple actions (basic attack, heal)
3. Test combat with no special mechanics
4. Add one reactive behavior at a time
5. Test each addition thoroughly
6. Build complexity gradually

**Example Progression:**
1. Knight with +10 defense (static modifier)
2. Knight with Counterattack (event listener)
3. Knight with Conditional Counterattack (only when high health)
4. Knight with Counterattack that heals (effect chaining)

## Debugging Tips

**Use Descriptions:**
Every passive, status, action, and effect should have a `description` field:
```json
{
  "id": "thorns",
  "description": "Reflects 30% of damage back to attacker",
  "eventListeners": [
    {
      "event": "damage:applied",
      "description": "Triggered when entity takes damage",
      "effects": [
        {
          "type": "damage",
          "description": "Deal reflected damage to attacker",
          ...
        }
      ]
    }
  ]
}
```

**Check Event History:**
The engine tracks all events. Review the history to see what fired and when.

**Validate Early:**
Use JSON schema validation before loading into the engine. Catch errors early.

**Test in Isolation:**
Test individual passives/statuses separately before combining them.

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

// Discover what reactive behaviors an entity has (NEW)
const reactions = entity.getEventReactions('damage:applied');
// Returns: EventReaction[] with details about what triggers
```

### Entity Reaction Enumeration

AI agents can query what reactive behaviors an entity possesses:

```typescript
interface EventReaction {
  sourceType: 'passive' | 'status' | 'equipment';
  sourceId: string;
  sourceName: string;
  event: string;
  condition?: string;
  effectsSummary: string;  // Human-readable description
  priority: EventPriority;
  maxTriggersPerTurn?: number;
  maxTriggersPerCombat?: number;
}
```

**Example Usage:**
```typescript
const knight = loadEntity('knight_with_counterattack');

// Get all reactions
const allReactions = knight.getEventReactions();
// Returns all event listeners from passives, statuses, equipment

// Get reactions to specific event
const damageReactions = knight.getEventReactions('damage:applied');
// Returns: [
//   {
//     sourceType: 'passive',
//     sourceId: 'counterattack',
//     sourceName: 'Counterattack',
//     event: 'damage:applied',
//     condition: 'target.id == self.id && event.tags.includes("physical")',
//     effectsSummary: 'Executes basic_attack on event_source',
//     priority: 'normal',
//     maxTriggersPerTurn: 1
//   }
// ]

// AI can now reason: "This knight will counterattack if I use physical attacks"
```

This enumeration allows AI agents to:
- Understand entity capabilities before combat
- Make informed tactical decisions
- Generate appropriate opponents (don't give Counterattack to both sides)
- Debug unexpected behaviors
- Generate descriptions for players
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
