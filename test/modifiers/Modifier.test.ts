import { expect } from 'chai';
import { Modifier } from '../../src/modifiers/Modifier.js';
import { Modifier as ModifierData } from '../../src/types/index.js';

describe('Modifier', () => {
  describe('constructor', () => {
    it('should create modifier with static value', () => {
      const data: ModifierData = {
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      };

      const modifier = new Modifier(data);
      expect(modifier.target).to.equal('attack');
      expect(modifier.type).to.equal('add');
      expect(modifier.value).to.equal(10);
      expect(modifier.priority).to.equal(0);
    });

    it('should create modifier with formula value', () => {
      const data: ModifierData = {
        target: 'attack',
        type: 'multiply',
        value: 'self.level * 0.1',
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      };

      const modifier = new Modifier(data);
      expect(modifier.value).to.not.be.a('number');
    });

    it('should create modifier with condition', () => {
      const data: ModifierData = {
        target: 'attack',
        type: 'add',
        value: 20,
        condition: 'self.health < 50',
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      };

      const modifier = new Modifier(data);
      expect(modifier.condition).to.exist;
    });
  });

  describe('evaluateValue()', () => {
    it('should return static value', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 15,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      expect(modifier.evaluateValue({})).to.equal(15);
    });

    it('should evaluate formula value', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'multiply',
        value: 'level * 0.05',
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      const result = modifier.evaluateValue({ level: 10 });
      expect(result).to.equal(0.5);
    });

    it('should use context for formula evaluation', () => {
      const modifier = new Modifier({
        target: 'damage',
        type: 'add',
        value: 'attacker.attack + target.defense',
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      const result = modifier.evaluateValue({
        attacker: { attack: 20 },
        target: { defense: 10 },
      });
      expect(result).to.equal(30);
    });
  });

  describe('shouldApply()', () => {
    it('should return true when no condition', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      expect(modifier.shouldApply({})).to.be.true;
    });

    it('should evaluate condition', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 20,
        condition: 'health < 50',
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      expect(modifier.shouldApply({ health: 30 })).to.be.true;
      expect(modifier.shouldApply({ health: 60 })).to.be.false;
    });

    it('should treat non-zero as true', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        condition: 'value',
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      expect(modifier.shouldApply({ value: 1 })).to.be.true;
      expect(modifier.shouldApply({ value: 5 })).to.be.true;
      expect(modifier.shouldApply({ value: 0 })).to.be.false;
    });

    it('should support complex conditions', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'multiply',
        value: '1.5',
        condition: 'self.resources.health.current < self.resources.health.max * 0.3',
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      expect(
        modifier.shouldApply({
          self: {
            resources: { health: { current: 25, max: 100 } },
          },
        })
      ).to.be.true;

      expect(
        modifier.shouldApply({
          self: {
            resources: { health: { current: 50, max: 100 } },
          },
        })
      ).to.be.false;
    });
  });

  describe('toJSON() and fromJSON()', () => {
    it('should serialize and deserialize', () => {
      const original = new Modifier({
        target: 'attack',
        type: 'add',
        value: 10,
        priority: 5,
        source: { type: 'passive', id: 'test', createdAt: 123 },
      });

      const json = original.toJSON();
      const restored = Modifier.fromJSON(json);

      expect(restored.target).to.equal(original.target);
      expect(restored.type).to.equal(original.type);
      expect(restored.priority).to.equal(original.priority);
      expect(restored.source).to.deep.equal(original.source);
    });

    it('should serialize formula values as strings', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 'level * 2',
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      const json = modifier.toJSON();
      expect(json.value).to.equal('level * 2');
    });

    it('should preserve conditions', () => {
      const modifier = new Modifier({
        target: 'attack',
        type: 'add',
        value: 20,
        condition: 'health < 50',
        priority: 0,
        source: { type: 'passive', id: 'test', createdAt: 0 },
      });

      const json = modifier.toJSON();
      const restored = Modifier.fromJSON(json);

      expect(restored.shouldApply({ health: 30 })).to.be.true;
      expect(restored.shouldApply({ health: 60 })).to.be.false;
    });
  });
});
