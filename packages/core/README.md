# Agentic Workflows Core

`@kauanpolydoro/agentic-workflows-core` provides strict recipe and manifest schemas, bounded catalog loading, adapter bundle generation, hashing, and filesystem safety primitives.

The package does not execute external coding agents or approve generated outcomes.

This README describes the current Unreleased source tree.
The published `0.2.2` package still uses recipe schema version 3 and does not expose the execution-mode facet.
The schema version 4 migrations remain pending one cross-cutting human editorial review before publication.

## Schema version 4

Recipe schema version 4 requires `execution_mode: supervised | autonomous` on every recipe.
A supervised recipe must omit `autonomy`.
An autonomous recipe must provide the strict unattended contract and declare `persistent-execution` in `agent_requirements.capabilities`.

Schema version 3 recipe metadata is rejected rather than guessed.
Consumers migrating a recipe must choose its execution mode explicitly, add the autonomous contract only when applicable, and bump the recipe version because the bundle content changed.

## Public API

The root export includes `recipeSchema`, `catalogSchema`, `manifestSchema`, `executionModeIds`, `capabilityIds`, and their inferred TypeScript types such as `Recipe` and `ExecutionMode`.
The `./adapter-registry` export exposes adapter registry contracts separately.

Execution mode describes workflow design only.
It does not establish installation, external-agent execution, or human-reviewed outcome evidence.
