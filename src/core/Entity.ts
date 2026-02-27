import { EntityData } from '../types/index.js';
import { Attribute } from './Attribute.js';
import { Resource } from './Resource.js';
import { EventBus } from '../events/EventBus.js';
import { Modifier } from '../modifiers/Modifier.js';

/**
 * A participant in combat
 * 
 * Entities are pure state containers that hold:
 * - Attributes (attack, defense, speed, etc.)
 * - Resources (health, mana, stamina, etc.)
 * - Tags (for game logic like ["undead", "elite"])
 * - Modifier sources (passives, equipment, status effects)
 * 
 * Entities have no inherent behavior - they are data structures that
 * other systems (combat controller, actions, etc.) operate on.
 */
export class Entity {
  public readonly id: string;
  public readonly templateId: string;
  public name: string;
  public tags: Set<string>;
  
  private attributes: Map<string, Attribute> = new Map();
  private resources: Map<string, Resource> = new Map();
  private passives: Set<string> = new Set();
  private equipment: Set<string> = new Set();
  private statusEffects: Set<string> = new Set();
  private actions: Set<string> = new Set();

  constructor(data: EntityData, eventBus?: EventBus, instanceId?: string) {
    this.templateId = data.id;
    this.id = instanceId || data.id;
    this.name = data.name;
    this.tags = new Set(data.tags || []);

    // Initialize attributes
    for (const [name, attrData] of Object.entries(data.attributes)) {
      this.attributes.set(name, new Attribute(name, attrData));
    }

    // Initialize resources
    for (const [name, resData] of Object.entries(data.resources)) {
      this.resources.set(name, new Resource(name, resData, eventBus));
    }

    // Initialize passives, equipment, actions (just IDs)
    if (data.passives) {
      data.passives.forEach(id => this.passives.add(id));
    }
    if (data.equipment) {
      data.equipment.forEach(id => this.equipment.add(id));
    }
    if (data.actions) {
      data.actions.forEach(id => this.actions.add(id));
    }
  }

  /**
   * Get an attribute by name
   */
  getAttribute(name: string): Attribute | undefined {
    return this.attributes.get(name);
  }

  /**
   * Get attribute value (with modifiers applied)
   */
  getAttributeValue(name: string, context: any = {}): number {
    const attr = this.attributes.get(name);
    if (!attr) {
      throw new Error(`Attribute "${name}" not found on entity "${this.id}"`);
    }
    return attr.getValue(context);
  }

  /**
   * Get all attribute names
   */
  getAttributeNames(): string[] {
    return Array.from(this.attributes.keys());
  }

  /**
   * Check if entity has an attribute
   */
  hasAttribute(name: string): boolean {
    return this.attributes.has(name);
  }

  /**
   * Get a resource by name
   */
  getResource(name: string): Resource | undefined {
    return this.resources.get(name);
  }

  /**
   * Get resource current value
   */
  getResourceCurrent(name: string): number {
    const resource = this.resources.get(name);
    if (!resource) {
      throw new Error(`Resource "${name}" not found on entity "${this.id}"`);
    }
    return resource.getCurrent();
  }

  /**
   * Get resource max value (with modifiers)
   */
  getResourceMax(name: string, context: any = {}): number {
    const resource = this.resources.get(name);
    if (!resource) {
      throw new Error(`Resource "${name}" not found on entity "${this.id}"`);
    }
    return resource.getMax(context);
  }

  /**
   * Get all resource names
   */
  getResourceNames(): string[] {
    return Array.from(this.resources.keys());
  }

  /**
   * Check if entity has a resource
   */
  hasResource(name: string): boolean {
    return this.resources.has(name);
  }

  /**
   * Check if entity has a tag
   */
  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  /**
   * Add a tag
   */
  addTag(tag: string): void {
    this.tags.add(tag);
  }

  /**
   * Remove a tag
   */
  removeTag(tag: string): boolean {
    return this.tags.delete(tag);
  }

  /**
   * Get all tags
   */
  getTags(): string[] {
    return Array.from(this.tags);
  }

  /**
   * Add a modifier to an attribute
   */
  addModifierToAttribute(attributeName: string, modifier: Modifier): void {
    const attr = this.attributes.get(attributeName);
    if (!attr) {
      throw new Error(`Attribute "${attributeName}" not found on entity "${this.id}"`);
    }
    attr.addModifier(modifier);
  }

