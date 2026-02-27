import { AttributeData } from '../types/index.js';
import { ModifierStack } from '../modifiers/ModifierStack.js';
import { Modifier } from '../modifiers/Modifier.js';

/**
 * A named numerical value computed via modifier stacking
 * 
 * Attributes represent entity capabilities like attack, defense, speed, etc.
 * They have a base value that is modified by equipment, passives, status effects, etc.
 */
export class Attribute {
  public readonly name: string;
  private baseValue: number;
  private modifierStack: ModifierStack;

  constructor(name: string, data: AttributeData) {
    this.name = name;
    this.baseValue = data.base;
    this.modifierStack = new ModifierStack();
  }

  /**
   * Get the base value (before modifiers)
   */
  getBase(): number {
    return this.baseValue;
  }

  /**
   * Set the base value
   */
  setBase(value: number): void {
    this.baseValue = value;
    this.modifierStack.invalidateCache();
  }

  /**
   * Get the final calculated value (with all modifiers applied)
   * @param context - Context for formula evaluation and conditional modifiers
   * @returns Final computed value
   */
  getValue(context: any = {}): number {
    return this.modifierStack.calculate(this.baseValue, context);
  }

  /**
   * Add a modifier to this attribute
   */
  addModifier(modifier: Modifier): void {
    if (modifier.target !== this.name) {
      throw new Error(
        `Cannot add modifier targeting "${modifier.target}" to attribute "${this.name}"`
      );
    }
    this.modifierStack.addModifier(modifier);
  }

  /**
   * Remove a specific modifier
   */
  removeModifier(modifier: Modifier): boolean {
    return this.modifierStack.removeModifier(modifier);
  }

  /**
   * Remove all modifiers from a specific source
   */
  removeModifiersFromSource(sourceId: string): number {
    return this.modifierStack.removeModifiersFromSource(sourceId);
  }

  /**
   * Get all modifiers currently applied
   */
  getModifiers(): Modifier[] {
    return this.modifierStack.getModifiers();
  }

  /**
   * Get modifiers from a specific source
   */
  getModifiersFromSource(sourceId: string): Modifier[] {
    return this.modifierStack.getModifiersFromSource(sourceId);
  }

  /**
   * Clear all modifiers
   */
  clearModifiers(): void {
    this.modifierStack.clear();
  }

  /**
   * Get count of modifiers
   */
  getModifierCount(): number {
    return this.modifierStack.count();
  }

  /**
   * Serialize to JSON
   */
  toJSON(): AttributeData {
    return {
      base: this.baseValue,
    };
  }

  /**
   * Create from JSON data
   */
  static fromJSON(name: string, data: AttributeData): Attribute {
    return new Attribute(name, data);
  }

  /**
   * Clone this attribute (with same base but no modifiers)
   */
  clone(): Attribute {
    return new Attribute(this.name, { base: this.baseValue });
  }

  /**
   * Clone with modifiers
   */
  cloneWithModifiers(): Attribute {
    const cloned = this.clone();
    const modifiers = this.getModifiers();
    for (const modifier of modifiers) {
      cloned.addModifier(modifier);
    }
    return cloned;
  }
}
