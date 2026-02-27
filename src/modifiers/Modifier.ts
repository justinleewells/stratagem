import { Modifier as ModifierData, ModifierSource, ModifierType } from '../types/index.js';
import { Formula } from '../formula/Formula.js';

/**
 * A modifier changes how a value is calculated
 * 
 * Modifiers are the universal extension mechanism in Stratagem.
 * They can be:
 * - Static (value is a number)
 * - Dynamic (value is a formula string)
 * - Conditional (only apply if condition evaluates to true)
 */
export class Modifier {
  public readonly target: string;
  public readonly type: ModifierType;
  public readonly value: number | Formula;
  public readonly condition?: Formula;
  public readonly priority: number;
  public readonly source: ModifierSource;

  constructor(data: ModifierData) {
    this.target = data.target;
    this.type = data.type;
    this.priority = data.priority;
    this.source = data.source;

    // Parse value (can be number or formula string)
    if (typeof data.value === 'number') {
      this.value = data.value;
    } else {
      this.value = new Formula(data.value);
    }

    // Parse condition if present
    if (data.condition) {
      this.condition = new Formula(data.condition);
    }
  }

  /**
   * Evaluate the modifier value in a given context
   * @param context - Evaluation context (entity, event data, etc.)
   * @returns Evaluated numerical value
   */
  evaluateValue(context: any): number {
    if (typeof this.value === 'number') {
      return this.value;
    }
    return this.value.evaluate(context);
  }

  /**
   * Check if this modifier should apply in a given context
   * @param context - Evaluation context
   * @returns true if modifier should apply
   */
  shouldApply(context: any): boolean {
    if (!this.condition) {
      return true;
    }
    
    try {
      const result = this.condition.evaluate(context);
      return result !== 0; // Treat non-zero as true
    } catch (error) {
      // If formula evaluation fails (e.g., returns boolean), try wrapping in ternary
      // This handles conditions like "health < 50" which return boolean
      const wrappedFormula = new Formula(`(${this.condition.toString()}) ? 1 : 0`);
      const result = wrappedFormula.evaluate(context);
      return result !== 0;
    }
  }

  /**
   * Serialize to JSON
   */
  toJSON(): ModifierData {
    return {
      target: this.target,
      type: this.type,
      value: typeof this.value === 'number' ? this.value : this.value.toString(),
      condition: this.condition?.toString(),
      priority: this.priority,
      source: this.source,
    };
  }

  /**
   * Create from JSON data
   */
  static fromJSON(data: ModifierData): Modifier {
    return new Modifier(data);
  }
}
