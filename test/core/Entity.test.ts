import { expect } from 'chai';
import { Entity } from '../../src/core/Entity.js';
import { Modifier } from '../../src/modifiers/Modifier.js';
import { EventBus } from '../../src/events/EventBus.js';

describe('Entity', () => {
  const createKnight = () => ({
    id: 'knight',
    name: 'Knight',
    tags: ['warrior', 'armored'],
    attributes: {
      attack: { base: 15 },
      defense: { base: 12 },
      speed: { base: 8 },
    },
    resources: {
      health: { base: 100, current: 100 },
      stamina: { base: 50, current: 50 },
    },
    passives: ['heavy_armor_training'],
    equipment: ['iron_sword', 'iron_shield'],
    actions: ['slash', 'defend'],
  });

  describe('constructor', () => {
    it('should create entity from data', () => {
      const entity = new Entity(createKnight());
      
      expect(entity.id).to.equal('knight');
      expect(entity.templateId).to.equal('knight');
      expect(entity.name).to.equal('Knight');
    });

    it('should use instanceId if provided', () => {
      const entity = new Entity(createKnight(), undefined, 'knight_1');
      
      expect(entity.id).to.equal('knight_1');
      expect(entity.templateId).to.equal('knight');
    });

    it('should initialize attributes', () => {
      const entity = new Entity(createKnight());
      
      expect(entity.hasAttribute('attack')).to.be.true;
      expect(entity.hasAttribute('defense')).to.be.true;
      expect(entity.getAttributeValue('attack')).to.equal(15);
    });

    it('should initialize resources', () => {
      const entity = new Entity(createKnight());
      
      expect(entity.hasResource('health')).to.be.true;
      expect(entity.getResourceCurrent('health')).to.equal(100);
      expect(entity.getResourceMax('health')).to.equal(100);
    });

    it('should initialize tags', () => {
      const entity = new Entity(createKnight());
      
      expect(entity.hasTag('warrior')).to.be.true;
      expect(entity.hasTag('armored')).to.be.true;
    });

    it('should initialize passives, equipment, actions', () => {
      const entity = new Entity(createKnight());
      
      expect(entity.hasPassive('heavy_armor_training')).to.be.true;
      expect(entity.hasEquipment('iron_sword')).to.be.true;
      expect(entity.hasAction('slash')).to.be.true;
    });
  });

  describe('attributes', () => {
    it('should get attribute', () => {
      const entity = new Entity(createKnight());
      const attack = entity.getAttribute('attack');
      
      expect(attack).to.exist;
      expect(attack!.getBase()).to.equal(15);
    });

    it('should get attribute value', () => {
      const entity = new Entity(createKnight());
      expect(entity.getAttributeValue('attack')).to.equal(15);
    });

    it('should throw if attribute not found', () => {
      const entity = new Entity(createKnight());
      expect(() => entity.getAttributeValue('nonexistent')).to.throw(/not found/);
    });

    it('should get attribute names', () => {
      const entity = new Entity(createKnight());
      const names = entity.getAttributeNames();
      
      expect(names).to.include('attack');
      expect(names).to.include('defense');
      expect(names).to.include('speed');
    });

    it('should add modifier to attribute', () => {
      const entity = new Entity(createKnight());
      
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'status', id: 'strength', createdAt: 0 },
      });

      entity.addModifierToAttribute('attack', modifier);
      expect(entity.getAttributeValue('attack')).to.equal(25);
    });
  });

  describe('resources', () => {
    it('should get resource', () => {
      const entity = new Entity(createKnight());
      const health = entity.getResource('health');
      
      expect(health).to.exist;
      expect(health!.getCurrent()).to.equal(100);
    });

    it('should get resource current', () => {
      const entity = new Entity(createKnight());
      expect(entity.getResourceCurrent('health')).to.equal(100);
    });

    it('should get resource max', () => {
      const entity = new Entity(createKnight());
      expect(entity.getResourceMax('health')).to.equal(100);
    });

    it('should throw if resource not found', () => {
      const entity = new Entity(createKnight());
      expect(() => entity.getResourceCurrent('nonexistent')).to.throw(/not found/);
    });

    it('should get resource names', () => {
      const entity = new Entity(createKnight());
      const names = entity.getResourceNames();
      
      expect(names).to.include('health');
      expect(names).to.include('stamina');
    });

    it('should add modifier to resource max', () => {
      const entity = new Entity(createKnight());
      
      const modifier = new Modifier({
        target: 'health_max',
        type: 'add',
        value: 50,
        priority: 0,
        source: { type: 'passive', id: 'constitution', createdAt: 0 },
      });

      entity.addModifierToResourceMax('health', modifier);
      expect(entity.getResourceMax('health')).to.equal(150);
    });

    it('should integrate with EventBus', () => {
      const eventBus = new EventBus();
      const entity = new Entity(createKnight(), eventBus);
      
      let eventEmitted = false;
      eventBus.on('resource:changed', () => {
        eventEmitted = true;
      });

      entity.getResource('health')!.setCurrent(50);
      expect(eventEmitted).to.be.true;
    });
  });

  describe('tags', () => {
    it('should check for tag', () => {
      const entity = new Entity(createKnight());
      expect(entity.hasTag('warrior')).to.be.true;
      expect(entity.hasTag('mage')).to.be.false;
    });

    it('should add tag', () => {
      const entity = new Entity(createKnight());
      entity.addTag('elite');
      expect(entity.hasTag('elite')).to.be.true;
    });

    it('should remove tag', () => {
      const entity = new Entity(createKnight());
      const removed = entity.removeTag('warrior');
      
      expect(removed).to.be.true;
      expect(entity.hasTag('warrior')).to.be.false;
    });

    it('should get all tags', () => {
      const entity = new Entity(createKnight());
      const tags = entity.getTags();
      
      expect(tags).to.include('warrior');
      expect(tags).to.include('armored');
    });
  });

  describe('passives', () => {
    it('should check for passive', () => {
      const entity = new Entity(createKnight());
      expect(entity.hasPassive('heavy_armor_training')).to.be.true;
    });

    it('should add passive', () => {
      const entity = new Entity(createKnight());
      entity.addPassive('berserker');
      expect(entity.hasPassive('berserker')).to.be.true;
    });

    it('should remove passive', () => {
      const entity = new Entity(createKnight());
      const removed = entity.removePassive('heavy_armor_training');
      
      expect(removed).to.be.true;
      expect(entity.hasPassive('heavy_armor_training')).to.be.false;
    });

    it('should remove modifiers when removing passive', () => {
      const entity = new Entity(createKnight());
      
      const modifier = new Modifier({
        target: 'defense',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'heavy_armor_training', createdAt: 0 },
      });

      entity.addModifierToAttribute('defense', modifier);
      expect(entity.getAttributeValue('defense')).to.equal(22);

      entity.removePassive('heavy_armor_training');
      expect(entity.getAttributeValue('defense')).to.equal(12);
    });

    it('should get all passives', () => {
      const entity = new Entity(createKnight());
      const passives = entity.getPassives();
      expect(passives).to.include('heavy_armor_training');
    });
  });

  describe('equipment', () => {
    it('should check for equipment', () => {
      const entity = new Entity(createKnight());
      expect(entity.hasEquipment('iron_sword')).to.be.true;
    });

    it('should add equipment', () => {
      const entity = new Entity(createKnight());
      entity.addEquipment('steel_sword');
      expect(entity.hasEquipment('steel_sword')).to.be.true;
    });

    it('should remove equipment', () => {
      const entity = new Entity(createKnight());
      const removed = entity.removeEquipment('iron_sword');
      
      expect(removed).to.be.true;
      expect(entity.hasEquipment('iron_sword')).to.be.false;
    });

    it('should remove modifiers when removing equipment', () => {
      const entity = new Entity(createKnight());
      
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'equipment', id: 'iron_sword', createdAt: 0 },
      });

      entity.addModifierToAttribute('attack', modifier);
      expect(entity.getAttributeValue('attack')).to.equal(20);

      entity.removeEquipment('iron_sword');
      expect(entity.getAttributeValue('attack')).to.equal(15);
    });

    it('should get all equipment', () => {
      const entity = new Entity(createKnight());
      const equipment = entity.getEquipment();
      expect(equipment).to.include('iron_sword');
      expect(equipment).to.include('iron_shield');
    });
  });

  describe('status effects', () => {
    it('should check for status effect', () => {
      const entity = new Entity(createKnight());
      expect(entity.hasStatusEffect('poison')).to.be.false;
    });

    it('should add status effect', () => {
      const entity = new Entity(createKnight());
      entity.addStatusEffect('poison');
      expect(entity.hasStatusEffect('poison')).to.be.true;
    });

    it('should remove status effect', () => {
      const entity = new Entity(createKnight());
      entity.addStatusEffect('poison');
      
      const removed = entity.removeStatusEffect('poison');
      expect(removed).to.be.true;
      expect(entity.hasStatusEffect('poison')).to.be.false;
    });

    it('should remove modifiers when removing status effect', () => {
      const entity = new Entity(createKnight());
      
      const modifier = new Modifier({
        target: 'speed',
        type: 'multiply',
        value: 0.5,
        priority: 0,
        source: { type: 'status', id: 'slow', createdAt: 0 },
      });

      entity.addStatusEffect('slow');
      entity.addModifierToAttribute('speed', modifier);
      expect(entity.getAttributeValue('speed')).to.equal(4);

      entity.removeStatusEffect('slow');
      expect(entity.getAttributeValue('speed')).to.equal(8);
    });

    it('should get all status effects', () => {
      const entity = new Entity(createKnight());
      entity.addStatusEffect('poison');
      entity.addStatusEffect('slow');
      
      const statuses = entity.getStatusEffects();
      expect(statuses).to.include('poison');
      expect(statuses).to.include('slow');
    });
  });

  describe('actions', () => {
    it('should check for action', () => {
      const entity = new Entity(createKnight());
      expect(entity.hasAction('slash')).to.be.true;
    });

    it('should add action', () => {
      const entity = new Entity(createKnight());
      entity.addAction('charge');
      expect(entity.hasAction('charge')).to.be.true;
    });

    it('should remove action', () => {
      const entity = new Entity(createKnight());
      const removed = entity.removeAction('slash');
      
      expect(removed).to.be.true;
      expect(entity.hasAction('slash')).to.be.false;
    });

    it('should get all actions', () => {
      const entity = new Entity(createKnight());
      const actions = entity.getActions();
      expect(actions).to.include('slash');
      expect(actions).to.include('defend');
    });
  });

  describe('removeModifiersFromSource()', () => {
    it('should remove modifiers from all attributes and resources', () => {
      const entity = new Entity(createKnight());
      
      const attackMod = new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'equipment', id: 'iron_sword', createdAt: 0 },
      });

      const defenseMod = new Modifier({
        target: 'defense',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'equipment', id: 'iron_sword', createdAt: 1 },
      });

      const healthMod = new Modifier({
        target: 'health_max',
        type: 'add',
        value: 20,
        priority: 0,
        source: { type: 'equipment', id: 'iron_sword', createdAt: 2 },
      });

      entity.addModifierToAttribute('attack', attackMod);
      entity.addModifierToAttribute('defense', defenseMod);
      entity.addModifierToResourceMax('health', healthMod);

      expect(entity.getAttributeValue('attack')).to.equal(20);
      expect(entity.getAttributeValue('defense')).to.equal(17);
      expect(entity.getResourceMax('health')).to.equal(120);

      const removed = entity.removeModifiersFromSource('iron_sword');
      expect(removed).to.equal(3);

      expect(entity.getAttributeValue('attack')).to.equal(15);
      expect(entity.getAttributeValue('defense')).to.equal(12);
      expect(entity.getResourceMax('health')).to.equal(100);
    });
  });

  describe('toJSON() and fromJSON()', () => {
    it('should serialize to JSON', () => {
      const entity = new Entity(createKnight());
      const json = entity.toJSON();
      
      expect(json.id).to.equal('knight');
      expect(json.name).to.equal('Knight');
      expect(json.tags).to.include('warrior');
      expect(json.attributes.attack).to.exist;
      expect(json.resources.health).to.exist;
    });

    it('should deserialize from JSON', () => {
      const data = createKnight();
      const entity = Entity.fromJSON(data);
      
      expect(entity.id).to.equal('knight');
      expect(entity.name).to.equal('Knight');
      expect(entity.getAttributeValue('attack')).to.equal(15);
      expect(entity.getResourceCurrent('health')).to.equal(100);
    });

    it('should round-trip through JSON', () => {
      const original = new Entity(createKnight());
      original.getResource('health')!.setCurrent(50);
      
      const json = original.toJSON();
      const restored = Entity.fromJSON(json);
      
      expect(restored.getResourceCurrent('health')).to.equal(50);
    });
  });

  describe('clone()', () => {
    it('should clone entity', () => {
      const original = new Entity(createKnight());
      const cloned = original.clone();
      
      expect(cloned.id).to.equal('knight_clone');
      expect(cloned.templateId).to.equal('knight');
      expect(cloned.name).to.equal('Knight');
    });

    it('should be independent from original', () => {
      const original = new Entity(createKnight());
      const cloned = original.clone();
      
      cloned.getResource('health')!.setCurrent(50);
      expect(original.getResourceCurrent('health')).to.equal(100);
    });

    it('should use provided instance ID', () => {
      const original = new Entity(createKnight());
      const cloned = original.clone(undefined, 'knight_2');
      
      expect(cloned.id).to.equal('knight_2');
    });
  });

  describe('real-world scenarios', () => {
    it('should handle knight with full equipment and buffs', () => {
      const entity = new Entity(createKnight());
      
      // Iron sword: +5 attack
      entity.addModifierToAttribute('attack', new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'equipment', id: 'iron_sword', createdAt: 0 },
      }));

      // Iron shield: +3 defense
      entity.addModifierToAttribute('defense', new Modifier({
        target: 'defense',
        type: 'add',
        value: 3,
        priority: 0,
        source: { type: 'equipment', id: 'iron_shield', createdAt: 1 },
      }));

      // Strength buff: +20% attack
      entity.addModifierToAttribute('attack', new Modifier({
        target: 'attack',
        type: 'multiply',
        value: 1.2,
        priority: 0,
        source: { type: 'status', id: 'strength', createdAt: 2 },
      }));

      // Constitution: +50 max health
      entity.addModifierToResourceMax('health', new Modifier({
        target: 'health_max',
        type: 'add',
        value: 50,
        priority: 0,
        source: { type: 'passive', id: 'constitution', createdAt: 3 },
      }));

      expect(entity.getAttributeValue('attack')).to.equal(24); // (15 + 5) * 1.2
      expect(entity.getAttributeValue('defense')).to.equal(15); // 12 + 3
      expect(entity.getResourceMax('health')).to.equal(150); // 100 + 50
    });

    it('should handle taking damage and death', () => {
      const eventBus = new EventBus();
      const entity = new Entity(createKnight(), eventBus);
      
      let depleted = false;
      eventBus.on('resource:depleted', (event) => {
        if (event.data.resource === 'health') {
          depleted = true;
        }
      });

      const health = entity.getResource('health')!;
      
      health.subtract(50);
      expect(health.getCurrent()).to.equal(50);
      expect(depleted).to.be.false;

      health.subtract(60);
      expect(health.getCurrent()).to.equal(0);
      expect(depleted).to.be.true;
    });

    it('should handle equipment swap', () => {
      const entity = new Entity(createKnight());
      
      // Add iron sword modifier
      entity.addModifierToAttribute('attack', new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'equipment', id: 'iron_sword', createdAt: 0 },
      }));

      expect(entity.getAttributeValue('attack')).to.equal(20);

      // Remove iron sword
      entity.removeEquipment('iron_sword');
      expect(entity.getAttributeValue('attack')).to.equal(15);

      // Add steel sword
      entity.addEquipment('steel_sword');
      entity.addModifierToAttribute('attack', new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'equipment', id: 'steel_sword', createdAt: 1 },
      }));

      expect(entity.getAttributeValue('attack')).to.equal(25);
    });
  });
});
