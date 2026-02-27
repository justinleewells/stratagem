/**
 * Core type definitions for Stratagem
 */

/**
 * Modifier types define how a modifier changes a value
 */
export type ModifierType = 'add' | 'multiply' | 'set' | 'min' | 'max';

/**
 * Target types define who can be targeted by an action
 */
export type TargetType =
  | 'self'
  | 'single_ally'
  | 'single_enemy'
  | 'all_allies'
  | 'all_enemies'
  | 'all_entities'
  | 'area'
  | 'none';

/**
 * Effect types define what kind of state change occurs
 */
export type EffectType =
  | 'damage'
  | 'heal'
  | 'apply_status'
  | 'remove_status'
  | 'modify_resource'
  | 'add_modifier'
  | 'remove_modifier'
  | 'execute_action'           // Execute an action (counterattack, chain skills)
  | 'modify_event'             // Modify current event data (block, reduce damage)
  | 'cancel_event'             // Cancel current event (invulnerability, immunity)
  | 'apply_to_source'          // Apply effect to event source (thorns, reflection)
  | 'apply_to_all_allies'      // Apply effect to all allies (AoE buff on trigger)
  | 'apply_to_all_enemies'     // Apply effect to all enemies (AoE debuff on trigger)
  | 'conditional_effect';      // Different effect based on condition

/**
 * Stack rules define how duplicate status effects behave
 */
export type StackRule = 'replace' | 'stack' | 'refresh';

/**
 * Tick timing defines when status effects trigger
 */
export type TickTiming = 'turn_start' | 'turn_end' | 'phase_start' | 'phase_end';

/**
 * Event listener priority levels (semantic, more AI-friendly)
 */
export type EventPriority = 'highest' | 'high' | 'normal' | 'low' | 'lowest';

/**
 * Effect target types for event-driven effects
 */
export type EffectTarget = 
  | 'self'           // Entity that owns the passive/status
  | 'selected'       // Explicitly selected target
  | 'all'            // All entities
  | 'event_source'   // Entity that caused the event
  | 'event_target'   // Entity affected by the event
  | 'all_allies'     // All allies of self
  | 'all_enemies';   // All enemies of self

/**
 * Modifier source types for ordering
 */
export type ModifierSourceType = 'passive' | 'equipment' | 'status' | 'temporary';

/**
 * A modifier changes how a value is calculated
 */
export interface Modifier {
  /** What value to modify (e.g., "attack", "incoming_damage") */
  target: string;
  
  /** How to modify the value */
  type: ModifierType;
  
  /** The value to apply (number or formula string) */
  value: number | string;
  
  /** Optional condition formula - modifier only applies if this evaluates to true */
  condition?: string;
  
  /** Priority for ordering (higher = applied first) */
  priority: number;
  
  /** What created this modifier */
  source: ModifierSource;
}

/**
 * Source of a modifier (for ordering and tracking)
 */
export interface ModifierSource {
  type: ModifierSourceType;
  id: string;
  createdAt: number; // For stable ordering
}

/**
 * An attribute is a numerical stat with modifiers
 */
export interface AttributeData {
  base: number;
}

/**
 * A resource is a bounded attribute (health, mana, etc.)
 */
export interface ResourceData {
  base: number;
  current: number;
}

/**
 * An event listener for reactive behaviors
 */
export interface EventListenerData {
  /** Event type to listen for (e.g., 'damage:applied', 'action:executed') */
  event: string;
  
  /** Optional condition formula - only trigger if this evaluates to true */
  condition?: string;
  
  /** Priority for event handling (semantic: highest, high, normal, low, lowest) */
  priority?: EventPriority;
  
  /** Effects to apply when triggered (executed conditionally in sequence) */
  effects: EffectData[];
  
  /** Maximum times this can trigger per turn (optional, for preventing spam) */
  maxTriggersPerTurn?: number;
  
  /** Maximum times this can trigger per combat (optional) */
  maxTriggersPerCombat?: number;
  
  /** Consume/remove this passive or status effect after triggering? */
  consumeOnTrigger?: boolean;
  
  /** Description for AI/debugging purposes */
  description?: string;
}

/**
 * An effect is an atomic state change
 */
export interface EffectData {
  type: EffectType;
  formula?: string;
  target: EffectTarget;
  tags?: string[];
  
  // For execute_action
  actionId?: string;
  
  // For apply_status/remove_status
  statusId?: string;
  
  // For modify_event (key -> new value formula)
  eventModifications?: Record<string, string>;
  
  // For conditional_effect
  thenEffects?: EffectData[];
  elseEffects?: EffectData[];
  
  // Condition for this specific effect (for conditional chaining)
  condition?: string;
  
  // Description for AI/debugging
  description?: string;
}

/**
 * An action defines what an entity can do
 */
