/**
 * Deterministic pseudo-random number generator using Mulberry32 algorithm
 * 
 * This provides reproducible randomness critical for deterministic combat simulation.
 * Given the same seed, it will always produce the same sequence of random numbers.
 */
export class RandomSource {
  private state: number;
  private readonly initialSeed: number;

  /**
   * Create a new random source with a seed
   * @param seed - Integer seed value (will be converted to uint32)
   */
  constructor(seed: number) {
    this.initialSeed = seed >>> 0; // Convert to uint32
    this.state = this.initialSeed;
  }

  /**
   * Get the next random float in range [0, 1)
   * Uses Mulberry32 algorithm for high-quality randomness
   */
  next(): number {
    // Mulberry32 algorithm
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return result;
  }

  /**
   * Get random integer in range [min, max] inclusive
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (inclusive)
   */
  nextInt(min: number, max: number): number {
    if (min > max) {
      throw new Error(`min (${min}) must be <= max (${max})`);
    }
    const range = max - min + 1;
    return Math.floor(this.next() * range) + min;
  }

  /**
   * Choose a random element from an array
   * @param array - Array to choose from
   * @returns Random element, or undefined if array is empty
   */
  choose<T>(array: T[]): T | undefined {
    if (array.length === 0) {
      return undefined;
    }
    const index = this.nextInt(0, array.length - 1);
    return array[index];
  }

  /**
   * Shuffle an array in-place using Fisher-Yates algorithm
   * @param array - Array to shuffle
   * @returns The same array (shuffled in-place)
   */
  shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Get random float in range [min, max)
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   */
  nextFloat(min: number, max: number): number {
    if (min >= max) {
      throw new Error(`min (${min}) must be < max (${max})`);
    }
    return this.next() * (max - min) + min;
  }

  /**
   * Check if random chance succeeds (0.0 to 1.0)
   * @param probability - Probability of success [0, 1]
   * @returns true if random value is less than probability
   */
  chance(probability: number): boolean {
    if (probability < 0 || probability > 1) {
      throw new Error(`probability (${probability}) must be between 0 and 1`);
    }
    return this.next() < probability;
  }

  /**
   * Reset to initial seed
   */
  reset(): void {
    this.state = this.initialSeed;
  }

  /**
   * Get current state for serialization
   */
  serialize(): { seed: number; state: number } {
    return {
      seed: this.initialSeed,
      state: this.state,
    };
  }

  /**
   * Restore from serialized state
   */
  static deserialize(data: { seed: number; state: number }): RandomSource {
    const random = new RandomSource(data.seed);
    random.state = data.state;
    return random;
  }

  /**
   * Get the initial seed
   */
  getSeed(): number {
    return this.initialSeed;
  }

  /**
   * Clone this random source with current state
   */
  clone(): RandomSource {
    return RandomSource.deserialize(this.serialize());
  }
}
