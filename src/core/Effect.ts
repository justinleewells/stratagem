/**
 * Effect - Executes atomic state changes during action execution
 * 
 * Effects are the building blocks of actions and event listeners.
 * They represent specific state changes like damage, healing, status application, etc.
 */

import { EffectData, EffectTarget, GameEvent } from '../types/index.js';
import { Formula } from '../formula/Formula.js';
import { Entity } from './Entity.js';

/**
 * Result of executing an effect
 */
export interface EffectResult {
  /** Whether the effect succeeded */
  succeeded: boolean;
  
  /** The calculated value (for damage, heal, etc.) */
  value?: number;
  
  /** Error message if failed */
  error?: string;
  
  /** Additional metadata about the effect */
  metadata?: any;
}

/**
 * Context for effect execution
 */
export interface EffectContext {
  /** Entity performing the action/owning the event listener */
  source: Entity;
  
  /** Primary target entity (if applicable) */
  target?: Entity;
  
  /** All entities in the combat */
  allEntities?: Entity[];
  
  /** Event that triggered this effect (for event-driven effects) */
  event?: GameEvent;
  
  /** Result of previous effect in chain */
  previousEffect?: EffectResult;
  
  /** Additional context data */
  [key: string]: any;
}

/**
 * Effect executor - applies atomic state changes
 */
export class Effect {
  constructor(private data: EffectData) {}

  /**
   * Execute this effect
   */
  execute(context: EffectContext): EffectResult {
    // Check condition if present (but not for conditional_effect, which handles its own condition)
    if (this.data.condition && this.data.type !== 'conditional_effect') {
      const conditionMet = this.evaluateCondition(context);
      if (!conditionMet) {
        return {
          succeeded: false,
          error: 'Condition not met',
        };
      }
    }

    // Execute based on effect type
    switch (this.data.type) {
      case 'damage':
        return this.executeDamage(context);
      case 'heal':
        return this.executeHeal(context);
      case 'apply_status':
        return this.executeApplyStatus(context);
      case 'remove_status':
        return this.executeRemoveStatus(context);
      case 'modify_resource':
        return this.executeModifyResource(context);
      case 'add_modifier':
        return this.executeAddModifier(context);
      case 'remove_modifier':
        return this.executeRemoveModifier(context);
      case 'execute_action':
        return this.executeAction(context);
      case 'modify_event':
        return this.executeModifyEvent(context);
      case 'cancel_event':
        return this.executeCancelEvent(context);
      case 'conditional_effect':
        return this.executeConditionalEffect(context);
      default:
        return {
          succeeded: false,
          error: `Unknown effect type: ${this.data.type}`,
        };
    }
  }

  /**
   * Evaluate the condition formula
   * Wraps condition in ternary to get numeric result that Formula can handle
   */
  private evaluateCondition(context: EffectContext): boolean {
    if (!this.data.condition) {
      return true;
    }

    const evalContext = this.buildFormulaContext(context);
    try {
      // Wrap condition in ternary to convert boolean to number
      // Formula class expects numeric results
      const wrappedCondition = `(${this.data.condition}) ? 1 : 0`;
      const formula = new Formula(wrappedCondition);
      const result = formula.evaluate(evalContext);
      return result === 1;
    } catch (error) {
      // Condition evaluation failed - treat as false
      return false;
    }
  }

  /**
   * Build formula evaluation context from effect context
   * Converts Entity objects to formula-friendly plain objects
   */
  private buildFormulaContext(context: EffectContext): any {
    const evalContext: any = {
      source: this.entityToFormulaContext(context.source),
      self: this.entityToFormulaContext(context.source),
      attacker: this.entityToFormulaContext(context.source),
    };

    if (context.target) {
      evalContext.target = this.entityToFormulaContext(context.target);
      evalContext.defender = this.entityToFormulaContext(context.target);
    }

    if (context.event) {
      evalContext.event = context.event.data;
      
      // Convert entity references in event data
      if (context.event.data.source) {
        evalContext.event_source = this.entityToFormulaContext(context.event.data.source);
      }
      if (context.event.data.target) {
        evalContext.event_target = this.entityToFormulaContext(context.event.data.target);
      }
      
      // Expose common event data directly
      if (context.event.data.damage !== undefined) {
        evalContext.damage = context.event.data.damage;
      }
      if (context.event.data.healing !== undefined) {
        evalContext.healing = context.event.data.healing;
      }
    }

    if (context.previousEffect) {
      evalContext.previousEffect = context.previousEffect;
    }

    // Include any additional context
    for (const key in context) {
      if (!evalContext[key] && key !== 'allEntities') {
        evalContext[key] = context[key];
      }
    }

    return evalContext;
  }

