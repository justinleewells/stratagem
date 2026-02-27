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
  | 'remove_modifier';

/**
 * Stack rules define how duplicate status effects behave
 */
export type StackRule = 'replace' | 'stack' | 'refresh';

/**
 * Tick timing defines when status effects trigger
 */
export type TickTiming = 'turn_start' | 'turn_end' | 'phase_start' | 'phase_end';

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
 * An effect is an atomic state change
 */
export interface EffectData {
  type: EffectType;
  formula: string;
  target: 'self' | 'selected' | 'all';
  tags?: string[];
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
  tags?: string[];
  duration: number;
  stackRule: StackRule;
  tickTiming: TickTiming;
  modifiers: Omit<Modifier, 'source'>[];
  onTick?: EffectData[];
}

/**
 * A passive is a permanent modifier source
 */
export interface PassiveData {
  id: string;
  name: string;
  modifiers: Omit<Modifier, 'source'>[];
}

/**
 * Equipment is a togglable modifier source
 */
export interface EquipmentData {
  id: string;
  name: string;
  tags?: string[];
  modifiers: Omit<Modifier, 'source'>[];
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
