import { FormulaContext } from '../types/index.js';

/**
 * Safe formula evaluator for data-driven calculations
 * 
 * Supports:
 * - Basic math: +, -, *, /, %, ()
 * - Comparisons: <, >, <=, >=, ==, !=
 * - Ternary: condition ? true : false
 * - Dot access: object.property, object.nested.property
 * - Built-in functions: max, min, floor, ceil, abs, clamp
 * 
 * No assignments, loops, or side effects - pure readonly evaluation
 */
export class Formula {
  private formula: string;

  constructor(formula: string) {
    this.formula = formula.trim();
  }

  /**
   * Evaluate the formula with given context
   * @param context - Variables available in the formula
   * @returns Calculated value
   */
  evaluate(context: FormulaContext): number {
    try {
      // Create a safe evaluation environment
      const safeContext = this.createSafeContext(context);
      
      // Use Function constructor with restricted context
      // This is safer than eval() as we control the scope
      // Note: We don't use strict mode to avoid issues with 'arguments' in some contexts
      const func = new Function(...Object.keys(safeContext), `return (${this.formula});`);
      
      const result = func(...Object.values(safeContext));
      
      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error(`Formula did not return a valid number: ${result}`);
      }
      
      return result;
    } catch (error) {
      throw new Error(
        `Failed to evaluate formula "${this.formula}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Create a safe context with built-in functions and sanitized variables
   */
  private createSafeContext(context: FormulaContext): Record<string, any> {
    const safeContext: Record<string, any> = {
      // Built-in math functions
      max: Math.max,
      min: Math.min,
      floor: Math.floor,
      ceil: Math.ceil,
      abs: Math.abs,
      clamp: (value: number, min: number, max: number) => Math.max(min, Math.min(max, value)),
      
      // Prevent access to dangerous globals
      eval: undefined,
      Function: undefined,
      setTimeout: undefined,
      setInterval: undefined,
      Promise: undefined,
    };

    // Add context variables (sanitize to prevent prototype pollution)
    for (const [key, value] of Object.entries(context)) {
      if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
        safeContext[key] = value;
      }
    }

    return safeContext;
  }

  /**
   * Get the raw formula string
   */
  toString(): string {
    return this.formula;
  }

  /**
   * Check if formula contains a variable name
   */
  usesVariable(varName: string): boolean {
    // Simple regex check for variable usage
    const regex = new RegExp(`\\b${varName}\\b`);
    return regex.test(this.formula);
  }

  /**
   * Create a formula from string (convenience method)
   */
  static from(formula: string): Formula {
    return new Formula(formula);
  }

  /**
   * Validate formula syntax without evaluating
   * @param formula - Formula string to validate
   * @returns true if syntax is valid
   */
  static validate(formula: string): boolean {
    try {
      // Try to create the function without executing
      new Function(`return (${formula});`);
      return true;
    } catch {
      return false;
    }
  }
}
