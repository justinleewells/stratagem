import { expect } from 'chai';
import { Modifier } from '../../src/modifiers/Modifier.js';
import { ModifierStack } from '../../src/modifiers/ModifierStack.js';

describe('ModifierStack', () => {
  let stack: ModifierStack;

  beforeEach(() => {
    stack = new ModifierStack();
  });

  describe('addModifier() and calculate()', () => {
    it('should apply single add modifier', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      stack.addModifier(modifier);
      expect(stack.calculate(20)).to.equal(30);
    });

    it('should apply single multiply modifier', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'multiply',
        value: 1.5,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      stack.addModifier(modifier);
      expect(stack.calculate(20)).to.equal(30);
    });

    it('should apply set modifier', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'set',
        value: 50,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      stack.addModifier(modifier);
      expect(stack.calculate(20)).to.equal(50);
    });

    it('should apply min modifier', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'min',
        value: 30,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      stack.addModifier(modifier);
      expect(stack.calculate(20)).to.equal(30); // Raised to minimum
      expect(stack.calculate(40)).to.equal(40); // Already above minimum
    });

    it('should apply max modifier', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'max',
        value: 30,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      stack.addModifier(modifier);
      expect(stack.calculate(20)).to.equal(20); // Below maximum
      expect(stack.calculate(40)).to.equal(30); // Capped at maximum
    });
  });

  describe('modifier ordering', () => {
    it('should apply set before add', () => {
      const set = new Modifier({
        target: 'attack',
        type: 'set',
        value: 50,
        priority: 0,
        source: { type: 'passive', id: 'set', createdAt: 0 },
      });

      const add = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'add', createdAt: 1 },
      });

      stack.addModifier(add);
      stack.addModifier(set);

      expect(stack.calculate(100)).to.equal(60); // set to 50, then add 10
    });

    it('should apply add before multiply', () => {
      const add = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'add', createdAt: 0 },
      });

      const multiply = new Modifier({
        target: 'attack',
        type: 'multiply',
        value: 2,
        priority: 0,
        source: { type: 'passive', id: 'multiply', createdAt: 1 },
      });

      stack.addModifier(multiply);
      stack.addModifier(add);

      expect(stack.calculate(10)).to.equal(40); // (10 + 10) * 2
    });

    it('should apply multiply before min/max', () => {
      const multiply = new Modifier({
        target: 'attack',
        type: 'multiply',
        value: 2,
        priority: 0,
        source: { type: 'passive', id: 'multiply', createdAt: 0 },
      });

      const max = new Modifier({
        target: 'attack',
        type: 'max',
        value: 30,
        priority: 0,
        source: { type: 'passive', id: 'max', createdAt: 1 },
      });

      stack.addModifier(max);
      stack.addModifier(multiply);

      expect(stack.calculate(20)).to.equal(30); // 20 * 2 = 40, capped at 30
    });

    it('should respect priority order', () => {
      const low = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'low', createdAt: 0 },
      });

      const high = new Modifier({
        target: 'attack',
        type: 'multiply',
        value: 2,
        priority: 10,
        source: { type: 'passive', id: 'high', createdAt: 1 },
      });

      stack.addModifier(low);
      stack.addModifier(high);

      // Type order takes precedence: add before multiply
      // (10 + 10) * 2 = 40
      expect(stack.calculate(10)).to.equal(40);
    });

    it('should respect source type order', () => {
      const status = new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'status', id: 'status', createdAt: 0 },
      });

      const passive = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'passive', createdAt: 1 },
      });

      stack.addModifier(status);
      stack.addModifier(passive);

      // Both are adds, so order matters for determinism
      // Passive applied before status (source type order)
      expect(stack.calculate(10)).to.equal(25); // 10 + 10 + 5
    });

    it('should respect creation order', () => {
      const first = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'first', createdAt: 0 },
      });

      const second = new Modifier({
        target: 'attack',
        type: 'add',
        value: 20,
        priority: 0,
        source: { type: 'passive', id: 'second', createdAt: 1 },
      });

      stack.addModifier(second);
      stack.addModifier(first);

      // Same priority, same source type, so creation order determines
      expect(stack.calculate(10)).to.equal(40); // 10 + 10 + 20
    });
  });

  describe('conditional modifiers', () => {
    it('should only apply when condition is true', () => {
      const conditional = new Modifier({
        target: 'attack',
        type: 'add',
        value: 20,
        condition: 'health < 50',
        priority: 0,
        source: { type: 'passive', id: 'conditional', createdAt: 0 },
      });

      stack.addModifier(conditional);

      expect(stack.calculate(10, { health: 30 })).to.equal(30); // Applied
      expect(stack.calculate(10, { health: 60 })).to.equal(10); // Not applied
    });

    it('should handle multiple conditional modifiers', () => {
      const lowHealth = new Modifier({
        target: 'attack',
        type: 'multiply',
        value: 1.5,
        condition: 'health < 30',
        priority: 0,
        source: { type: 'passive', id: 'low', createdAt: 0 },
      });

      const medHealth = new Modifier({
        target: 'attack',
        type: 'multiply',
        value: 1.2,
        condition: 'health >= 30 && health < 70',
        priority: 0,
        source: { type: 'passive', id: 'med', createdAt: 1 },
      });

      stack.addModifier(lowHealth);
      stack.addModifier(medHealth);

      expect(stack.calculate(10, { health: 20 })).to.equal(15); // Low applies
      expect(stack.calculate(10, { health: 50 })).to.equal(12); // Med applies
      expect(stack.calculate(10, { health: 80 })).to.equal(10); // Neither applies
    });
  });

  describe('complex scenarios', () => {
    it('should handle full modifier pipeline', () => {
      // Example: Knight with multiple modifiers
      // Base attack: 10
      // +5 from sword (add)
      // +10% from strength buff (multiply)
      // +20 when below 30% health (conditional add)
      // Max 50 (max)

      const sword = new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'equipment', id: 'sword', createdAt: 0 },
      });

      const strength = new Modifier({
        target: 'attack',
        type: 'multiply',
        value: 1.1,
        priority: 0,
        source: { type: 'status', id: 'strength', createdAt: 1 },
      });

      const enrage = new Modifier({
        target: 'attack',
        type: 'add',
        value: 20,
        condition: 'health < 30',
        priority: 0,
        source: { type: 'passive', id: 'enrage', createdAt: 2 },
      });

      const cap = new Modifier({
        target: 'attack',
        type: 'max',
        value: 50,
        priority: 0,
        source: { type: 'passive', id: 'cap', createdAt: 3 },
      });

      stack.addModifier(sword);
      stack.addModifier(strength);
      stack.addModifier(enrage);
      stack.addModifier(cap);

      // High health: (10 + 5) * 1.1 = 16.5
      expect(stack.calculate(10, { health: 100 })).to.equal(16.5);

      // Low health: (10 + 5 + 20) * 1.1 = 38.5
      expect(stack.calculate(10, { health: 20 })).to.equal(38.5);
    });

    it('should handle damage calculation example', () => {
      // Example: Damage with armor penetration
      // Base damage: 50
      // +20% critical (multiply)
      // -15 from armor (add negative)
      // Armor pen reduces armor by 50% (conditional)
      // Min 1 (can't go negative)

      const critical = new Modifier({
        target: 'damage',
        type: 'multiply',
        value: 1.2,
        priority: 0,
        source: { type: 'temporary', id: 'crit', createdAt: 0 },
      });

      const armor = new Modifier({
        target: 'damage',
        type: 'add',
        value: -15,
        condition: 'armorPen < 1',
        priority: 0,
        source: { type: 'temporary', id: 'armor', createdAt: 1 },
      });

      const armorPenalty = new Modifier({
        target: 'damage',
        type: 'add',
        value: -7.5,
        condition: 'armorPen >= 1',
        priority: 0,
        source: { type: 'temporary', id: 'armor_reduced', createdAt: 2 },
      });

      const minDamage = new Modifier({
        target: 'damage',
        type: 'min',
        value: 1,
        priority: 0,
        source: { type: 'passive', id: 'min', createdAt: 3 },
      });

      stack.addModifier(critical);
      stack.addModifier(armor);
      stack.addModifier(armorPenalty);
      stack.addModifier(minDamage);

      // No armor pen: (50 - 15) * 1.2 = 42
      expect(stack.calculate(50, { armorPen: 0 })).to.equal(42);

      // With armor pen: (50 - 7.5) * 1.2 = 51
      expect(stack.calculate(50, { armorPen: 1 })).to.equal(51);
    });
  });

  describe('removeModifier()', () => {
    it('should remove specific modifier', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      stack.addModifier(modifier);
      expect(stack.calculate(10)).to.equal(20);

      stack.removeModifier(modifier);
      expect(stack.calculate(10)).to.equal(10);
    });

    it('should return true if modifier was removed', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      stack.addModifier(modifier);
      expect(stack.removeModifier(modifier)).to.be.true;
    });

    it('should return false if modifier not found', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      expect(stack.removeModifier(modifier)).to.be.false;
    });
  });

  describe('removeModifiersFromSource()', () => {
    it('should remove all modifiers from source', () => {
      const mod1 = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'source1', createdAt: 0 },
      });

      const mod2 = new Modifier({
        target: 'attack',
        type: 'add',
        value: 5,
        priority: 0,
        source: { type: 'passive', id: 'source1', createdAt: 1 },
      });

      const mod3 = new Modifier({
        target: 'attack',
        type: 'add',
        value: 20,
        priority: 0,
        source: { type: 'passive', id: 'source2', createdAt: 2 },
      });

      stack.addModifier(mod1);
      stack.addModifier(mod2);
      stack.addModifier(mod3);

      expect(stack.calculate(10)).to.equal(45); // 10 + 10 + 5 + 20

      const removed = stack.removeModifiersFromSource('source1');
      expect(removed).to.equal(2);
      expect(stack.calculate(10)).to.equal(30); // 10 + 20
    });
  });

  describe('clear()', () => {
    it('should remove all modifiers', () => {
      stack.addModifier(
        new Modifier({
          target: 'attack',
          type: 'add',
          value: 10,
          priority: 0,
          source: { type: 'passive', id: 'test1', createdAt: 0 },
        })
      );

      stack.addModifier(
        new Modifier({
          target: 'attack',
          type: 'multiply',
          value: 2,
          priority: 0,
          source: { type: 'passive', id: 'test2', createdAt: 1 },
        })
      );

      expect(stack.calculate(10)).to.not.equal(10);

      stack.clear();
      expect(stack.calculate(10)).to.equal(10);
      expect(stack.count()).to.equal(0);
    });
  });

  describe('caching', () => {
    it('should cache calculated value', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      stack.addModifier(modifier);

      const first = stack.calculate(10);
      const second = stack.calculate(10);

      expect(first).to.equal(second);
      expect(first).to.equal(20);
    });

    it('should invalidate cache on add', () => {
      stack.addModifier(
        new Modifier({
          target: 'attack',
          type: 'add',
          value: 10,
          priority: 0,
          source: { type: 'passive', id: 'test1', createdAt: 0 },
        })
      );

      expect(stack.calculate(10)).to.equal(20);

      stack.addModifier(
        new Modifier({
          target: 'attack',
          type: 'add',
          value: 5,
          priority: 0,
          source: { type: 'passive', id: 'test2', createdAt: 1 },
        })
      );

      expect(stack.calculate(10)).to.equal(25);
    });

    it('should invalidate cache on remove', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      stack.addModifier(modifier);
      expect(stack.calculate(10)).to.equal(20);

      stack.removeModifier(modifier);
      expect(stack.calculate(10)).to.equal(10);
    });
  });

  describe('getModifiers()', () => {
    it('should return copy of modifiers', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      stack.addModifier(modifier);

      const modifiers = stack.getModifiers();
      expect(modifiers).to.have.lengthOf(1);
      expect(modifiers[0]).to.equal(modifier);

      // Modifying returned array shouldn't affect stack
      modifiers.push(
        new Modifier({
          target: 'attack',
          type: 'add',
          value: 5,
          priority: 0,
          source: { type: 'passive', id: 'test2', createdAt: 1 },
        })
      );

      expect(stack.count()).to.equal(1);
    });
  });
});
