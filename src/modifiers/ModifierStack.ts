import { Modifier } from './Modifier.js';
import { ModifierType } from '../types/index.js';

/**
 * Deterministic modifier calculation engine
 * 
 * Applies modifiers in a specific order to compute final values:
 * 1. Sort by priority (higher first)
 * 2. Within priority, sort by type: set → add → multiply → min → max
 * 3. Within type, sort by source type: passive → equipment → status → temporary
 * 4. Within source type, sort by creation order
 * 5. Apply in order
 */
export class ModifierStack {
  private modifiers: Modifier[] = [];
  private cache: Map<string, number> = new Map();
  private isDirty: boolean = true;

  /**
   * Add a modifier to the stack
   */
  addModifier(modifier: Modifier): void {
    this.modifiers.push(modifier);
    this.isDirty = true;
  }

  /**
   * Remove a modifier from the stack
   */
  removeModifier(modifier: Modifier): boolean {
    const index = this.modifiers.indexOf(modifier);
    if (index !== -1) {
      this.modifiers.splice(index, 1);
      this.isDirty = true;
      return true;
    }
    return false;
  }

  /**
   * Remove all modifiers from a specific source
   */
  removeModifiersFromSource(sourceId: string): number {
    const initialLength = this.modifiers.length;
    this.modifiers = this.modifiers.filter(m => m.source.id !== sourceId);
    
    if (this.modifiers.length !== initialLength) {
      this.isDirty = true;
      return initialLength - this.modifiers.length;
    }
    return 0;
  }

  /**
   * Clear all modifiers
   */
  clear(): void {
    this.modifiers = [];
    this.isDirty = true;
  }

  /**
   * Calculate final value with all modifiers applied
   * @param baseValue - Starting value before modifiers
   * @param context - Context for formula evaluation and conditions
   * @returns Final computed value
   */
  calculate(baseValue: number, context: any = {}): number {
    // Only use cache if context is empty (simple case)
    const hasContext = Object.keys(context).length > 0;
    const cacheKey = this.getCacheKey(baseValue, context);
    
    // Use cached value if available and not dirty
    if (!hasContext && !this.isDirty && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Filter modifiers that should apply
    const activeModifiers = this.modifiers.filter(m => m.shouldApply(context));

    // Sort modifiers deterministically
    const sorted = this.sortModifiers(activeModifiers);

    // Apply modifiers in order
    let value = baseValue;

    // Group by type for proper application order
    const byType = this.groupByType(sorted);

    // Apply 'set' modifiers (last one wins)
    if (byType.set && byType.set.length > 0) {
      const lastSet = byType.set[byType.set.length - 1];
      value = lastSet.evaluateValue(context);
    }

    // Apply 'add' modifiers (sum)
    if (byType.add) {
      for (const modifier of byType.add) {
        value += modifier.evaluateValue(context);
      }
    }

    // Apply 'multiply' modifiers (product)
    if (byType.multiply) {
      for (const modifier of byType.multiply) {
        value *= modifier.evaluateValue(context);
      }
    }

    // Apply 'min' modifiers (ensure value is at least this)
    if (byType.min) {
      for (const modifier of byType.min) {
        value = Math.max(value, modifier.evaluateValue(context));
      }
    }

    // Apply 'max' modifiers (ensure value is at most this)
    if (byType.max) {
      for (const modifier of byType.max) {
        value = Math.min(value, modifier.evaluateValue(context));
      }
    }

    // Cache result (only if no context)
    if (!hasContext) {
      this.cache.set(cacheKey, value);
      this.isDirty = false;
    }

    return value;
  }

  /**
   * Generate cache key from baseValue and context
   */
  private getCacheKey(baseValue: number, _context: any): string {
    // Simple cache key - just baseValue for now
    // Could be extended to include context if needed
    return `${baseValue}`;
  }

  /**
   * Sort modifiers deterministically
   */
  private sortModifiers(modifiers: Modifier[]): Modifier[] {
    return [...modifiers].sort((a, b) => {
      // 1. Priority (higher first)
      if (a.priority !== b.priority) {
        return b.priority - a.priority;
      }

      // 2. Type order: set → add → multiply → min → max
      const typeOrder = this.getTypeOrder(a.type) - this.getTypeOrder(b.type);
      if (typeOrder !== 0) {
        return typeOrder;
      }

      // 3. Source type order: passive → equipment → status → temporary
      const sourceTypeOrder = this.getSourceTypeOrder(a.source.type) - this.getSourceTypeOrder(b.source.type);
      if (sourceTypeOrder !== 0) {
        return sourceTypeOrder;
      }

      // 4. Creation order (stable sort)
      return a.source.createdAt - b.source.createdAt;
    });
  }

  /**
   * Get type order for sorting
   */
  private getTypeOrder(type: ModifierType): number {
    const order: Record<ModifierType, number> = {
      'set': 0,
      'add': 1,
      'multiply': 2,
      'min': 3,
      'max': 4,
    };
    return order[type];
  }

  /**
   * Get source type order for sorting
   */
  private getSourceTypeOrder(sourceType: string): number {
    const order: Record<string, number> = {
      'passive': 0,
      'equipment': 1,
      'status': 2,
      'temporary': 3,
    };
    return order[sourceType] ?? 999;
  }

  /**
   * Group modifiers by type
   */
  private groupByType(modifiers: Modifier[]): Record<ModifierType, Modifier[]> {
    const groups: any = {};
    
    for (const modifier of modifiers) {
      if (!groups[modifier.type]) {
        groups[modifier.type] = [];
      }
      groups[modifier.type].push(modifier);
    }

    return groups;
  }

  /**
   * Get all modifiers (for inspection)
   */
  getModifiers(): Modifier[] {
    return [...this.modifiers];
  }

  /**
   * Get count of modifiers
   */
  count(): number {
    return this.modifiers.length;
  }

  /**
   * Invalidate cache (call when context changes)
   */
  invalidateCache(): void {
    this.cache.clear();
    this.isDirty = true;
  }

  /**
   * Get modifiers from a specific source
   */
  getModifiersFromSource(sourceId: string): Modifier[] {
    return this.modifiers.filter(m => m.source.id === sourceId);
  }
}
