import { expect } from 'chai';
import { RandomSource } from '../../src/random/RandomSource.js';

describe('RandomSource', () => {
  describe('constructor', () => {
    it('should create with a seed', () => {
      const random = new RandomSource(12345);
      expect(random.getSeed()).to.equal(12345);
    });

    it('should convert seed to uint32', () => {
      const random = new RandomSource(-1);
      expect(random.getSeed()).to.be.greaterThan(0);
    });
  });

  describe('next()', () => {
    it('should return values in range [0, 1)', () => {
      const random = new RandomSource(42);
      for (let i = 0; i < 100; i++) {
        const value = random.next();
        expect(value).to.be.at.least(0);
        expect(value).to.be.lessThan(1);
      }
    });

    it('should be deterministic for same seed', () => {
      const random1 = new RandomSource(12345);
      const random2 = new RandomSource(12345);

      const values1 = Array.from({ length: 10 }, () => random1.next());
      const values2 = Array.from({ length: 10 }, () => random2.next());

      expect(values1).to.deep.equal(values2);
    });

    it('should produce different values for different seeds', () => {
      const random1 = new RandomSource(111);
      const random2 = new RandomSource(222);

      const values1 = Array.from({ length: 10 }, () => random1.next());
      const values2 = Array.from({ length: 10 }, () => random2.next());

      expect(values1).to.not.deep.equal(values2);
    });
  });

  describe('nextInt()', () => {
    it('should return integers in range [min, max]', () => {
      const random = new RandomSource(42);
      for (let i = 0; i < 100; i++) {
        const value = random.nextInt(10, 20);
        expect(value).to.be.at.least(10);
        expect(value).to.be.at.most(20);
        expect(Number.isInteger(value)).to.be.true;
      }
    });

    it('should handle min === max', () => {
      const random = new RandomSource(42);
      expect(random.nextInt(5, 5)).to.equal(5);
      expect(random.nextInt(5, 5)).to.equal(5);
    });

    it('should throw error if min > max', () => {
      const random = new RandomSource(42);
      expect(() => random.nextInt(10, 5)).to.throw();
    });

    it('should be deterministic', () => {
      const random1 = new RandomSource(999);
      const random2 = new RandomSource(999);

      const values1 = Array.from({ length: 10 }, () => random1.nextInt(1, 100));
      const values2 = Array.from({ length: 10 }, () => random2.nextInt(1, 100));

      expect(values1).to.deep.equal(values2);
    });

    it('should eventually produce all values in range', () => {
      const random = new RandomSource(42);
      const seen = new Set<number>();
      
      // Small range, should see all values with enough iterations
      for (let i = 0; i < 1000; i++) {
        seen.add(random.nextInt(1, 5));
      }

      expect(seen.size).to.equal(5); // Should see 1, 2, 3, 4, 5
    });
  });

  describe('choose()', () => {
    it('should choose element from array', () => {
      const random = new RandomSource(42);
      const array = ['a', 'b', 'c', 'd'];
      
      for (let i = 0; i < 20; i++) {
        const choice = random.choose(array);
        expect(array).to.include(choice);
      }
    });

    it('should return undefined for empty array', () => {
      const random = new RandomSource(42);
      expect(random.choose([])).to.be.undefined;
    });

    it('should be deterministic', () => {
      const random1 = new RandomSource(777);
      const random2 = new RandomSource(777);
      const array = [1, 2, 3, 4, 5];

      const choices1 = Array.from({ length: 10 }, () => random1.choose(array));
      const choices2 = Array.from({ length: 10 }, () => random2.choose(array));

      expect(choices1).to.deep.equal(choices2);
    });

    it('should work with single-element array', () => {
      const random = new RandomSource(42);
      expect(random.choose([42])).to.equal(42);
    });
  });

  describe('shuffle()', () => {
    it('should shuffle array in-place', () => {
      const random = new RandomSource(42);
      const array = [1, 2, 3, 4, 5];
      const original = [...array];
      
      const result = random.shuffle(array);
      
      expect(result).to.equal(array); // Same reference
      expect(array).to.have.lengthOf(5);
      expect(array).to.have.members(original); // Same elements
    });

    it('should be deterministic', () => {
      const random1 = new RandomSource(555);
      const random2 = new RandomSource(555);
      
      const array1 = [1, 2, 3, 4, 5];
      const array2 = [1, 2, 3, 4, 5];
      
      random1.shuffle(array1);
      random2.shuffle(array2);
      
      expect(array1).to.deep.equal(array2);
    });

    it('should handle empty array', () => {
      const random = new RandomSource(42);
      const array: number[] = [];
      random.shuffle(array);
      expect(array).to.be.empty;
    });
  });

  describe('nextFloat()', () => {
    it('should return floats in range [min, max)', () => {
      const random = new RandomSource(42);
      for (let i = 0; i < 100; i++) {
        const value = random.nextFloat(10.5, 20.5);
        expect(value).to.be.at.least(10.5);
        expect(value).to.be.lessThan(20.5);
      }
    });

    it('should throw error if min >= max', () => {
      const random = new RandomSource(42);
      expect(() => random.nextFloat(10, 10)).to.throw();
      expect(() => random.nextFloat(10, 5)).to.throw();
    });

    it('should be deterministic', () => {
      const random1 = new RandomSource(333);
      const random2 = new RandomSource(333);

      const values1 = Array.from({ length: 10 }, () => random1.nextFloat(0, 100));
      const values2 = Array.from({ length: 10 }, () => random2.nextFloat(0, 100));

      expect(values1).to.deep.equal(values2);
    });
  });

  describe('chance()', () => {
    it('should return boolean', () => {
      const random = new RandomSource(42);
      for (let i = 0; i < 20; i++) {
        const result = random.chance(0.5);
        expect(result).to.be.a('boolean');
      }
    });

    it('should always return true for probability 1', () => {
      const random = new RandomSource(42);
      for (let i = 0; i < 20; i++) {
        expect(random.chance(1.0)).to.be.true;
      }
    });

    it('should always return false for probability 0', () => {
      const random = new RandomSource(42);
      for (let i = 0; i < 20; i++) {
        expect(random.chance(0.0)).to.be.false;
      }
    });

    it('should throw for invalid probability', () => {
      const random = new RandomSource(42);
      expect(() => random.chance(-0.1)).to.throw();
      expect(() => random.chance(1.1)).to.throw();
    });

    it('should be roughly correct probability', () => {
      const random = new RandomSource(42);
      let successes = 0;
      const trials = 1000;
      
      for (let i = 0; i < trials; i++) {
        if (random.chance(0.3)) successes++;
      }
      
      // Should be around 300 successes (allow some variance)
      expect(successes).to.be.within(250, 350);
    });
  });

  describe('reset()', () => {
    it('should reset to initial seed', () => {
      const random = new RandomSource(42);
      const values1 = Array.from({ length: 5 }, () => random.next());
      
      random.reset();
      const values2 = Array.from({ length: 5 }, () => random.next());
      
      expect(values1).to.deep.equal(values2);
    });
  });

  describe('serialize/deserialize', () => {
    it('should serialize state', () => {
      const random = new RandomSource(12345);
      random.next();
      random.next();
      
      const data = random.serialize();
      
      expect(data).to.have.property('seed', 12345);
      expect(data).to.have.property('state');
    });

    it('should deserialize and continue sequence', () => {
      const random1 = new RandomSource(12345);
      random1.next();
      random1.next();
      
      const data = random1.serialize();
      const random2 = RandomSource.deserialize(data);
      
      const values1 = Array.from({ length: 5 }, () => random1.next());
      const values2 = Array.from({ length: 5 }, () => random2.next());
      
      expect(values1).to.deep.equal(values2);
    });

    it('should preserve determinism after deserialization', () => {
      const random1 = new RandomSource(999);
      for (let i = 0; i < 100; i++) random1.next();
      
      const data = random1.serialize();
      const random2 = RandomSource.deserialize(data);
      
      expect(random1.next()).to.equal(random2.next());
    });
  });

  describe('clone()', () => {
    it('should create independent copy', () => {
      const random1 = new RandomSource(42);
      random1.next();
      random1.next();
      
      const random2 = random1.clone();
      
      // Both should produce same sequence from current state
      expect(random1.next()).to.equal(random2.next());
      expect(random1.next()).to.equal(random2.next());
    });

    it('should not affect original when using clone', () => {
      const random1 = new RandomSource(42);
      const value1 = random1.next();
      
      const random2 = random1.clone();
      random2.next(); // Advance clone
      
      // Original should continue from where it was
      const value2 = random1.next();
      expect(value1).to.not.equal(value2);
    });
  });

  describe('determinism', () => {
    it('should produce identical combat scenario', () => {
      // Simulate a simple combat scenario with same seed
      const simulate = (seed: number) => {
        const random = new RandomSource(seed);
        const results = [];
        
        for (let turn = 0; turn < 10; turn++) {
          const damage = random.nextInt(10, 20);
          const criticalHit = random.chance(0.15);
          const finalDamage = criticalHit ? damage * 2 : damage;
          results.push(finalDamage);
        }
        
        return results;
      };
      
      const results1 = simulate(777);
      const results2 = simulate(777);
      const results3 = simulate(888); // Different seed
      
      expect(results1).to.deep.equal(results2);
      expect(results1).to.not.deep.equal(results3);
    });
  });
});
