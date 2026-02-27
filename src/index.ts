/**
 * Stratagem - A data-driven, deterministic library for simulating RPG battles
 * 
 * @packageDocumentation
 */

// Core types
export * from './types/index.js';

// Core classes
export { Attribute } from './core/Attribute.js';
export { Resource } from './core/Resource.js';
export { Entity } from './core/Entity.js';

// Modifier system
export { Modifier } from './modifiers/Modifier.js';
export { ModifierStack } from './modifiers/ModifierStack.js';

// Combat system (to be implemented)
// export * from './combat/CombatController.js';
// export * from './combat/TurnStrategy.js';

// Effects (to be implemented)
// export * from './effects/Effect.js';

// Targeting (to be implemented)
// export * from './targeting/TargetSelector.js';

// Events (to be implemented)
// export * from './events/EventBus.js';

// Formula
export * from './formula/Formula.js';

// Random
export * from './random/RandomSource.js';

// Events
export * from './events/EventBus.js';

// Plugins (to be implemented)
// export * from './plugins/Plugin.js';
