# Refactor a large module through reversible slices

Use this recipe to decompose one change-coupled module without losing control of its public behavior.
It produces reviewable code checkpoints and an evidence record that shows what stayed stable, how each slice was validated, and how it can be rolled back.

## Primary use cases

- Separate parsing, orchestration, persistence, formatting, or other responsibilities that currently change together in one module.
- Establish explicit dependency direction while preserving an existing import path or public facade.
- Deliver a high-risk internal refactor as small checkpoints that can be reviewed, measured, and reverted independently.

## When not to use

- The request is a feature rewrite, public API redesign, framework migration, or opportunistic repository cleanup.
- Callers, side effects, or baseline behavior cannot be identified well enough to detect a regression.

## Required evidence

Provide an immutable starting revision, every permitted source and test path, explicit exclusions, and the initial working-tree state.

Provide every public export, known caller, observable output, error contract, side effect, state invariant, and compatibility constraint.

Provide reproducible characterization and project commands with their environment and baseline results.

Provide proposed destination files, responsibility statements, dependency direction, checkpoint order, approval state, and independently executable rollback units.

## Produced artifacts

The contracted output artifact is one Markdown refactor delivery record containing exact per-checkpoint and final path inventories, immutable change-set identities, the contract map, boundary decisions, checkpoint results, dependency checks, rollback drills, approvals, residual risks, and evidence traceability.

Applying source and test edits is a repository effect of the workflow, as declared by `effects.writes_code`.
Those edits must remain available as independently retained version-control diffs, but the Markdown output contract does not claim to serialize source or test files.

## Primary risks

The main risks are missing a caller, changing a subtle side effect, introducing circular or inverted dependencies, hiding a behavior change inside file movement, and creating a checkpoint that cannot be reverted safely.

The workflow stops on uncharacterized behavior, unapproved contract drift, unexplained files, failed rollback, or incomparable performance evidence.

## How to use this recipe

1. Freeze the module scope and build the contract and caller map described in [workflow.md](workflow.md).
2. Establish a reproducible baseline before proposing new boundaries.
3. Design and implement one independently revertible responsibility slice at a time.
4. Use [checklist.md](checklist.md) during each checkpoint and final reconciliation.
5. Compare the result with the [synthetic input](examples/input.md) and [complete refactor record](examples/expected-output.md).
6. Submit the retained repository diffs with the contracted delivery record, rollback evidence, and residual-risk ownership to the repository maintainer.

The `8h` metadata duration is an approximate execution window for one well-characterized module and must be recalibrated from the actual checkpoint count and test cost.

## Files

- [recipe.yml](recipe.yml) defines catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- [workflow.md](workflow.md) is the canonical procedure for contract discovery, slice design, extraction, verification, rollback, and delivery.
- [checklist.md](checklist.md) controls omissions at the contract, boundary, checkpoint, safety, and delivery gates.
- [output.schema.json](output.schema.json) defines the machine-readable contract for the Markdown delivery record; repository code and test diffs remain separate version-control evidence.
- [examples/input.md](examples/input.md) contains a self-contained synthetic reporting-module evidence package.
- [examples/expected-output.md](examples/expected-output.md) demonstrates a complete, evidence-backed refactor delivery record.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

This procedure cannot prove that consumers outside the available repository and supplied inventory do not exist.

It cannot establish performance preservation without comparable measurements, and it cannot make nondeterministic side effects safe by documentation alone.

Repository maintainers still need to review whether the proposed boundaries improve ownership rather than merely increasing file count.

See the [recipe quality standard](../../docs/quality/recipe-quality-standard.md) and [verification model](../../docs/guide/verification.md) for project-wide publication and evidence rules.
