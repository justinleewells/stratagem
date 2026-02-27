import { expect } from 'chai';
import { Formula } from '../../src/formula/Formula.js';
import { RandomSource } from '../../src/random/RandomSource.js';

describe('Formula', () => {
  describe('basic arithmetic', () => {
    it('should evaluate addition', () => {
      const formula = new Formula('5 + 3');
      expect(formula.evaluate({})).to.equal(8);
    });

    it('should evaluate subtraction', () => {
      const formula = new Formula('10 - 4');
      expect(formula.evaluate({})).to.equal(6);
    });

    it('should evaluate multiplication', () => {
      const formula = new Formula('6 * 7');
      expect(formula.evaluate({})).to.equal(42);
    });

    it('should evaluate division', () => {
      const formula = new Formula('20 / 4');
      expect(formula.evaluate({})).to.equal(5);
    });

    it('should evaluate modulo', () => {
      const formula = new Formula('17 % 5');
      expect(formula.evaluate({})).to.equal(2);
    });

    it('should respect operator precedence', () => {
      const formula = new Formula('2 + 3 * 4');
      expect(formula.evaluate({})).to.equal(14);
    });

    it('should handle parentheses', () => {
      const formula = new Formula('(2 + 3) * 4');
      expect(formula.evaluate({})).to.equal(20);
    });

    it('should handle nested parentheses', () => {
      const formula = new Formula('((2 + 3) * 4) - 5');
      expect(formula.evaluate({})).to.equal(15);
    });

    it('should handle negative numbers', () => {
      const formula = new Formula('-5 + 3');
      expect(formula.evaluate({})).to.equal(-2);
    });

    it('should handle decimals', () => {
      const formula = new Formula('3.5 * 2');
      expect(formula.evaluate({})).to.equal(7);
    });
  });

  describe('variables', () => {
    it('should access simple variables', () => {
      const formula = new Formula('x + y');
      const result = formula.evaluate({ x: 10, y: 5 });
      expect(result).to.equal(15);
    });

    it('should access dot notation', () => {
      const formula = new Formula('attacker.attack');
      const result = formula.evaluate({
        attacker: { attack: 25 },
      });
      expect(result).to.equal(25);
    });

    it('should access nested properties', () => {
      const formula = new Formula('target.resources.health.current');
      const result = formula.evaluate({
        target: {
          resources: {
            health: {
              current: 75,
            },
          },
        },
      });
      expect(result).to.equal(75);
    });

    it('should combine variables with arithmetic', () => {
      const formula = new Formula('attacker.attack * 1.5 - target.defense * 0.5');
      const result = formula.evaluate({
        attacker: { attack: 20 },
        target: { defense: 10 },
      });
      expect(result).to.equal(25); // 20 * 1.5 - 10 * 0.5 = 30 - 5 = 25
    });
  });

  describe('comparisons', () => {
    it('should evaluate less than', () => {
      const formula = new Formula('5 < 10 ? 1 : 0');
      expect(formula.evaluate({})).to.equal(1);
    });

    it('should evaluate greater than', () => {
      const formula = new Formula('10 > 5 ? 1 : 0');
      expect(formula.evaluate({})).to.equal(1);
    });

    it('should evaluate less than or equal', () => {
      const formula = new Formula('5 <= 5 ? 1 : 0');
      expect(formula.evaluate({})).to.equal(1);
    });

    it('should evaluate greater than or equal', () => {
      const formula = new Formula('10 >= 10 ? 1 : 0');
      expect(formula.evaluate({})).to.equal(1);
    });

    it('should evaluate equality', () => {
      const formula = new Formula('5 == 5 ? 1 : 0');
      expect(formula.evaluate({})).to.equal(1);
    });

    it('should evaluate inequality', () => {
      const formula = new Formula('5 != 3 ? 1 : 0');
      expect(formula.evaluate({})).to.equal(1);
    });
  });

  describe('ternary operator', () => {
    it('should evaluate ternary true branch', () => {
      const formula = new Formula('10 > 5 ? 100 : 200');
      expect(formula.evaluate({})).to.equal(100);
    });

    it('should evaluate ternary false branch', () => {
      const formula = new Formula('3 > 5 ? 100 : 200');
      expect(formula.evaluate({})).to.equal(200);
    });

    it('should handle complex conditions', () => {
      const formula = new Formula('health < maxHealth * 0.3 ? 50 : 30');
      const result = formula.evaluate({
        health: 25,
        maxHealth: 100,
      });
      expect(result).to.equal(50);
    });

    it('should handle nested ternary', () => {
      const formula = new Formula('x > 10 ? 100 : x > 5 ? 50 : 25');
      expect(formula.evaluate({ x: 15 })).to.equal(100);
      expect(formula.evaluate({ x: 7 })).to.equal(50);
      expect(formula.evaluate({ x: 3 })).to.equal(25);
    });
  });

  describe('built-in functions', () => {
    it('should use max()', () => {
      const formula = new Formula('max(5, 10, 3)');
      expect(formula.evaluate({})).to.equal(10);
    });

    it('should use min()', () => {
      const formula = new Formula('min(5, 10, 3)');
      expect(formula.evaluate({})).to.equal(3);
    });

    it('should use floor()', () => {
      const formula = new Formula('floor(3.7)');
      expect(formula.evaluate({})).to.equal(3);
    });

    it('should use ceil()', () => {
      const formula = new Formula('ceil(3.2)');
      expect(formula.evaluate({})).to.equal(4);
    });

    it('should use abs()', () => {
      const formula = new Formula('abs(-5)');
      expect(formula.evaluate({})).to.equal(5);
    });

    it('should use clamp()', () => {
      const formula = new Formula('clamp(15, 0, 10)');
      expect(formula.evaluate({})).to.equal(10);
    });

    it('should combine functions with operators', () => {
      const formula = new Formula('max(0, attack - defense) * 2');
      const result = formula.evaluate({
        attack: 15,
        defense: 10,
      });
      expect(result).to.equal(10); // max(0, 5) * 2
    });
  });

  describe('complex formulas', () => {
    it('should handle damage calculation', () => {
      const formula = new Formula('max(0, attacker.attack * 1.5 - target.defense * 0.5)');
      const result = formula.evaluate({
        attacker: { attack: 20 },
        target: { defense: 10 },
      });
      expect(result).to.equal(25);
    });

    it('should handle critical hit calculation', () => {
      const formula = new Formula('(random.next() < 0.15 ? 2 : 1) * baseDamage');
      const random = new RandomSource(42);
      const context = {
        random,
        baseDamage: 50,
      };

      // Deterministic: we know what random.next() will return
      const result = formula.evaluate(context);
      expect(result).to.be.oneOf([50, 100]); // Either normal or crit
    });

    it('should handle execute threshold', () => {
      const formula = new Formula(
        'target.health < target.maxHealth * 0.3 ? baseDamage * 2 : baseDamage'
      );
      
      expect(
        formula.evaluate({
          target: { health: 25, maxHealth: 100 },
          baseDamage: 50,
        })
      ).to.equal(100); // Below 30%
      
      expect(
        formula.evaluate({
          target: { health: 50, maxHealth: 100 },
          baseDamage: 50,
        })
      ).to.equal(50); // Above 30%
    });

    it('should handle armor penetration', () => {
      const formula = new Formula(
        'attack * skillMultiplier - max(0, (defense - armorPen)) * 0.5'
      );
      const result = formula.evaluate({
        attack: 30,
        skillMultiplier: 1.2,
        defense: 20,
        armorPen: 10,
      });
      expect(result).to.equal(31); // 30 * 1.2 - max(0, 10) * 0.5 = 36 - 5 = 31
    });
  });

  describe('random integration', () => {
    it('should work with RandomSource', () => {
      const formula = new Formula('floor(random.nextInt(10, 20))');
      const random = new RandomSource(12345);
      const result = formula.evaluate({ random });
      
      expect(result).to.be.at.least(10);
      expect(result).to.be.at.most(20);
    });

    it('should be deterministic with same seed', () => {
      const formula = new Formula('random.nextInt(1, 100)');
      
      const random1 = new RandomSource(777);
      const result1 = formula.evaluate({ random: random1 });
      
      const random2 = new RandomSource(777);
      const result2 = formula.evaluate({ random: random2 });
      
      expect(result1).to.equal(result2);
    });
  });

  describe('error handling', () => {
    it('should throw on invalid syntax', () => {
      const formula = new Formula('5 +* 3');
      expect(() => formula.evaluate({})).to.throw();
    });

    it('should throw on undefined variable', () => {
      const formula = new Formula('x + y');
      expect(() => formula.evaluate({ x: 5 })).to.throw();
    });

    it('should throw on non-number result', () => {
      const formula = new Formula('"hello"');
      expect(() => formula.evaluate({})).to.throw(/did not return a valid number/);
    });

    it('should throw on division by zero (infinity)', () => {
      const formula = new Formula('10 / 0');
      expect(() => formula.evaluate({})).to.throw(/did not return a valid number/);
    });

    it('should provide helpful error messages', () => {
      const formula = new Formula('invalid syntax here');
      try {
        formula.evaluate({});
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect((error as Error).message).to.include('Failed to evaluate formula');
      }
    });
  });

  describe('security', () => {
    it('should not allow eval', () => {
      const formula = new Formula('eval("1 + 1")');
      expect(() => formula.evaluate({})).to.throw();
    });

    it('should not allow Function constructor', () => {
      const formula = new Formula('Function("return 1")()');
      expect(() => formula.evaluate({})).to.throw();
    });

    it('should prevent prototype pollution', () => {
      const formula = new Formula('x + 1');
      const result = formula.evaluate({
        __proto__: { x: 999 }, // Should be ignored
        x: 5,
      });
      expect(result).to.equal(6);
    });
  });

  describe('utility methods', () => {
    it('should convert to string', () => {
      const formula = new Formula('x + y');
      expect(formula.toString()).to.equal('x + y');
    });

    it('should check variable usage', () => {
      const formula = new Formula('attacker.attack + target.defense');
      expect(formula.usesVariable('attacker')).to.be.true;
      expect(formula.usesVariable('target')).to.be.true;
      expect(formula.usesVariable('random')).to.be.false;
    });

    it('should create from string', () => {
      const formula = Formula.from('5 + 5');
      expect(formula.evaluate({})).to.equal(10);
    });

    it('should validate syntax', () => {
      expect(Formula.validate('5 + 5')).to.be.true;
      expect(Formula.validate('x * y')).to.be.true;
      expect(Formula.validate('5 +* 3')).to.be.false;
      expect(Formula.validate('invalid syntax')).to.be.false;
    });
  });

  describe('game mechanics examples', () => {
    it('should calculate basic damage', () => {
      const formula = new Formula('attacker.attack - target.defense');
      expect(
        formula.evaluate({
          attacker: { attack: 50 },
          target: { defense: 20 },
        })
      ).to.equal(30);
    });

    it('should calculate percentage-based damage', () => {
      const formula = new Formula('target.maxHealth * 0.1');
      expect(
        formula.evaluate({
          target: { maxHealth: 200 },
        })
      ).to.equal(20);
    });

    it('should calculate scaling damage', () => {
      const formula = new Formula('baseDamage + attacker.level * 5');
      expect(
        formula.evaluate({
          baseDamage: 30,
          attacker: { level: 10 },
        })
      ).to.equal(80);
    });

    it('should calculate lifesteal', () => {
      const formula = new Formula('floor(damageDealt * 0.2)');
      expect(formula.evaluate({ damageDealt: 48 })).to.equal(9);
    });

    it('should calculate rage generation', () => {
      const formula = new Formula('min(100, currentRage + damageDealt * 0.5)');
      expect(
        formula.evaluate({
          currentRage: 80,
          damageDealt: 50,
        })
      ).to.equal(100); // Capped at 100
    });
  });
});