  /**
   * Convert Entity to formula-friendly plain object
   */
  private entityToFormulaContext(entity: Entity): any {
    const obj: any = {
      id: entity.id,
      name: entity.name,
      tags: entity.getTags(),
      attributes: {},
      resources: {},
    };

    // Add attributes as plain values
    for (const attrName of entity.getAttributeNames()) {
      obj.attributes[attrName] = entity.getAttributeValue(attrName);
      // Also expose at top level for convenience
      obj[attrName] = entity.getAttributeValue(attrName);
    }

    // Add resources with current/max values
    for (const resName of entity.getResourceNames()) {
      const resource = entity.getResource(resName);
      if (resource) {
        obj.resources[resName] = {
          current: resource.getCurrent(),
          max: resource.getMax(),
          base: resource.getBaseMax(),
        };
      }
    }

    return obj;
  }

  /**
   * Resolve target entity from EffectTarget
   */
  private resolveTarget(targetType: EffectTarget, context: EffectContext): Entity | Entity[] | null {
    switch (targetType) {
      case 'self':
        return context.source;
      case 'selected':
        return context.target || null;
      case 'event_source':
        return context.event?.data.source || null;
      case 'event_target':
        return context.event?.data.target || null;
      case 'all_allies':
        // For now, return empty array - needs combat instance to resolve teams
        return [];
      case 'all_enemies':
        // For now, return empty array - needs combat instance to resolve teams
        return [];
      case 'all':
        return context.allEntities || [];
      default:
        return null;
    }
  }

  /**
   * Execute damage effect
   */
  private executeDamage(context: EffectContext): EffectResult {
    if (!this.data.formula) {
      return { succeeded: false, error: 'Damage effect requires formula' };
    }

    const target = this.resolveTarget(this.data.target, context);
    if (!target || Array.isArray(target)) {
      return { succeeded: false, error: 'Invalid target for damage' };
    }

    const evalContext = this.buildFormulaContext(context);
    try {
      const formula = new Formula(this.data.formula);
      const damage = formula.evaluate(evalContext);
      const damageValue = Math.max(0, Number(damage));
      
      // Apply damage to target's health resource
      const healthResource = target.getResource('health');
      if (!healthResource) {
        return { succeeded: false, error: 'Target has no health resource' };
      }

      healthResource.subtract(damageValue);

      return {
        succeeded: true,
        value: damageValue,
        metadata: {
          targetId: target.id,
          tags: this.data.tags || [],
        },
      };
    } catch (error) {
      return {
        succeeded: false,
        error: `Formula evaluation failed: ${error}`,
      };
    }
  }

  /**
   * Execute heal effect
   */
  private executeHeal(context: EffectContext): EffectResult {
    if (!this.data.formula) {
      return { succeeded: false, error: 'Heal effect requires formula' };
    }

    const target = this.resolveTarget(this.data.target, context);
    if (!target || Array.isArray(target)) {
      return { succeeded: false, error: 'Invalid target for heal' };
    }

    const evalContext = this.buildFormulaContext(context);
    try {
      const formula = new Formula(this.data.formula);
      const healing = formula.evaluate(evalContext);
      const healValue = Math.max(0, Number(healing));
      
      // Apply healing to target's health resource
      const healthResource = target.getResource('health');
      if (!healthResource) {
        return { succeeded: false, error: 'Target has no health resource' };
      }

      healthResource.add(healValue);

      return {
        succeeded: true,
        value: healValue,
        metadata: {
          targetId: target.id,
          tags: this.data.tags || [],
        },
      };
    } catch (error) {
      return {
        succeeded: false,
        error: `Formula evaluation failed: ${error}`,
      };
    }
  }

  /**
   * Execute apply_status effect
   * NOTE: This requires StatusEffect class which isn't implemented yet
   */
  private executeApplyStatus(_context: EffectContext): EffectResult {
    // TODO: Implement when StatusEffect class is available
    return {
      succeeded: false,
      error: 'apply_status not yet implemented - requires StatusEffect class',
    };
  }

  /**
   * Execute remove_status effect
   * NOTE: This requires StatusEffect class which isn't implemented yet
   */
  private executeRemoveStatus(_context: EffectContext): EffectResult {
    // TODO: Implement when StatusEffect class is available
    return {
      succeeded: false,
      error: 'remove_status not yet implemented - requires StatusEffect class',
    };
  }

