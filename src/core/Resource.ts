import { ResourceData } from '../types/index.js';
import { Attribute } from './Attribute.js';
import { EventBus } from '../events/EventBus.js';

/**
 * A bounded attribute with current/max values
 * 
 * Resources represent consumable values like health, mana, stamina, etc.
 * They have:
 * - Current value (can be spent/restored)
 * - Max value (computed via modifiers like Attribute)
 * - Min value (usually 0, but configurable)
 * 
 * Emits events on depletion and changes.
 */
export class Resource {
  public readonly name: string;
  private baseMax: number;
  private currentValue: number;
  private minValue: number = 0;
  private maxAttribute: Attribute;
  private eventBus?: EventBus;

  constructor(name: string, data: ResourceData, eventBus?: EventBus) {
    this.name = name;
    this.baseMax = data.base;
    this.currentValue = data.current;
    this.eventBus = eventBus;
    
    // Create attribute for max value (can be modified)
    this.maxAttribute = new Attribute(`${name}_max`, { base: data.base });
  }

  /**
   * Get the base max value (before modifiers)
   */
  getBaseMax(): number {
    return this.baseMax;
  }

  /**
   * Set the base max value
   */
  setBaseMax(value: number): void {
    this.baseMax = value;
    this.maxAttribute.setBase(value);
  }

  /**
   * Get the current value
   */
  getCurrent(): number {
    return this.currentValue;
  }

  /**
   * Get the maximum value (with modifiers applied)
   */
  getMax(context: any = {}): number {
    return this.maxAttribute.getValue(context);
  }

  /**
   * Get the minimum value
   */
  getMin(): number {
    return this.minValue;
  }

  /**
   * Set the minimum value
   */
  setMin(value: number): void {
    this.minValue = value;
    // Enforce new minimum
    if (this.currentValue < this.minValue) {
      this.setCurrent(this.minValue);
    }
  }

  /**
   * Set the current value (clamped to min/max)
   */
  setCurrent(value: number, context: any = {}): void {
    const oldValue = this.currentValue;
    const max = this.getMax(context);
    
    // Clamp to min/max
    this.currentValue = Math.max(this.minValue, Math.min(value, max));
    
    // Emit events if value changed
    if (oldValue !== this.currentValue && this.eventBus) {
      this.eventBus.emit('resource:changed', {
        resource: this.name,
        oldValue,
        newValue: this.currentValue,
        delta: this.currentValue - oldValue,
      });

      // Emit depletion event if reached minimum
      if (this.currentValue === this.minValue && oldValue > this.minValue) {
        this.eventBus.emit('resource:depleted', {
          resource: this.name,
        });
      }

      // Emit restored event if was depleted and now restored
      if (oldValue === this.minValue && this.currentValue > this.minValue) {
        this.eventBus.emit('resource:restored', {
          resource: this.name,
          newValue: this.currentValue,
        });
      }
    }
  }

  /**
   * Add to current value (respects min/max)
   */
  add(amount: number, context: any = {}): number {
    const oldValue = this.currentValue;
    this.setCurrent(this.currentValue + amount, context);
    return this.currentValue - oldValue;
  }

  /**
   * Subtract from current value (respects min/max)
   */
  subtract(amount: number, context: any = {}): number {
    return -this.add(-amount, context);
  }

  /**
   * Set current to maximum
   */
  setToMax(context: any = {}): void {
    this.setCurrent(this.getMax(context), context);
  }

  /**
   * Set current to minimum
   */
  setToMin(context: any = {}): void {
    this.setCurrent(this.minValue, context);
  }

  /**
   * Check if resource is at maximum
   */
  isAtMax(context: any = {}): boolean {
    return this.currentValue >= this.getMax(context);
  }

  /**
   * Check if resource is at minimum (depleted)
   */
  isAtMin(): boolean {
    return this.currentValue <= this.minValue;
  }

  /**
   * Check if resource is depleted (at minimum, usually 0)
   */
  isDepleted(): boolean {
    return this.isAtMin();
  }

  /**
   * Get percentage of current/max (0.0 to 1.0)
   */
  getPercentage(context: any = {}): number {
    const max = this.getMax(context);
    if (max === 0) return 0;
    return this.currentValue / max;
  }

  /**
   * Get the max attribute (for adding modifiers)
   */
  getMaxAttribute(): Attribute {
    return this.maxAttribute;
  }

  /**
   * Serialize to JSON
   */
  toJSON(): ResourceData {
    return {
      base: this.baseMax,
      current: this.currentValue,
    };
  }

  /**
   * Create from JSON data
   */
  static fromJSON(name: string, data: ResourceData, eventBus?: EventBus): Resource {
    return new Resource(name, data, eventBus);
  }

  /**
   * Clone this resource
   */
  clone(eventBus?: EventBus): Resource {
    const cloned = new Resource(
      this.name,
      { base: this.baseMax, current: this.currentValue },
      eventBus
    );
    cloned.setMin(this.minValue);
    return cloned;
  }

  /**
   * Clone with modifiers
   */
  cloneWithModifiers(eventBus?: EventBus): Resource {
    const cloned = this.clone(eventBus);
    
    // Copy modifiers from max attribute
    const modifiers = this.maxAttribute.getModifiers();
    for (const modifier of modifiers) {
      cloned.maxAttribute.addModifier(modifier);
    }
    
    return cloned;
  }
}
