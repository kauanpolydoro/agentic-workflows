# Build a bounded bug reproduction

Use this recipe to convert a behavior report into a sanitized, repository-bound reproduction record and a behavior-specific failing test before anyone changes product behavior.
It is intended for maintainers, support engineers, and contributors, with an approximate duration of 45 minutes when the affected environment is available.

## Primary use cases

- Confirm a user-visible defect on a named release or commit.
- Reduce a report with excess setup or data to the smallest safe trigger.
- Capture an intermittent symptom with a measured recurrence rate and reusable test boundary.

## When not to use

- Expected behavior has no applicable contract or authorized product decision.
- The affected revision or required environment cannot be reconstructed.
- Reproduction requires production credentials, customer data, destructive state, or unapproved billed services.
- A reliable failing test already exists and the actual task is root-cause diagnosis or implementation.

## Required evidence

- An attributable expected-behavior source and the exact observed result.
- Immutable revision, runtime, operating system, dependency lock, flags, and persistent-service versions.
- A sanitized trigger, setup command, clean-state reset, and exact invocation steps.
- Per-attempt results through the closest authorized user-facing boundary.

## Produced artifacts

- A repository-bound minimal reproduction record that names its checkout, locked dependencies, environment, and reset instructions.
- A failing regression test at a named path with evidence that the intended assertion fails on the affected revision.
- A repeatability, boundary, safety, limitation, residual-uncertainty, and traceability record.

## Primary risks

- Encoding disputed behavior as a permanent test contract.
- Retaining sensitive data or contacting production systems during reproduction.
- Calling a setup or fixture failure a product regression.
- Introducing part of the fix while trying to capture the baseline.

## How to use this recipe

1. Use [workflow.md](workflow.md) to confirm the behavior source, immutable environment, and safety preconditions.
2. Sanitize and minimize one field or setup step at a time while retesting from clean state.
3. Run a predeclared attempt sample and choose the closest controllable test boundary.
4. Add the failing test without changing product code and use [checklist.md](checklist.md) to verify that it reaches the intended behavior assertion.
5. Compare the record with the [synthetic input](examples/input.md) and [complete expected output](examples/expected-output.md).
6. Hand the retained reproduction to a separate diagnostic or fix workflow.

## Files

- [recipe.yml](recipe.yml) declares catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- [workflow.md](workflow.md) is the canonical reproduction procedure with minimization, decisions, approvals, and recovery.
- [checklist.md](checklist.md) controls behavior-contract, fixture, repeatability, test-boundary, and delivery omissions.
- [output.schema.json](output.schema.json) defines the machine-readable contract for the delivered artifact set.
- [examples/input.md](examples/input.md) contains a complete synthetic HTTP defect evidence package.
- [examples/expected-output.md](examples/expected-output.md) is a full repository-bound reproduction record derived only from that package.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

This workflow captures reproducibility and a failing assertion, not causal diagnosis or remediation.
The record does not embed an application repository or dependency archive, so execution requires access to the named source revision and its locked dependencies.
The synthetic example stops at an in-memory HTTP boundary and does not establish browser, reverse-proxy, or deployed-service behavior.
Every real execution must replace the synthetic revision, environment, fixture, command results, and approvals.

See the repository [recipe quality standard](../../docs/quality/recipe-quality-standard.md) and [adapter source record](../../docs/research/adapter-sources.md).
