# ADR 0001: Keep recipes as validated data behind a shared core

- Status: Accepted
- Date: 2026-07-15

## Context

The CLI, documentation generator, compatibility matrix, and contributor tooling must interpret recipes identically.
Recipes are community-authored inputs and must not execute code.

## Decision

Maintain a small `@kauanpolydoro/agentic-workflows-core` package as the only owner of recipe and manifest schemas, catalog loading, path controls, hashing, and adapter serialization.
Keep recipe directories limited to YAML metadata, Markdown content, examples, and checklists.
Consumers may orchestrate filesystem operations, but they must use core validation and path primitives.

## Alternatives considered

Validation inside the CLI was rejected because documentation generation would either duplicate behavior or import a user interface package.
A plugin runtime was rejected because executable recipes would expand the trust boundary and conflict with offline, data-only operation.

## Consequences

All product surfaces share strict contracts and structured errors.
The core package remains filesystem-aware but does not own terminal interaction.
Adding schema fields requires a versioned migration and regenerated JSON Schema.