  /**
   * Add a modifier to a resource max
   */
  addModifierToResourceMax(resourceName: string, modifier: Modifier): void {
    const resource = this.resources.get(resourceName);
    if (!resource) {
      throw new Error(`Resource "${resourceName}" not found on entity "${this.id}"`);
    }
    resource.getMaxAttribute().addModifier(modifier);
  }

  /**
   * Remove modifiers from a source across all attributes and resources
   */
  removeModifiersFromSource(sourceId: string): number {
    let totalRemoved = 0;

    // Remove from attributes
    for (const attr of this.attributes.values()) {
      totalRemoved += attr.removeModifiersFromSource(sourceId);
    }

    // Remove from resource max values
    for (const resource of this.resources.values()) {
      totalRemoved += resource.getMaxAttribute().removeModifiersFromSource(sourceId);
    }

    return totalRemoved;
  }

  /**
   * Check if entity has a passive
   */
  hasPassive(passiveId: string): boolean {
    return this.passives.has(passiveId);
  }

  /**
   * Add a passive
   */
  addPassive(passiveId: string): void {
    this.passives.add(passiveId);
  }

  /**
   * Remove a passive
   */
  removePassive(passiveId: string): boolean {
    const removed = this.passives.delete(passiveId);
    if (removed) {
      this.removeModifiersFromSource(passiveId);
    }
    return removed;
  }

  /**
   * Get all passives
   */
  getPassives(): string[] {
    return Array.from(this.passives);
  }

  /**
   * Check if entity has equipment
   */
  hasEquipment(equipmentId: string): boolean {
    return this.equipment.has(equipmentId);
  }

  /**
   * Add equipment
   */
  addEquipment(equipmentId: string): void {
    this.equipment.add(equipmentId);
  }

  /**
   * Remove equipment
   */
  removeEquipment(equipmentId: string): boolean {
    const removed = this.equipment.delete(equipmentId);
    if (removed) {
      this.removeModifiersFromSource(equipmentId);
    }
    return removed;
  }

  /**
   * Get all equipment
   */
  getEquipment(): string[] {
    return Array.from(this.equipment);
  }

  /**
   * Check if entity has a status effect
   */
  hasStatusEffect(statusId: string): boolean {
    return this.statusEffects.has(statusId);
  }

  /**
   * Add a status effect
   */
  addStatusEffect(statusId: string): void {
    this.statusEffects.add(statusId);
  }

  /**
   * Remove a status effect
   */
  removeStatusEffect(statusId: string): boolean {
    const removed = this.statusEffects.delete(statusId);
    if (removed) {
      this.removeModifiersFromSource(statusId);
    }
    return removed;
  }

  /**
   * Get all status effects
   */
  getStatusEffects(): string[] {
    return Array.from(this.statusEffects);
  }

  /**
   * Check if entity has an action
   */
  hasAction(actionId: string): boolean {
    return this.actions.has(actionId);
  }

  /**
   * Add an action
   */
  addAction(actionId: string): void {
    this.actions.add(actionId);
  }

  /**
   * Remove an action
   */
  removeAction(actionId: string): boolean {
    return this.actions.delete(actionId);
  }

  /**
   * Get all actions
   */
  getActions(): string[] {
    return Array.from(this.actions);
  }

  /**
   * Serialize to JSON
   */
  toJSON(): EntityData {
    const attributes: Record<string, any> = {};
    for (const [name, attr] of this.attributes) {
      attributes[name] = attr.toJSON();
    }

    const resources: Record<string, any> = {};
    for (const [name, resource] of this.resources) {
      resources[name] = resource.toJSON();
    }

    return {
      id: this.templateId,
      name: this.name,
      tags: Array.from(this.tags),
      attributes,
      resources,
      passives: Array.from(this.passives),
      equipment: Array.from(this.equipment),
      actions: Array.from(this.actions),
    };
  }

  /**
   * Create from JSON data
   */
  static fromJSON(data: EntityData, eventBus?: EventBus, instanceId?: string): Entity {
    return new Entity(data, eventBus, instanceId);
  }

  /**
   * Clone this entity (creates new instance with same template)
   */
  clone(eventBus?: EventBus, newInstanceId?: string): Entity {
    const data = this.toJSON();
    return new Entity(data, eventBus, newInstanceId || `${this.id}_clone`);
  }
}
