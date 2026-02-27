import { expect } from 'chai';
import { Resource } from '../../src/core/Resource.js';
import { Modifier } from '../../src/modifiers/Modifier.js';
import { EventBus } from '../../src/events/EventBus.js';

describe('Resource', () => {
  describe('constructor', () => {
    it('should create resource with base and current', () => {
      const health = new Resource('health', { base: 100, current: 75 });
      expect(health.name).to.equal('health');
      expect(health.getBaseMax()).to.equal(100);
      expect(health.getCurrent()).to.equal(75);
    });

    it('should default min to 0', () => {
      const health = new Resource('health', { base: 100, current: 50 });
      expect(health.getMin()).to.equal(0);
    });
  });

  describe('getCurrent() and setCurrent()', () => {
    it('should get/set current value', () => {
      const health = new Resource('health', { base: 100, current: 100 });
      health.setCurrent(50);
      expect(health.getCurrent()).to.equal(50);
    });

    it('should clamp to max', () => {
      const health = new Resource('health', { base: 100, current: 50 });
      health.setCurrent(150);
      expect(health.getCurrent()).to.equal(100);
    });

    it('should clamp to min', () => {
      const health = new Resource('health', { base: 100, current: 50 });
      health.setCurrent(-10);
      expect(health.getCurrent()).to.equal(0);
    });

    it('should respect modified max', () => {
      const health = new Resource('health', { base: 100, current: 100 });
      
      health.getMaxAttribute().addModifier(
        new Modifier({
          target: 'health_max',
          type: 'add',
          value: 50,
          priority: 0,
          source: { type: 'passive', id: 'test', createdAt: 0 },
        })
      );

      expect(health.getMax()).to.equal(150);
      health.setCurrent(140);
      expect(health.getCurrent()).to.equal(140);
    });
  });

  describe('getMax()', () => {
    it('should return base max with no modifiers', () => {
      const health = new Resource('health', { base: 100, current: 50 });
      expect(health.getMax()).to.equal(100);
    });

    it('should apply modifiers to max', () => {
      const health = new Resource('health', { base: 100, current: 50 });
      
      health.getMaxAttribute().addModifier(
        new Modifier({
          target: 'health_max',
          type: 'multiply',
          value: 1.5,
          priority: 0,
          source: { type: 'status', id: 'fortify', createdAt: 0 },
        })
      );

      expect(health.getMax()).to.equal(150);
    });
  });

  describe('add() and subtract()', () => {
    it('should add to current', () => {
      const health = new Resource('health', { base: 100, current: 50 });
      const added = health.add(30);
      expect(added).to.equal(30);
      expect(health.getCurrent()).to.equal(80);
    });

    it('should not exceed max when adding', () => {
      const health = new Resource('health', { base: 100, current: 90 });
      const added = health.add(20);
      expect(added).to.equal(10); // Only added 10
      expect(health.getCurrent()).to.equal(100);
    });

    it('should subtract from current', () => {
      const health = new Resource('health', { base: 100, current: 50 });
      const subtracted = health.subtract(20);
      expect(subtracted).to.equal(20);
      expect(health.getCurrent()).to.equal(30);
    });

    it('should not go below min when subtracting', () => {
      const health = new Resource('health', { base: 100, current: 10 });
      const subtracted = health.subtract(20);
      expect(subtracted).to.equal(10); // Only subtracted 10
      expect(health.getCurrent()).to.equal(0);
    });
  });

  describe('setMin() and getMin()', () => {
    it('should set minimum value', () => {
      const resource = new Resource('custom', { base: 100, current: 50 });
      resource.setMin(10);
      expect(resource.getMin()).to.equal(10);
    });

    it('should enforce minimum when set', () => {
      const resource = new Resource('custom', { base: 100, current: 5 });
      resource.setMin(10);
      expect(resource.getCurrent()).to.equal(10);
    });

    it('should prevent going below new minimum', () => {
      const resource = new Resource('custom', { base: 100, current: 50 });
      resource.setMin(20);
      resource.setCurrent(10);
      expect(resource.getCurrent()).to.equal(20);
    });
  });

  describe('setToMax() and setToMin()', () => {
    it('should set to max', () => {
      const health = new Resource('health', { base: 100, current: 50 });
      health.setToMax();
      expect(health.getCurrent()).to.equal(100);
    });

    it('should set to min', () => {
      const health = new Resource('health', { base: 100, current: 50 });
      health.setToMin();
      expect(health.getCurrent()).to.equal(0);
    });

    it('should respect modified max', () => {
      const health = new Resource('health', { base: 100, current: 50 });
      
      health.getMaxAttribute().addModifier(
        new Modifier({
          target: 'health_max',
          type: 'add',
          value: 50,
          priority: 0,
          source: { type: 'passive', id: 'test', createdAt: 0 },
        })
      );

      health.setToMax();
      expect(health.getCurrent()).to.equal(150);
    });
  });

  describe('isAtMax() and isAtMin()', () => {
    it('should check if at max', () => {
      const health = new Resource('health', { base: 100, current: 100 });
      expect(health.isAtMax()).to.be.true;

      health.setCurrent(99);
      expect(health.isAtMax()).to.be.false;
    });

    it('should check if at min', () => {
      const health = new Resource('health', { base: 100, current: 0 });
      expect(health.isAtMin()).to.be.true;

      health.setCurrent(1);
      expect(health.isAtMin()).to.be.false;
    });

    it('should check isDepleted', () => {
      const health = new Resource('health', { base: 100, current: 0 });
      expect(health.isDepleted()).to.be.true;
      
      health.setCurrent(1);
      expect(health.isDepleted()).to.be.false;
    });
  });

  describe('getPercentage()', () => {
    it('should return percentage of current/max', () => {
      const health = new Resource('health', { base: 100, current: 75 });
      expect(health.getPercentage()).to.equal(0.75);
    });

    it('should handle 0 max', () => {
      const resource = new Resource('custom', { base: 0, current: 0 });
      expect(resource.getPercentage()).to.equal(0);
    });

    it('should reflect modified max', () => {
      const health = new Resource('health', { base: 100, current: 100 });
      
      health.getMaxAttribute().addModifier(
        new Modifier({
          target: 'health_max',
          type: 'multiply',
          value: 2,
          priority: 0,
          source: { type: 'passive', id: 'test', createdAt: 0 },
        })
      );

      expect(health.getPercentage()).to.equal(0.5); // 100/200
    });
  });

  describe('events', () => {
    it('should emit resource:changed on value change', () => {
      const eventBus = new EventBus();
      const health = new Resource('health', { base: 100, current: 100 }, eventBus);
      
      let eventData: any;
      eventBus.on('resource:changed', (event) => {
        eventData = event.data;
      });

      health.setCurrent(50);
      
      expect(eventData).to.exist;
      expect(eventData.resource).to.equal('health');
      expect(eventData.oldValue).to.equal(100);
      expect(eventData.newValue).to.equal(50);
      expect(eventData.delta).to.equal(-50);
    });

    it('should emit resource:depleted when reaching min', () => {
      const eventBus = new EventBus();
      const health = new Resource('health', { base: 100, current: 10 }, eventBus);
      
      let depleted = false;
      eventBus.on('resource:depleted', () => {
        depleted = true;
      });

      health.setCurrent(0);
      expect(depleted).to.be.true;
    });

    it('should not emit depleted if already at min', () => {
      const eventBus = new EventBus();
      const health = new Resource('health', { base: 100, current: 0 }, eventBus);
      
      let depleted = false;
      eventBus.on('resource:depleted', () => {
        depleted = true;
      });

      health.setCurrent(0);
      expect(depleted).to.be.false;
    });

    it('should emit resource:restored when recovering from depletion', () => {
      const eventBus = new EventBus();
      const health = new Resource('health', { base: 100, current: 0 }, eventBus);
      
      let restored = false;
      eventBus.on('resource:restored', () => {
        restored = true;
      });

      health.setCurrent(10);
      expect(restored).to.be.true;
    });
  });

  describe('toJSON() and fromJSON()', () => {
    it('should serialize to JSON', () => {
      const health = new Resource('health', { base: 100, current: 75 });
      const json = health.toJSON();
      
      expect(json).to.deep.equal({ base: 100, current: 75 });
    });

    it('should deserialize from JSON', () => {
      const json = { base: 100, current: 50 };
      const health = Resource.fromJSON('health', json);
      
      expect(health.name).to.equal('health');
      expect(health.getBaseMax()).to.equal(100);
      expect(health.getCurrent()).to.equal(50);
    });
  });

  describe('clone()', () => {
    it('should clone resource', () => {
      const original = new Resource('health', { base: 100, current: 75 });
      original.setMin(10);
      
      const cloned = original.clone();
      
      expect(cloned.name).to.equal('health');
      expect(cloned.getBaseMax()).to.equal(100);
      expect(cloned.getCurrent()).to.equal(75);
      expect(cloned.getMin()).to.equal(10);
    });

    it('should be independent', () => {
      const original = new Resource('health', { base: 100, current: 75 });
      const cloned = original.clone();
      
      cloned.setCurrent(50);
      expect(original.getCurrent()).to.equal(75);
    });
  });

  describe('cloneWithModifiers()', () => {
    it('should clone with modifiers', () => {
      const original = new Resource('health', { base: 100, current: 75 });
      
      original.getMaxAttribute().addModifier(
        new Modifier({
          target: 'health_max',
          type: 'add',
          value: 50,
          priority: 0,
          source: { type: 'passive', id: 'test', createdAt: 0 },
        })
      );

      const cloned = original.cloneWithModifiers();
      expect(cloned.getMax()).to.equal(150);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle health in combat', () => {
      const eventBus = new EventBus();
      const health = new Resource('health', { base: 100, current: 100 }, eventBus);
      
      let depleted = false;
      eventBus.on('resource:depleted', () => {
        depleted = true;
      });

      // Take damage
      health.subtract(30);
      expect(health.getCurrent()).to.equal(70);
      expect(health.getPercentage()).to.equal(0.7);

      // Heal
      health.add(20);
      expect(health.getCurrent()).to.equal(90);

      // Take fatal damage
      health.subtract(100);
      expect(health.getCurrent()).to.equal(0);
      expect(depleted).to.be.true;
    });

    it('should handle mana with buffs', () => {
      const mana = new Resource('mana', { base: 50, current: 50 });
      
      // Intelligence buff: +20% max mana
      mana.getMaxAttribute().addModifier(
        new Modifier({
          target: 'mana_max',
          type: 'multiply',
          value: 1.2,
          priority: 0,
          source: { type: 'status', id: 'intelligence', createdAt: 0 },
        })
      );

      expect(mana.getMax()).to.equal(60);
      
      // Current mana is capped at old max
      expect(mana.getCurrent()).to.equal(50);
      
      // Can now restore to new max
      mana.setToMax();
      expect(mana.getCurrent()).to.equal(60);
    });

    it('should handle overheal prevention', () => {
      const health = new Resource('health', { base: 100, current: 90 });
      const healed = health.add(20);
      
      expect(healed).to.equal(10); // Only healed 10
      expect(health.getCurrent()).to.equal(100);
    });

    it('should handle resource with non-zero minimum', () => {
      const resource = new Resource('custom', { base: 100, current: 50 });
      resource.setMin(10);
      
      // Cannot go below 10
      resource.setCurrent(5);
      expect(resource.getCurrent()).to.equal(10);
      
      // Can still deplete to minimum
      resource.setToMin();
      expect(resource.getCurrent()).to.equal(10);
      expect(resource.isDepleted()).to.be.true;
    });
  });
});
