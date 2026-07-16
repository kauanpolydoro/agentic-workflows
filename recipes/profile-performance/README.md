# Measure and assess a performance change

Use this recipe to turn a stable workload and profiler evidence into a comparable before-and-after decision without overstating production impact.
It is intended for performance-sensitive maintainers and service owners, with an approximate duration of two hours once the workload and isolated runner are available.

## Primary use cases

- Measure whether a focused candidate meets a numeric latency, throughput, CPU, allocation, or memory objective.
- Diagnose a regression between immutable revisions under one controlled workload.
- Review a memory, cost, or complexity tradeoff against a measured speed change.
- Test whether a profiler-observed hot path causally affects the primary metric.
- Produce an evidence-gap handoff when a supplied historical comparison lacks raw stability samples, an attributable profile artifact, or another required decision input.

## When not to use

- The request demands a final recommendation while the workload, correctness oracle, or measurement environment cannot be stabilized; an evidence-gap handoff remains valid when the missing state can be inventoried.
- Success and noise thresholds would be chosen only after results are visible.
- The request demands production capacity or user-impact conclusions from a synthetic microbenchmark.
- Production load is necessary but lacks operations-owner approval and abort controls.

## Required evidence

- Immutable baseline and candidate revisions or exact patch, named code scope, fixture identity, and workload size.
- Pinned environment, command, warm-up, sample count, retention rule, raw samples, units, and statistic method.
- Predeclared success, noise, correctness, and resource thresholds.
- A correctness oracle that runs unchanged against both revisions.
- A profile tied to the baseline workload and sufficient symbols to identify the measured path.

When one of these records is unavailable, supply an explicit missing-evidence inventory instead.
The only valid output in that state is the blocked handoff defined in `workflow.md`, not an accept, reject, or merge recommendation.

## Produced artifacts

- A final performance assessment when all required evidence is retained and recalculable.
- Otherwise, an evidence-gap handoff that identifies the retained observations, missing artifacts, prohibited decisions, owner roles, and exact recovery criteria.

## Primary risks

- Benchmark noise, protocol drift, or cherry-picked samples creating a false improvement.
- A faster candidate changing output or public behavior.
- Hidden memory, CPU, allocation, infrastructure-cost, or operational regressions.
- Synthetic results being misrepresented as production capacity or user impact.

## How to use this recipe

1. Define one performance question and verify every precondition in [workflow.md](workflow.md).
2. Freeze thresholds and protocol before collecting candidate measurements.
3. Establish a stable, correct baseline and profile it separately from timing when necessary.
4. Change one measured bottleneck, rerun correctness, and collect a comparable candidate sample.
5. Use [checklist.md](checklist.md) to verify sample integrity, calculations, safety, and approvals.
6. Compare incomplete historical evidence with the [synthetic input](examples/input.md) and its [contracted evidence-gap handoff](examples/expected-output.md).

## Files

- [recipe.yml](recipe.yml) declares catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- [workflow.md](workflow.md) is the canonical baseline, profiling, experiment, comparison, and decision procedure.
- [checklist.md](checklist.md) controls protocol drift, sample retention, correctness, resource limits, and claims.
- [output.schema.json](output.schema.json) defines the machine-readable contract for the delivered artifact set.
- [examples/input.md](examples/input.md) contains a synthetic package whose primary timing samples are complete but whose stability batches and profiler record are explicitly incomplete.
- [examples/expected-output.md](examples/expected-output.md) is the complete blocked handoff for that incomplete package and does not claim a final performance decision.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

The workflow can establish results only for the retained workload and protocol.
Production capacity, cost, and user experience require representative production evidence and separate operational approval.
The synthetic example deliberately omits the raw stability samples and complete profiler artifact to demonstrate the failure-handoff branch.
A final assessment must retain the profiler artifact and every raw benchmark file required by its decision rules.

See the repository [recipe quality standard](../../docs/quality/recipe-quality-standard.md) and [adapter source record](../../docs/research/adapter-sources.md).
