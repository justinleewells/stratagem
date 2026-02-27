# Stratagem

A data-driven, deterministic library for simulating role-playing game battles, optimized for use by AI agents.

## Features

- **Unopinionated**: Provides composable primitives, not prescriptive game rules
- **Data-Driven**: Define entire games via validated JSON schemas
- **Deterministic**: Identical inputs always produce identical outputs
- **Type-Safe**: Full TypeScript support with comprehensive type definitions
- **Extensible**: Plugin architecture and event system for custom mechanics
- **Performant**: Optimized for high-throughput simulation

## Design Philosophy

Stratagem doesn't make decisions about what your game should be like. Instead, it offers:

- **Modifiers**: Universal extension mechanism for any stat modification
- **Events**: Hook points for custom game logic
- **Formulas**: String-based expressions for data-driven calculations
- **Turn Strategies**: Pluggable combat flow (sequential, simultaneous, action-point, etc.)
- **Tag System**: Arbitrary labels for implementing game-specific mechanics

This means you can implement damage types, elements, critical hits, combos, and any other mechanic purely through data—no code changes required.

## Status

🚧 **In Development** - Core architecture and design complete, implementation in progress.

See [DESIGN.md](./DESIGN.md) for detailed architecture and concepts.

## Quick Start

### Installation

```bash
npm install stratagem
```

### Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format
```

## Project Structure

```
stratagem/
├── src/
│   ├── core/          # Core classes (Entity, Action, etc.)
│   ├── modifiers/     # Modifier system
│   ├── combat/        # Combat flow and turn strategies
│   ├── effects/       # Effect system
│   ├── targeting/     # Targeting system
│   ├── events/        # Event bus
│   ├── formula/       # Formula evaluator
│   ├── random/        # Deterministic RNG
│   ├── plugins/       # Plugin system
│   └── types/         # TypeScript type definitions
├── test/              # Test files
├── schemas/           # JSON schemas
└── DESIGN.md          # Detailed design documentation
```

## Documentation

- [DESIGN.md](./DESIGN.md) - Comprehensive design and architecture
- [AGENTS.md](./AGENTS.md) - Instructions for AI agents working on this project

## Example

```typescript
// Example usage (API under development)
import { Instance, Entity, Action } from 'stratagem';

// Load game data from JSON
const knight = Entity.fromJSON(knightData);
const goblin = Entity.fromJSON(goblinData);

// Create combat instance
const combat = new Instance({
  seed: 12345,
  turnStrategy: 'sequential',
  entities: [knight, goblin]
});

// Simulate combat
while (!combat.isComplete()) {
  const actor = combat.getNextActor();
  const action = actor.getAvailableActions()[0];
  const target = action.getValidTargets(combat)[0];
  
  combat.execute(action, target);
}

console.log(combat.getWinner());
```

## Contributing

This project uses [bd (beads)](https://github.com/beadifyio/beads) for issue tracking. Run `bd onboard` to get started.

## License

MIT © Justin Wells
