# Add behavior-focused regression tests

Use this recipe to add tests that protect attributable behavior and prove their value through targeted mutation checks.
It is intended for maintainers and contributors working in an established test framework, with an approximate duration of one hour for a bounded behavior set.

## Primary use cases

- Protect a documented boundary, error, state transition, or fixed defect that lacks a focused regression test.
- Replace line-coverage-driven test work with a risk-to-behavior test matrix.
- Add deterministic coverage for time, randomness, storage, or collaborator orchestration through existing public seams.

## When not to use

- Correct behavior remains unknown or disputed.
- The actual task is to reproduce or diagnose an uncaptured defect.
- The environment cannot isolate mutable state or external side effects.
- The only available assertion observes private implementation details rather than a stable outcome.

## Required evidence

- An attributable behavior contract with exact inputs, outputs, boundaries, invariants, and errors.
- Named source and test paths, public test seam, framework, and controllable dependencies.
- Focused and required project commands with baseline revision, environment, outputs, and exit codes.
- Ranked regression risks and an inventory of existing cases that could already detect them.

## Produced artifacts

- A risk-to-test traceability matrix.
- Implemented test changes at named paths with relevant excerpts.
- Focused, project, and targeted mutation-validation results.
- A record of fixture isolation, approvals, assumptions, exclusions, and residual risks.

## Primary risks

- Freezing an unsupported assumption into the behavior contract.
- Creating a test that passes while the target behavior is broken.
- Coupling assertions to private calls and blocking safe refactoring.
- Introducing flaky time, random, network, or shared-state dependencies.

## How to use this recipe

1. Confirm behavior sources, baseline, and isolation preconditions in [workflow.md](workflow.md).
2. Rank distinct failure risks before selecting test levels or writing cases.
3. Implement one deterministic behavior case at a time at the closest stable public seam.
4. Challenge each new case with a targeted temporary mutation and restore the implementation.
5. Use [checklist.md](checklist.md) to control fixture, mutation, suite, and delivery omissions.
6. Compare the result with the [synthetic input](examples/input.md) and [complete test delivery](examples/expected-output.md).

## Files

- [recipe.yml](recipe.yml) declares catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- [workflow.md](workflow.md) is the canonical risk-based implementation and validation procedure.
- [checklist.md](checklist.md) controls contract, seam, fixture, mutation, and suite evidence.
- [output.schema.json](output.schema.json) defines the machine-readable contract for the delivered artifact set.
- [examples/input.md](examples/input.md) contains a complete synthetic rate-limiter evidence package and executed validation records.
- [examples/expected-output.md](examples/expected-output.md) is a finished test delivery derived only from that evidence.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

Targeted mutation checks prove sensitivity to named plausible regressions, not to every possible defect.
The synthetic example covers a pure in-memory clock seam and does not establish concurrency, persistence, or distributed-system behavior.
Real executions must follow repository-specific conventions and replace all synthetic commands, results, revisions, and approvals.

See the repository [recipe quality standard](../../docs/quality/recipe-quality-standard.md) and [adapter source record](../../docs/research/adapter-sources.md).
