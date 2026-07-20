# Repository instructions for coding agents

## Product boundary

Agentic Workflows is a TypeScript monorepo containing validated recipe data, a shared core, a local CLI, fixtures, and generated VitePress documentation.
Recipes are never executable plugins.

## Commands

Use `pnpm build`, `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm test:coverage`, `pnpm test:integration`, `pnpm validate:recipes`, and `pnpm docs:build` before handoff.

## Architecture

`packages/core` owns schemas, catalog parsing, path safety, hashes, manifests, filters, compatibility, and adapter serialization.
`packages/cli` owns terminal interaction and filesystem lifecycle orchestration.
`recipes` contains YAML and Markdown only.
`scripts/generate.ts` produces JSON Schema, catalog JSON, workflow pages, and compatibility documentation.

## Add a recipe

Run `pnpm new:recipe <id>`, replace every scaffold marker, add original examples, declare support honestly, validate, and regenerate the catalog.
Do not mark execution or outcome passing without evidence from an actual run.

## Recipe quality requirements

Follow [`docs/quality/recipe-quality-standard.md`](docs/quality/recipe-quality-standard.md) for every new or changed recipe.
Keep examples self-contained, define unique evidence IDs in the input, and make every material output claim derivable from those inputs.
Use observable workflow actions, explicit condition-to-action decisions, paired failure and recovery IDs, domain-specific execution checklists, and complete individual READMEs.
Pass deterministic validation and adversarial human review before assigning final status `pass`.
Treat structural validation, exporter contracts, installation, external-agent execution, and outcome review as separate evidence states.
Never claim a tested agent version, verification date, execution, outcome, support level, or compatibility without retained evidence.

## Add an adapter

Confirm the current format through official vendor documentation, record the source and consultation date, implement deterministic serialization in core, and test installation on temporary paths including Windows semantics.

## Safety invariants

Never execute recipe content, write outside the selected project target, follow symlinks during install or removal, overwrite or remove modified files silently, log secrets, add telemetry, or introduce normal-use network calls.
Do not weaken strict schemas or file-size limits without an ADR and tests.

Generated files under `generated/` and `docs/catalog/` must be changed through the generator, not edited manually.
