import { expect } from 'chai';
import { Effect, EffectContext, EffectResult } from '../../src/core/Effect.js';
import { EffectData, EntityData, GameEvent } from '../../src/types/index.js';
import { Entity } from '../../src/core/Entity.js';

describe('Effect', () => {
  let attacker: Entity;
  let target: Entity;

  beforeEach(() => {
    // Create test entities
    const attackerData: EntityData = {
      id: 'attacker',
      name: 'Attacker',
      attributes: {
        attack: { base: 20 },
      },
      resources: {
        health: { base: 100, current: 100 },
      },
    };
    attacker = new Entity(attackerData);
    
    const targetData: EntityData = {
      id: 'target',
      name: 'Target',
      attributes: {
        defense: { base: 10 },
      },
      resources: {
        health: { base: 100, current: 80 },
      },
    };
    target = new Entity(targetData);
  });

  describe('Damage Effect', () => {
    it('should apply damage using formula', () => {
      const effectData: EffectData = {
        type: 'damage',
        formula: 'attacker.attack - target.defense',
        target: 'selected',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.value).to.equal(10); // 20 - 10
      expect(target.getResource('health')?.getCurrent()).to.equal(70); // 80 - 10
    });

    it('should not apply negative damage', () => {
      const effectData: EffectData = {
        type: 'damage',
        formula: 'attacker.attack - target.defense - 50',
        target: 'selected',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.value).to.equal(0); // max(0, 20 - 10 - 50)
      expect(target.getResource('health')?.getCurrent()).to.equal(80); // No change
    });

    it('should include tags in metadata', () => {
      const effectData: EffectData = {
        type: 'damage',
        formula: '10',
        target: 'selected',
        tags: ['physical', 'melee'],
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.metadata?.tags).to.deep.equal(['physical', 'melee']);
    });

    it('should fail if target has no health resource', () => {
      const noHealthData: EntityData = {
        id: 'test',
        name: 'Test',
        attributes: {},
        resources: {},
      };
      const noHealthEntity = new Entity(noHealthData);
      
      const effectData: EffectData = {
        type: 'damage',
        formula: '10',
        target: 'selected',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: noHealthEntity,
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('no health resource');
    });

    it('should fail if no formula provided', () => {
      const effectData: EffectData = {
        type: 'damage',
        target: 'selected',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('requires formula');
    });
  });

  describe('Heal Effect', () => {
    it('should apply healing using formula', () => {
      const effectData: EffectData = {
        type: 'heal',
        formula: '15',
        target: 'selected',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.value).to.equal(15);
      expect(target.getResource('health')?.getCurrent()).to.equal(95); // 80 + 15
    });

    it('should not exceed max health', () => {
      const effectData: EffectData = {
        type: 'heal',
        formula: '50',
        target: 'selected',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.value).to.equal(50);
      expect(target.getResource('health')?.getCurrent()).to.equal(100); // Capped at max
    });

    it('should not apply negative healing', () => {
      const effectData: EffectData = {
        type: 'heal',
        formula: '-10',
        target: 'selected',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.value).to.equal(0);
      expect(target.getResource('health')?.getCurrent()).to.equal(80); // No change
    });

    it('should fail if target has no health resource', () => {
      const noHealthData: EntityData = {
        id: 'test',
        name: 'Test',
        attributes: {},
        resources: {},
      };
      const noHealthEntity = new Entity(noHealthData);
      
      const effectData: EffectData = {
        type: 'heal',
        formula: '10',
        target: 'selected',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: noHealthEntity,
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('no health resource');
    });
  });

  describe('Modify Resource Effect', () => {
    it('should set resource to formula value', () => {
      // Create entity with mana resource
      const mageData: EntityData = {
        id: 'mage',
        name: 'Mage',
        attributes: {},
        resources: {
          mana: { base: 100, current: 50 },
        },
      };
      const mage = new Entity(mageData);
      
      const effectData: EffectData = {
        type: 'modify_resource',
        formula: 'self.resources.mana.current + 20',
        target: 'self',
        tags: ['mana'],
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: mage,
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.value).to.equal(20); // Change amount
      expect(mage.getResource('mana')?.getCurrent()).to.equal(70);
    });

    it('should work with min/max functions', () => {
      // Create entity with rage resource
      const berserkerData: EntityData = {
        id: 'berserker',
        name: 'Berserker',
        attributes: {},
        resources: {
          rage: { base: 100, current: 80 },
        },
      };
      const berserker = new Entity(berserkerData);
      
      const effectData: EffectData = {
        type: 'modify_resource',
        formula: 'min(100, self.resources.rage.current + 30)',
        target: 'self',
        tags: ['rage'],
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: berserker,
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(berserker.getResource('rage')?.getCurrent()).to.equal(100); // Capped by min()
    });

    it('should fail if resource does not exist', () => {
      const effectData: EffectData = {
        type: 'modify_resource',
        formula: '50',
        target: 'self',
        tags: ['nonexistent'],
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('no resource');
    });
  });

  describe('Modify Event Effect', () => {
    it('should modify event data using formulas', () => {
      const event: GameEvent = {
        type: 'damage:before_apply',
        timestamp: Date.now(),
        cancelled: false,
        data: {
          damage: 50,
          source: attacker,
          target: target,
        },
      };

      const effectData: EffectData = {
        type: 'modify_event',
        target: 'self',
        eventModifications: {
          damage: 'damage * 0.5',
        },
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: target,
        event,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.metadata?.modifications.damage).to.equal(25);
    });

    it('should modify multiple event properties', () => {
      const event: GameEvent = {
        type: 'damage:calculated',
        timestamp: Date.now(),
        cancelled: false,
        data: {
          damage: 30,
          criticalChance: 0.1,
        },
      };

      const effectData: EffectData = {
        type: 'modify_event',
        target: 'self',
        eventModifications: {
          damage: 'damage * 2',
          criticalChance: '1.0',
        },
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        event,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.metadata?.modifications.damage).to.equal(60);
      expect(result.metadata?.modifications.criticalChance).to.equal(1.0);
    });

    it('should fail if no event context', () => {
      const effectData: EffectData = {
        type: 'modify_event',
        target: 'self',
        eventModifications: {
          damage: 'damage * 0.5',
        },
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('requires event context');
    });
  });

  describe('Cancel Event Effect', () => {
    it('should signal event cancellation', () => {
      const event: GameEvent = {
        type: 'damage:before_apply',
        timestamp: Date.now(),
        cancelled: false,
        data: {
          damage: 50,
          source: attacker,
          target: target,
        },
      };

      const effectData: EffectData = {
        type: 'cancel_event',
        target: 'self',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: target,
        event,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.metadata?.cancelled).to.be.true;
    });

    it('should fail if no event context', () => {
      const effectData: EffectData = {
        type: 'cancel_event',
        target: 'self',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('requires event context');
    });
  });

  describe('Conditional Effect', () => {
    it('should execute then effects when condition is true', () => {
      const effectData: EffectData = {
        type: 'conditional_effect',
        condition: 'target.resources.health.current < 50',
        target: 'selected',
        thenEffects: [
          {
            type: 'damage',
            formula: '100',
            target: 'selected',
          },
        ],
        elseEffects: [
          {
            type: 'damage',
            formula: '10',
            target: 'selected',
          },
        ],
      };

      target.getResource('health')!.setCurrent(40);

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.metadata?.branch).to.equal('then');
      expect(target.getResource('health')?.getCurrent()).to.equal(0); // 40 - 100 (capped at 0)
    });

    it('should execute else effects when condition is false', () => {
      const effectData: EffectData = {
        type: 'conditional_effect',
        condition: 'target.resources.health.current < 50',
        target: 'selected',
        thenEffects: [
          {
            type: 'damage',
            formula: '100',
            target: 'selected',
          },
        ],
        elseEffects: [
          {
            type: 'damage',
            formula: '10',
            target: 'selected',
          },
        ],
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.metadata?.branch).to.equal('else');
      expect(target.getResource('health')?.getCurrent()).to.equal(70); // 80 - 10
    });

    it('should fail if condition is missing', () => {
      const effectData: EffectData = {
        type: 'conditional_effect',
        target: 'selected',
        thenEffects: [
          {
            type: 'damage',
            formula: '10',
            target: 'selected',
          },
        ],
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('requires condition');
    });

    it('should succeed with no effects to execute', () => {
      const effectData: EffectData = {
        type: 'conditional_effect',
        condition: 'true',
        target: 'selected',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.metadata?.branch).to.equal('then');
    });
  });

  describe('Effect Conditions', () => {
    it('should skip effect if condition is false', () => {
      const effectData: EffectData = {
        type: 'damage',
        formula: '50',
        target: 'selected',
        condition: 'target.resources.health.current < 30',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('Condition not met');
      expect(target.getResource('health')?.getCurrent()).to.equal(80); // No change
    });

    it('should execute effect if condition is true', () => {
      const effectData: EffectData = {
        type: 'damage',
        formula: '50',
        target: 'selected',
        condition: 'target.resources.health.current < 90',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(target.getResource('health')?.getCurrent()).to.equal(30); // 80 - 50
    });

    it('should treat failed condition evaluation as false', () => {
      const effectData: EffectData = {
        type: 'damage',
        formula: '50',
        target: 'selected',
        condition: 'nonexistent.property.value',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('Condition not met');
    });
  });

  describe('Target Resolution', () => {
    it('should resolve self target', () => {
      attacker.getResource('health')!.setCurrent(50);
      
      const effectData: EffectData = {
        type: 'heal',
        formula: '20',
        target: 'self',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(attacker.getResource('health')?.getCurrent()).to.equal(70);
    });

    it('should resolve selected target', () => {
      const effectData: EffectData = {
        type: 'damage',
        formula: '15',
        target: 'selected',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(target.getResource('health')?.getCurrent()).to.equal(65);
    });

    it('should resolve event_source target', () => {
      const event: GameEvent = {
        type: 'damage:applied',
        timestamp: Date.now(),
        cancelled: false,
        data: {
          damage: 20,
          source: attacker,
          target: target,
        },
      };

      attacker.getResource('health')!.setCurrent(100);

      const effectData: EffectData = {
        type: 'damage',
        formula: '10',
        target: 'event_source',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: target,
        event,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(attacker.getResource('health')?.getCurrent()).to.equal(90); // Attacker took damage
    });

    it('should resolve event_target target', () => {
      const event: GameEvent = {
        type: 'damage:applied',
        timestamp: Date.now(),
        cancelled: false,
        data: {
          damage: 20,
          source: attacker,
          target: target,
        },
      };

      const effectData: EffectData = {
        type: 'heal',
        formula: '15',
        target: 'event_target',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        event,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(target.getResource('health')?.getCurrent()).to.equal(95);
    });
  });

  describe('Previous Effect Chaining', () => {
    it('should pass previous effect result to next effect', () => {
      const damageEffect: EffectData = {
        type: 'damage',
        formula: '30',
        target: 'selected',
      };

      const healEffect: EffectData = {
        type: 'heal',
        formula: 'previousEffect.value * 0.5',
        target: 'self',
        condition: 'previousEffect.succeeded',
      };

      const damageExecutor = new Effect(damageEffect);
      const damageContext: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const damageResult = damageExecutor.execute(damageContext);

      attacker.getResource('health')!.setCurrent(50);

      const healExecutor = new Effect(healEffect);
      const healContext: EffectContext = {
        source: attacker,
        target: target,
        
        previousEffect: damageResult,
      };

      const healResult = healExecutor.execute(healContext);

      expect(healResult.succeeded).to.be.true;
      expect(healResult.value).to.equal(15); // 30 * 0.5
      expect(attacker.getResource('health')?.getCurrent()).to.equal(65);
    });

    it('should not execute effect if previous effect failed', () => {
      const previousResult: EffectResult = {
        succeeded: false,
        error: 'Previous effect failed',
      };

      const effectData: EffectData = {
        type: 'damage',
        formula: '20',
        target: 'selected',
        condition: 'previousEffect.succeeded',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
        previousEffect: previousResult,
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('Condition not met');
      expect(target.getResource('health')?.getCurrent()).to.equal(80); // No change
    });
  });

  describe('Event Context', () => {
    it('should expose event data in formula context', () => {
      const event: GameEvent = {
        type: 'damage:applied',
        timestamp: Date.now(),
        cancelled: false,
        data: {
          damage: 25,
          source: attacker,
          target: target,
        },
      };

      const effectData: EffectData = {
        type: 'damage',
        formula: 'damage * 0.3',
        target: 'event_source',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: target,
        event,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.value).to.equal(7.5); // 25 * 0.3
    });

    it('should expose healing in formula context', () => {
      const event: GameEvent = {
        type: 'heal:applied',
        timestamp: Date.now(),
        cancelled: false,
        data: {
          healing: 40,
          source: attacker,
          target: target,
        },
      };

      const effectData: EffectData = {
        type: 'damage',
        formula: 'healing * 0.25',
        target: 'event_source',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: target,
        event,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.true;
      expect(result.value).to.equal(10); // 40 * 0.25
    });
  });

  describe('Not Yet Implemented Effects', () => {
    it('should return error for apply_status', () => {
      const effectData: EffectData = {
        type: 'apply_status',
        target: 'selected',
        statusId: 'poison',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('not yet implemented');
    });

    it('should return error for execute_action', () => {
      const effectData: EffectData = {
        type: 'execute_action',
        target: 'selected',
        actionId: 'basic_attack',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('not yet implemented');
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown effect type', () => {
      const effectData: any = {
        type: 'unknown_effect_type',
        target: 'selected',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('Unknown effect type');
    });

    it('should handle formula evaluation errors', () => {
      const effectData: EffectData = {
        type: 'damage',
        formula: 'undefined.property.access',
        target: 'selected',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        target: target,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('evaluation failed');
    });

    it('should handle missing target gracefully', () => {
      const effectData: EffectData = {
        type: 'damage',
        formula: '50',
        target: 'selected',
      };

      const effect = new Effect(effectData);
      const context: EffectContext = {
        source: attacker,
        
      };

      const result = effect.execute(context);

      expect(result.succeeded).to.be.false;
      expect(result.error).to.include('Invalid target');
    });
  });

  describe('getData', () => {
    it('should return the effect data', () => {
      const effectData: EffectData = {
        type: 'damage',
        formula: '50',
        target: 'selected',
        tags: ['physical'],
      };

      const effect = new Effect(effectData);
      const data = effect.getData();

      expect(data).to.deep.equal(effectData);
    });
  });
});