export interface ActionData {
  id: string;
  name: string;
  tags?: string[];
  targetType: TargetType;
  costs?: Record<string, number>;
  condition?: string;
  effects: EffectData[];
}

/**
 * A status effect is a temporary modifier source
 */
export interface StatusEffectData {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  duration: number;
  stackRule: StackRule;
  tickTiming: TickTiming;
  modifiers: Omit<Modifier, 'source'>[];
  onTick?: EffectData[];
  
  /** Event-driven behaviors (NEW) */
  eventListeners?: EventListenerData[];
}

/**
 * A passive is a permanent modifier source
 */
export interface PassiveData {
  id: string;
  name: string;
  description?: string;
  modifiers: Omit<Modifier, 'source'>[];
  
  /** Event-driven behaviors (NEW) */
  eventListeners?: EventListenerData[];
}

/**
 * Equipment is a togglable modifier source
 */
export interface EquipmentData {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  modifiers: Omit<Modifier, 'source'>[];
  
  /** Event-driven behaviors (NEW) */
  eventListeners?: EventListenerData[];
}

/**
 * An entity template defines a participant
 */
export interface EntityData {
  id: string;
  name: string;
  tags?: string[];
  attributes: Record<string, AttributeData>;
  resources: Record<string, ResourceData>;
  passives?: string[];
  equipment?: string[];
  actions?: string[];
}

/**
 * Combat instance configuration
 */
export interface InstanceConfig {
  seed: number;
  turnStrategy: string;
  entities: EntityInstanceData[];
  victoryCondition: string;
}

/**
 * Entity instance in combat
 */
export interface EntityInstanceData {
  templateId: string;
  team: string;
  instanceId?: string;
}

/**
 * Event data structure
 */
export interface GameEvent<T = any> {
  type: string;
  timestamp: number;
  data: T;
  cancelled: boolean;
  metadata?: any;
}

/**
 * Event listener callback
 */
export type EventListener<T = any> = (event: GameEvent<T>) => GameEvent<T> | void;

/**
 * Formula evaluation context
 */
export interface FormulaContext {
  attacker?: any;
  target?: any;
  action?: any;
  random?: any; // RandomSource - avoiding circular dependency
  [key: string]: any;
}

/**
 * Event context for event listener formulas
 * Provides both explicit access and convenient shortcuts
 */
export interface EventContext {
  /** The full event object */
  event: GameEvent;
  
  /** Entity that owns the passive/status/equipment with this listener */
  self: any; // Entity
  
  /** Convenient shortcut for event.data.source (entity that caused event) */
  source?: any; // Entity
  
  /** Convenient shortcut for event.data.target (entity affected by event) */
  target?: any; // Entity
  
  /** Convenient shortcut for event.data.attacker */
  attacker?: any; // Entity
  
  /** Convenient shortcut for event.data.defender */
  defender?: any; // Entity
  
  /** Convenient shortcut for event.data.damage */
  damage?: number;
  
  /** Convenient shortcut for event.data.healing */
  healing?: number;
  
  /** Convenient shortcut for event.data.action */
  action?: any; // Action
  
  /** Random source for deterministic variance */
  random?: any; // RandomSource
  
  /** Result of previous effect in chain (for conditional effects) */
  previousEffect?: {
    succeeded: boolean;
    value?: any;
    error?: string;
  };
  
  /** Allow arbitrary event data access */
  [key: string]: any;
}

/**
 * Event reaction information (for AI enumeration)
 */
export interface EventReaction {
  /** Type of source (passive, status, equipment) */
  sourceType: 'passive' | 'status' | 'equipment';
  
  /** ID of the passive/status/equipment */
  sourceId: string;
  
  /** Name of the source */
  sourceName: string;
  
  /** Event type this reacts to */
  event: string;
  
  /** Condition formula (if any) */
  condition?: string;
  
  /** Human-readable summary of what happens */
  effectsSummary: string;
  
  /** Priority level */
  priority: EventPriority;
  
  /** Trigger limits */
  maxTriggersPerTurn?: number;
  maxTriggersPerCombat?: number;
}

/**
 * Turn strategy interface
 */
export interface TurnStrategy {
  /** Get the next actor, or null if none available */
  getNextActor(instance: any): any | null;
  
  /** Check if current phase is complete */
  isPhaseComplete(instance: any): boolean;
  
  /** Reset for new phase/round */
  reset?(instance: any): void;
}

/**
 * State change result from simulation
 */
export interface StateChange {
  damageDealt?: number;
  healingDone?: number;
  resourceChanges?: Record<string, Record<string, number>>;
  statusesApplied?: string[];
  statusesRemoved?: string[];
  willDefeat?: boolean;
}

/**
 * Combat state snapshot
 */
export interface CombatState {
  turnNumber: number;
  phase: string;
  entities: any[];
  history: GameEvent[];
  seed: number;
}
