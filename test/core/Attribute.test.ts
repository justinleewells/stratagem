import { expect } from 'chai';
import { Attribute } from '../../src/core/Attribute.js';
import { Modifier } from '../../src/modifiers/Modifier.js';

describe('Attribute', () => {
  describe('constructor', () => {
    it('should create attribute with base value', () => {
      const attr = new Attribute('attack', { base: 10 });
      expect(attr.name).to.equal('attack');
      expect(attr.getBase()).to.equal(10);
    });

    it('should initialize with no modifiers', () => {
      const attr = new Attribute('defense', { base: 15 });
      expect(attr.getModifierCount()).to.equal(0);
      expect(attr.getValue()).to.equal(15);
    });
  });

  describe('getBase() and setBase()', () => {
    it('should get base value', () => {
      const attr = new Attribute('attack', { base: 20 });
      expect(attr.getBase()).to.equal(20);
    });

    it('should set base value', () => {
      const attr = new Attribute('attack', { base: 20 });
      attr.setBase(30);
      expect(attr.getBase()).to.equal(30);
    });

    it('should recalculate value after base change', () => {
      const attr = new Attribute('attack', { base: 10 });
      
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });
      attr.addModifier(modifier);

      expect(attr.getValue()).to.equal(15);

      attr.setBase(20);
      expect(attr.getValue()).to.equal(25);
    });
  });

  describe('getValue()', () => {
    it('should return base value with no modifiers', () => {
      const attr = new Attribute('attack', { base: 10 });
      expect(attr.getValue()).to.equal(10);
    });

    it('should return modified value', () => {
      const attr = new Attribute('attack', { base: 10 });
      
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });
      attr.addModifier(modifier);

      expect(attr.getValue()).to.equal(15);
    });

    it('should pass context to modifiers', () => {
      const attr = new Attribute('attack', { base: 10 });
      
      const conditional = new Modifier({
        target: 'attack',
        type: 'add',
        value: 20,
        condition: 'health < 50',
        priority: 0,
        source: { type: 'passive', id: 'enrage', createdAt: 0 },
      });
      attr.addModifier(conditional);

      expect(attr.getValue({ health: 30 })).to.equal(30);
      expect(attr.getValue({ health: 60 })).to.equal(10);
    });

    it('should handle multiple modifiers', () => {
      const attr = new Attribute('attack', { base: 10 });
      
      const add = new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'equipment', id: 'sword', createdAt: 0 },
      });

      const multiply = new Modifier({
        target: 'attack',
        type: 'multiply',
        value: 1.2,
        priority: 0,
        source: { type: 'status', id: 'strength', createdAt: 1 },
      });

      attr.addModifier(add);
      attr.addModifier(multiply);

      expect(attr.getValue()).to.equal(18); // (10 + 5) * 1.2
    });
  });

  describe('addModifier()', () => {
    it('should add modifier successfully', () => {
      const attr = new Attribute('attack', { base: 10 });
      
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      attr.addModifier(modifier);
      expect(attr.getModifierCount()).to.equal(1);
    });

    it('should throw if modifier targets different attribute', () => {
      const attr = new Attribute('attack', { base: 10 });
      
      const wrongModifier = new Modifier({
        target: 'defense',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      expect(() => attr.addModifier(wrongModifier)).to.throw(/Cannot add modifier targeting "defense"/);
    });
  });

  describe('removeModifier()', () => {
    it('should remove specific modifier', () => {
      const attr = new Attribute('attack', { base: 10 });
      
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      attr.addModifier(modifier);
      expect(attr.getValue()).to.equal(15);

      const removed = attr.removeModifier(modifier);
      expect(removed).to.be.true;
      expect(attr.getValue()).to.equal(10);
    });

    it('should return false if modifier not found', () => {
      const attr = new Attribute('attack', { base: 10 });
      
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      expect(attr.removeModifier(modifier)).to.be.false;
    });
  });

  describe('removeModifiersFromSource()', () => {
    it('should remove all modifiers from source', () => {
      const attr = new Attribute('attack', { base: 10 });
      
      const mod1 = new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'equipment', id: 'sword', createdAt: 0 },
      });

      const mod2 = new Modifier({
        target: 'attack',
        type: 'multiply',
        value: 1.1,
        priority: 0,
        source: { type: 'equipment', id: 'sword', createdAt: 1 },
      });

      const mod3 = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'strength', createdAt: 2 },
      });

      attr.addModifier(mod1);
      attr.addModifier(mod2);
      attr.addModifier(mod3);

      expect(attr.getValue()).to.be.closeTo(27.5, 0.01); // (10 + 5 + 10) * 1.1

      const removed = attr.removeModifiersFromSource('sword');
      expect(removed).to.equal(2);
      expect(attr.getValue()).to.equal(20); // 10 + 10
    });
  });

  describe('getModifiers()', () => {
    it('should return all modifiers', () => {
      const attr = new Attribute('attack', { base: 10 });
      
      const mod1 = new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'passive', id: 'test1', createdAt: 0 },
      });

      const mod2 = new Modifier({
        target: 'attack',
        type: 'multiply',
        value: 1.2,
        priority: 0,
        source: { type: 'passive', id: 'test2', createdAt: 1 },
      });

      attr.addModifier(mod1);
      attr.addModifier(mod2);

      const modifiers = attr.getModifiers();
      expect(modifiers).to.have.lengthOf(2);
      expect(modifiers).to.include(mod1);
      expect(modifiers).to.include(mod2);
    });
  });

  describe('getModifiersFromSource()', () => {
    it('should return modifiers from specific source', () => {
      const attr = new Attribute('attack', { base: 10 });
      
      const sword1 = new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'equipment', id: 'sword', createdAt: 0 },
      });

      const sword2 = new Modifier({
        target: 'attack',
        type: 'multiply',
        value: 1.1,
        priority: 0,
        source: { type: 'equipment', id: 'sword', createdAt: 1 },
      });

      const passive = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'strength', createdAt: 2 },
      });

      attr.addModifier(sword1);
      attr.addModifier(sword2);
      attr.addModifier(passive);

      const swordMods = attr.getModifiersFromSource('sword');
      expect(swordMods).to.have.lengthOf(2);
      expect(swordMods).to.include(sword1);
      expect(swordMods).to.include(sword2);
    });
  });

  describe('clearModifiers()', () => {
    it('should remove all modifiers', () => {
      const attr = new Attribute('attack', { base: 10 });
      
      attr.addModifier(
        new Modifier({
          target: 'attack',
          type: 'add',
          value: 5,
          priority: 0,
          source: { type: 'passive', id: 'test1', createdAt: 0 },
        })
      );

      attr.addModifier(
        new Modifier({
          target: 'attack',
          type: 'multiply',
          value: 2,
          priority: 0,
          source: { type: 'passive', id: 'test2', createdAt: 1 },
        })
      );

      expect(attr.getValue()).to.equal(30);

      attr.clearModifiers();
      expect(attr.getValue()).to.equal(10);
      expect(attr.getModifierCount()).to.equal(0);
    });
  });

  describe('toJSON() and fromJSON()', () => {
    it('should serialize to JSON', () => {
      const attr = new Attribute('attack', { base: 25 });
      const json = attr.toJSON();
      
      expect(json).to.deep.equal({ base: 25 });
    });

    it('should deserialize from JSON', () => {
      const json = { base: 30 };
      const attr = Attribute.fromJSON('defense', json);
      
      expect(attr.name).to.equal('defense');
      expect(attr.getBase()).to.equal(30);
    });

    it('should not include modifiers in JSON', () => {
      const attr = new Attribute('attack', { base: 10 });
      
      attr.addModifier(
        new Modifier({
          target: 'attack',
          type: 'add',
          value: 5,
          priority: 0,
          source: { type: 'passive', id: 'test', createdAt: 0 },
        })
      );

      const json = attr.toJSON();
      expect(json).to.deep.equal({ base: 10 });
    });
  });

  describe('clone()', () => {
    it('should clone with same base', () => {
      const original = new Attribute('attack', { base: 20 });
      const cloned = original.clone();
      
      expect(cloned.name).to.equal('attack');
      expect(cloned.getBase()).to.equal(20);
    });

    it('should not include modifiers in clone', () => {
      const original = new Attribute('attack', { base: 10 });
      
      original.addModifier(
        new Modifier({
          target: 'attack',
          type: 'add',
          value: 5,
          priority: 0,
          source: { type: 'passive', id: 'test', createdAt: 0 },
        })
      );

      const cloned = original.clone();
      expect(cloned.getModifierCount()).to.equal(0);
      expect(cloned.getValue()).to.equal(10);
    });

    it('should be independent of original', () => {
      const original = new Attribute('attack', { base: 10 });
      const cloned = original.clone();
      
      cloned.setBase(20);
      expect(original.getBase()).to.equal(10);
    });
  });

  describe('cloneWithModifiers()', () => {
    it('should clone with modifiers', () => {
      const original = new Attribute('attack', { base: 10 });
      
      original.addModifier(
        new Modifier({
          target: 'attack',
          type: 'add',
          value: 5,
          priority: 0,
          source: { type: 'passive', id: 'test', createdAt: 0 },
        })
      );

      const cloned = original.cloneWithModifiers();
      expect(cloned.getModifierCount()).to.equal(1);
      expect(cloned.getValue()).to.equal(15);
    });

    it('should have independent modifier stacks', () => {
      const original = new Attribute('attack', { base: 10 });
      
      original.addModifier(
        new Modifier({
          target: 'attack',
          type: 'add',
          value: 5,
          priority: 0,
          source: { type: 'passive', id: 'test', createdAt: 0 },
        })
      );

      const cloned = original.cloneWithModifiers();
      
      cloned.addModifier(
        new Modifier({
          target: 'attack',
          type: 'add',
          value: 10,
          priority: 0,
          source: { type: 'passive', id: 'test2', createdAt: 1 },
        })
      );

      expect(original.getModifierCount()).to.equal(1);
      expect(cloned.getModifierCount()).to.equal(2);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle knight with equipment and buffs', () => {
      const attack = new Attribute('attack', { base: 10 });

      // Iron sword: +5 attack
      attack.addModifier(
        new Modifier({
          target: 'attack',
          type: 'add',
          value: 5,
          priority: 0,
          source: { type: 'equipment', id: 'iron_sword', createdAt: 0 },
        })
      );

      // Strength buff: +20% attack
      attack.addModifier(
        new Modifier({
          target: 'attack',
          type: 'multiply',
          value: 1.2,
          priority: 0,
          source: { type: 'status', id: 'strength', createdAt: 1 },
        })
      );

      // Heavy armor training: +10% attack
      attack.addModifier(
        new Modifier({
          target: 'attack',
          type: 'multiply',
          value: 1.1,
          priority: 0,
          source: { type: 'passive', id: 'training', createdAt: 2 },
        })
      );

      // (10 + 5) * 1.2 * 1.1 = 19.8
      expect(attack.getValue()).to.equal(19.8);
    });

    it('should handle conditional berserker rage', () => {
      const attack = new Attribute('attack', { base: 20 });

      // Berserker: +50% attack when below 30% health
      attack.addModifier(
        new Modifier({
          target: 'attack',
          type: 'multiply',
          value: 1.5,
          condition: 'health < maxHealth * 0.3',
          priority: 0,
          source: { type: 'passive', id: 'berserker', createdAt: 0 },
        })
      );

      const highHealth = { health: 80, maxHealth: 100 };
      const lowHealth = { health: 25, maxHealth: 100 };

      expect(attack.getValue(highHealth)).to.equal(20);
      expect(attack.getValue(lowHealth)).to.equal(30);
    });

    it('should handle damage reduction with cap', () => {
      const defense = new Attribute('defense', { base: 10 });

      // Shield: +15 defense
      defense.addModifier(
        new Modifier({
          target: 'defense',
          type: 'add',
          value: 15,
          priority: 0,
          source: { type: 'equipment', id: 'shield', createdAt: 0 },
        })
      );

      // Defense buff: +20% defense
      defense.addModifier(
        new Modifier({
          target: 'defense',
          type: 'multiply',
          value: 1.2,
          priority: 0,
          source: { type: 'status', id: 'fortify', createdAt: 1 },
        })
      );

      // Cap at 40
      defense.addModifier(
        new Modifier({
          target: 'defense',
          type: 'max',
          value: 40,
          priority: 0,
          source: { type: 'passive', id: 'cap', createdAt: 2 },
        })
      );

      // (10 + 15) * 1.2 = 30, capped at 40 (not reached)
      expect(defense.getValue()).to.equal(30);
    });
  });
});