  /**
   * Execute modify_resource effect
   */
  private executeModifyResource(context: EffectContext): EffectResult {
    if (!this.data.formula) {
      return { succeeded: false, error: 'modify_resource effect requires formula' };
    }

    const target = this.resolveTarget(this.data.target, context);
    if (!target || Array.isArray(target)) {
      return { succeeded: false, error: 'Invalid target for modify_resource' };
    }

    // For modify_resource, we need to know which resource to modify
    // This should come from tags or metadata
    const resourceName = this.data.tags?.[0] || 'health';
    const resource = target.getResource(resourceName);
    if (!resource) {
      return { succeeded: false, error: `Target has no resource: ${resourceName}` };
    }

    const evalContext = this.buildFormulaContext(context);
    try {
      const formula = new Formula(this.data.formula);
      const newValue = formula.evaluate(evalContext);
      const currentValue = resource.getCurrent();
      
      resource.setCurrent(Number(newValue));
      const change = resource.getCurrent() - currentValue;

      return {
        succeeded: true,
        value: change,
        metadata: {
          targetId: target.id,
          resourceName,
          oldValue: currentValue,
          newValue: resource.getCurrent(),
        },
      };
    } catch (error) {
      return {
        succeeded: false,
        error: `Formula evaluation failed: ${error}`,
      };
    }
  }

  /**
   * Execute add_modifier effect
   * NOTE: This requires Modifier management on Entity which isn't fully implemented yet
   */
  private executeAddModifier(_context: EffectContext): EffectResult {
    // TODO: Implement when Entity modifier management is available
    return {
      succeeded: false,
      error: 'add_modifier not yet implemented - requires Entity modifier management',
    };
  }

  /**
   * Execute remove_modifier effect
   * NOTE: This requires Modifier management on Entity which isn't fully implemented yet
   */
  private executeRemoveModifier(_context: EffectContext): EffectResult {
    // TODO: Implement when Entity modifier management is available
    return {
      succeeded: false,
      error: 'remove_modifier not yet implemented - requires Entity modifier management',
    };
  }

  /**
   * Execute execute_action effect
   * NOTE: This requires Action class which isn't implemented yet
   */
  private executeAction(_context: EffectContext): EffectResult {
    // TODO: Implement when Action class is available
    return {
      succeeded: false,
      error: 'execute_action not yet implemented - requires Action class',
    };
  }

  /**
   * Execute modify_event effect
   */
  private executeModifyEvent(context: EffectContext): EffectResult {
    if (!context.event) {
      return { succeeded: false, error: 'modify_event requires event context' };
    }

    if (!this.data.eventModifications) {
      return { succeeded: false, error: 'modify_event requires eventModifications' };
    }

    const evalContext = this.buildFormulaContext(context);
    const modifications: Record<string, any> = {};

    try {
      for (const [key, formulaStr] of Object.entries(this.data.eventModifications)) {
        const formula = new Formula(formulaStr);
        const value = formula.evaluate(evalContext);
        modifications[key] = value;
      }

      return {
        succeeded: true,
        metadata: {
          modifications,
        },
      };
    } catch (error) {
      return {
        succeeded: false,
        error: `Event modification failed: ${error}`,
      };
    }
  }

  /**
   * Execute cancel_event effect
   */
  private executeCancelEvent(context: EffectContext): EffectResult {
    if (!context.event) {
      return { succeeded: false, error: 'cancel_event requires event context' };
    }

    return {
      succeeded: true,
      metadata: {
        cancelled: true,
      },
    };
  }

  /**
   * Execute conditional_effect
   */
  private executeConditionalEffect(context: EffectContext): EffectResult {
    if (!this.data.condition) {
      return { succeeded: false, error: 'conditional_effect requires condition' };
    }

    const conditionMet = this.evaluateCondition(context);
    const effectsToExecute = conditionMet ? this.data.thenEffects : this.data.elseEffects;

    if (!effectsToExecute || effectsToExecute.length === 0) {
      return { succeeded: true, metadata: { branch: conditionMet ? 'then' : 'else' } };
    }

    // Execute the chosen effects in sequence
    const results: EffectResult[] = [];
    let previousResult: EffectResult | undefined;

    for (const effectData of effectsToExecute) {
      const effect = new Effect(effectData);
      const effectContext = {
        ...context,
        previousEffect: previousResult,
      };
      const result = effect.execute(effectContext);
      results.push(result);
      previousResult = result;

      // If an effect fails, stop execution
      if (!result.succeeded) {
        break;
      }
    }

    return {
      succeeded: results.every(r => r.succeeded),
      metadata: {
        branch: conditionMet ? 'then' : 'else',
        results,
      },
    };
  }

  /**
   * Get the effect data
   */
  getData(): EffectData {
    return this.data;
  }
}
