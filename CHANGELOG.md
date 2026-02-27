# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive DESIGN.md with complete architecture specification
- TypeScript project setup with strict type checking
- Core type definitions for all major concepts
- Project structure (src/, test/, schemas/ directories)
- Development tooling:
  - ESLint for linting
  - Prettier for code formatting
  - Mocha + Chai for testing
  - Build scripts and watch modes
- README.md with project overview and quick start guide
- AGENTS.md with instructions for AI agents
- Basic test infrastructure with setup test
- .gitignore for TypeScript builds

### Design Decisions
- Data-driven approach: Entire games definable via JSON
- Deterministic execution: No Math.random(), seeded PRNG instead
- Unopinionated engine: No hardcoded damage types, elements, or mechanics
- Modifier system as universal extension point
- Event-driven architecture for custom logic injection
- String-based formula evaluation for AI-friendly game design
- Performance-focused: Caching, lazy evaluation, minimal allocations

### In Progress
- Core class implementations (Entity, Action, Attribute, Resource)
- Modifier system (Modifier, ModifierStack)
- Formula evaluator
- Event bus
- Combat controller and turn strategies

## [1.0.0] - TBD

Initial release planned after core implementation is complete.
