---
title: "Measure and assess a performance change"
description: "Produce a reproducible performance assessment when evidence is complete or an explicit blocked handoff when required measurement or profile records are missing."
---

# Measure and assess a performance change

## Objective

Transform a controlled workload, raw measurements, and profiler evidence into a reproducible baseline, a bottleneck hypothesis, and a comparable candidate recommendation when the required record is complete.
When a supplied record is incomplete and cannot be recaptured within the authorized scope, produce an explicit evidence-gap handoff without a final candidate recommendation.
The primary quality constraint is that performance claims remain bounded to the measured protocol and never override correctness or an approved resource limit.

## When to use

- A reproducible workload misses a numeric latency, throughput, CPU, allocation, or memory objective.
- A performance regression has immutable before-and-after revisions and a comparable workload.
- A focused optimization needs quantitative evidence and a resource-tradeoff decision before merge.
- A profiler observation must be tested by changing one suspected bottleneck and remeasuring under the same protocol.

## When not to use

- No controlled or representative workload can be defined for the behavior under discussion.
- A final recommendation is demanded while a stable correctness oracle is absent, so a faster but semantically different result cannot be rejected; use only the evidence-gap handoff when the absence can be inventoried.
- The environment is too variable to meet a predeclared noise threshold and cannot be isolated.
- The request is for production capacity, cost, or user-impact claims based only on a synthetic microbenchmark.
- Production load is required but the operations owner has not approved the workload, window, and abort controls.

## Required inputs

- **Immutable baseline and benchmark scope:** Record the full baseline revision, benchmark target, source paths allowed to change, fixture identity and checksum, workload size, and excluded production paths.
  This prevents source or workload drift.
  Validate that the revision resolves, the fixture checksum matches, and the benchmark command reads only the declared scope.
- **Controlled measurement protocol:** Specify hardware or runner class, operating system, runtime, dependency lock, power or autoscaling state, command, warm-up count, measured sample count, sample-retention rule, metric units, and statistic calculation.
  This makes repetition possible.
  Validate the protocol with a dry run before collecting baseline samples.
- **Numeric decision thresholds:** Define the success threshold, noise threshold, resource ceilings, and a not-applicable disposition for any omitted resource.
  This prevents thresholds from being chosen after results are visible.
  Validate that each rule identifies its owner and comparison formula.
- **Correctness oracle and baseline:** Provide deterministic output hash, snapshot, behavior tests, or contract checks with commands and results on the baseline revision.
  This prevents speed from masking a semantic regression.
  Validate that the same oracle can run unchanged against the candidate.
- **Evidence-availability inventory:** Identify every retained raw timing batch, profiler capture, digest, path, and approval, plus every required item that is unavailable.
  This makes a blocked handoff reviewable without treating a summary as the missing source artifact.
  Validate the inventory before calculating or recommending a candidate.

## Optional inputs

- A sanitized production profile tied to an identified route and workload can improve representativeness without authorizing a production-impact claim by itself.
- A known-good immutable revision can narrow when a regression entered and guide the profile target.
- Allocation, garbage-collection, I/O, or database traces can reveal a dominant resource not visible in CPU samples.
- Prior benchmark batches can support the noise estimate when they use the same protocol.

## Preconditions

- The baseline revision, fixture checksum, command, and environment are immutable or reproducibly pinned.
- Independent baseline batches remain within the declared noise threshold.
- The correctness oracle passes on the baseline and can run unchanged on the candidate.
- The success, noise, resource, and sample-retention rules were recorded before candidate measurements.
- The runner is isolated from unauthorized production load and unrelated saturation.

## Workflow

### 1. Freeze the performance question

State one workload, one primary metric, one numeric objective, and the user or system impact the metric represents.
Record secondary resources and explicit exclusions.
Advance when success and non-goals can be decided numerically.
Stop if the request mixes incomparable workloads or undefined impact.

### 2. Lock the measurement protocol

Record revision, fixture checksum, environment, command, warm-up, sample count, sample retention, statistic formula, and correctness command before viewing candidate results.
Run one untimed dry execution to verify setup and cleanup.
Advance when another reviewer can reproduce the protocol exactly.
Stop if an uncontrolled runner feature or workload input remains unknown.

### 3. Establish baseline stability

Run the correctness oracle, collect every predeclared raw sample, and calculate the primary and secondary statistics by the stated method.
Repeat independent batches when required by the noise rule.
Advance when the baseline variation is at or below the threshold.
Stop and stabilize the environment if the threshold is exceeded.

### 4. Profile the baseline

Choose CPU, allocation, I/O, lock, or query profiling according to the primary metric and collect it on the baseline workload.
Keep profiling separate from timing when its overhead could alter results.
Produce a ranked cost table with symbols, paths, sample shares, and profile artifact identity.
Advance when one expensive path is both measurable and within the authorized code scope.
Stop if profiling data is too coarse or sanitized beyond interpretation.

### 5. Define a falsifiable hypothesis

Link one observed cost to one proposed mechanism and predict the metric, resource, and correctness outcomes before implementation.
Define a candidate rollback and the result that would reject the hypothesis.
Advance when the prediction can be tested by one focused change.
Stop if the proposal combines multiple optimizations that cannot be attributed separately.

### 6. Implement one controlled experiment

Apply the smallest scoped candidate and record its immutable revision or exact patch.
Run the correctness oracle before performance sampling.
Advance when correctness matches the baseline and no undeclared source or fixture changed.
Stop and revert immediately when output or behavior differs.

### 7. Measure the candidate comparably

Run the same command, fixture, warm-up, sample count, sample-retention rule, environment, and statistic calculation without an active profiler.
Retain all raw samples and measure the declared secondary resources.
Advance when comparability checks pass.
Stop if the protocol or runner changed and recapture both baseline and candidate under one protocol.

### 8. Classify results and tradeoffs

Calculate absolute and percentage differences, compare them with success and noise thresholds, and evaluate correctness and resource ceilings.
Separate measured facts from the inference that the candidate caused them and from any production extrapolation.
Advance when the candidate is classified as accept, reject, or inconclusive by predeclared rules.
Stop before merge when a tradeoff requires owner approval.

### 9. Deliver the assessment

Report revisions, protocol, raw-sample location, baseline, profile observation, hypothesis, candidate change, results, calculation, tradeoffs, recommendation, approval state, limitations, and evidence map.
State which commands actually ran and which future validation remains proposed.
The final assessment is complete when every comparison can be recalculated from retained evidence.
If required raw or attributable evidence is unavailable and cannot be recaptured within scope, deliver the F6 evidence-gap handoff with no accept, reject, merge, or tradeoff recommendation.

## Decision points

- If independent baseline variation exceeds the declared noise threshold, stop candidate comparison and stabilize or redesign the protocol.
- If profiler overhead materially changes the measured operation, collect profiles separately and use the unprofiled protocol for timing.
- If the candidate correctness oracle differs from baseline, reject and revert the candidate regardless of its speed.
- If the measured change is no larger than the noise threshold, classify the performance result as inconclusive rather than improved.
- If the primary improvement misses the success threshold, reject or redesign the candidate even when the direction is favorable.
- If memory or infrastructure cost exceeds its ceiling, pause for service-owner approval or redesign before recommendation.
- If the workload is synthetic or otherwise unrepresentative of production, restrict conclusions to that workload and prohibit production impact claims.

## Safety guardrails

- Never perform **cherry-picking fastest benchmark runs** or discarding a sample after observing its value.
- Never perform **removing or weakening correctness checks** to preserve an apparently faster candidate.
- Never perform **claiming production impact from an unrepresentative benchmark** or extrapolating unsupported capacity.
- Sanitize profiles and fixtures so they contain no credential, request body, customer identifier, or proprietary production payload.
- Run load only in an authorized isolated environment and enforce predeclared CPU, memory, error-rate, duration, and cost abort thresholds.
- Change one hypothesized bottleneck per experiment and preserve a reversible checkpoint.
- Stop immediately on correctness divergence, unauthorized saturation, fixture drift, or environment drift.

## Human approval gates

- Before **accepting a memory infrastructure-cost or latency tradeoff**, the service owner approves the complete comparison table, resource ceilings, correctness result, operational impact, and rollback.
- Before **changing user-visible behavior for performance**, the product owner approves the old and proposed contract, affected audience, compatibility impact, and tests.
- Before **running load against a production environment**, the operations owner approves the workload, schedule, monitoring, abort thresholds, affected services, communications, and rollback.

## Expected output

Produce one Markdown artifact in one of two explicit states: a final performance assessment or a blocked evidence-gap handoff.
Both states contain:

1. Status, immutable baseline and candidate revisions, code scope, and decision.
2. Reproducible baseline measurement report with protocol, raw samples, statistics, stability, and correctness.
3. Profiler-backed bottleneck hypothesis and experiment record with observation, prediction, candidate change, and rejection rule.
4. Comparable candidate measurement, tradeoff, and recommendation report with raw statistics and calculations.
5. Correctness, resource-limit, and approval disposition.
6. Facts, inferences, production extrapolation limits, residual uncertainty, rollback, and next action.
7. Evidence traceability for every revision, command, measurement, calculation, and decision.

The final assessment must retain or link every raw sample used and identify the statistic method.
It may accept, reject, or classify a candidate as inconclusive.
The blocked handoff must identify every unavailable artifact, the material conclusions it prevents, the owner role for recovery, and an objective exit criterion.
It may recalculate supplied measurements as provisional observations, but it must not issue a final candidate or merge recommendation.

## Completion criteria

- In a final assessment, a reviewer can reproduce the baseline and candidate protocol from the recorded revisions, fixture, environment, commands, warm-up, sample count, and calculation method.
- In a final assessment, every retained sample from the predeclared run set is represented, baseline stability is recalculated, and candidate correctness matches the baseline oracle before performance is classified.
- In a final assessment, primary and secondary differences are classified against the predeclared success, noise, and resource rules.
- In a blocked handoff, every failed completion item identifies the missing artifact, prevented decision, owner role, and measurable recovery criterion.
- Both states separate profile observation, causal inference, recommendation limits, and production limitations.
- Required owner approval is recorded, explicitly pending, or listed as a later gate after evidence recovery.

## Failure modes

- **F1:** Baseline batches exceed the declared noise threshold.
- **F2:** Profiling overhead or insufficient symbols obscure the dominant cost path.
- **F3:** Candidate output or behavior differs from the correctness baseline.
- **F4:** Baseline and candidate were measured with different fixtures, environments, commands, or sampling rules.
- **F5:** The candidate exceeds a declared resource ceiling or requires an unapproved tradeoff.
- **F6:** Required raw stability samples, complete attributable profiler evidence, or another decision-critical retained artifact is unavailable.

## Recovery procedure

- **R1:** Isolate the runner, disable uncontrolled scaling or background work, identify the source of variation, and restart baseline collection with the same predeclared rule.
- **R2:** Collect sampling profiles separately from timing, improve symbol resolution, quantify overhead, and resume hypothesis formation only when the path is attributable.
- **R3:** Revert the candidate, locate the semantic difference with the correctness oracle, and restart candidate implementation only after baseline behavior is restored.
- **R4:** Discard the incomparable comparison, pin one protocol, and recapture both revisions before calculating any difference.
- **R5:** Keep the candidate unapproved, redesign within the ceiling or obtain service-owner approval with the full tradeoff and rollback evidence.
- **R6:** Do not reconstruct or infer the missing artifact.
  Deliver the blocked evidence-gap handoff, assign recovery to the evidence owner, and resume final assessment only after the exact missing record is retained and independently reviewable.

## Example

The [synthetic input](#complete-example-input) supplies immutable revisions, complete primary timing samples, a stable protocol, a profile summary, a one-change experiment, correctness results, and explicit missing raw stability and profiler artifacts.
The [complete expected output](#complete-expected-output) demonstrates the F6 evidence-gap handoff, recalculates only supplied observations, and withholds a final recommendation.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/profile-performance/1.0.0",
  "title": "Performance profiling output contract",
  "description": "Validates either a final recalculable performance assessment or an explicit evidence-gap handoff with protocol, retained observations, profile evidence state, controlled experiment, decision limits, recovery actions, uncertainty, and traceability.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "performance-assessment.md",
        "audience": "Repository maintainers and service owners",
        "requires_title": true,
        "required_headings": [
          "Status and decision",
          "Reproduction protocol",
          "Baseline facts",
          "Profile observation and hypothesis",
          "Experiment results",
          "Causal assessment",
          "Correctness, tradeoff, and approval",
          "Recommendation and next action",
          "Residual uncertainty",
          "Traceability"
        ],
        "required_literals": [
          "| Metric | Baseline | Candidate | Difference | Decision rule | Classification |",
          "| Material claim or decision | Evidence |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This example is synthetic and self-contained.
No external benchmark service, repository, or production dataset is required to produce the expected output.

## Objective

Determine whether precomputing a lookup map reduces report-rendering median runtime by at least 20 percent without changing output or increasing peak RSS by more than 8 MB.

## Scope and constraints

- Only `src/report.ts` may differ between baseline and candidate.
- The measured workload is a deterministic 10,000-row JSON fixture.
- A difference of 5 percent or less is classified as measurement noise.
- No sample may be discarded after its value is observed.
- No production traffic, production data, deployment, infrastructure scaling, or concurrency claim is authorized.

## Evidence inventory

### E1 - Immutable revisions, fixture, and code scope

- Baseline revision: `aa21000000000000000000000000000000000000`.
- Candidate revision: `bb22000000000000000000000000000000000000`.
- Candidate diff: in `src/report.ts`, build one `Map` from the lookup collection before row rendering and replace repeated `rows.find` lookups with `map.get`.
- No other source, benchmark, fixture, or dependency file differs.
- Fixture: `fixtures/rows-10000.json`, exactly 10,000 rows.
- Fixture SHA-256: `9f2d6f54d2a5e918d3f92f6466df920cfaa4a361a7df8c4c9f2be04e3568a1c7`.
- Establishes immutable comparison boundaries and the one-change experiment.

### E2 - Controlled protocol and statistic method

- Environment: dedicated Linux x64 CI runner, Node.js 22.14.0, pnpm 10.1.0, frozen committed lockfile, and no autoscaling during a batch.
- Command: `node benchmark/report.mjs fixtures/rows-10000.json`.
- Execute five warm-up runs followed by twenty measured runs.
- Restart the process for each run.
- No CPU profiler is active during timing.
- Retain all twenty measured samples.
- Median is the average of sorted positions 10 and 11.
- p95 is the nearest-rank value at sorted position 19.
- Establishes the reproducible measurement and calculation protocol.

### E3 - Predeclared decision rules

- Success requires a median runtime reduction of at least 20 percent.
- An absolute percentage change of 5 percent or less is measurement noise.
- Peak RSS may increase by no more than 8 MB.
- Rendered output SHA-256 and the report behavior tests must match baseline.
- The service owner must approve any retained memory-for-latency tradeoff before merge.
- Establishes decision thresholds and approval requirement before candidate review.

### E4 - Baseline raw measurements and correctness

- Revision: `aa21000000000000000000000000000000000000`.
- Raw milliseconds, sorted: `170, 174, 176, 177, 179, 180, 180, 181, 181, 182, 182, 183, 184, 185, 186, 188, 190, 192, 196, 198`.
- Calculated median: 182 ms.
- Calculated p95: 196 ms.
- Peak RSS: 74 MB.
- Rendered output SHA-256: `72f4f1c933b3c70e755c93d11f5a496f78e1d3d3362e638f6f3a5f319e9af99b`.
- `pnpm vitest run test/report.test.ts` exited `0` with 12 tests.
- Establishes the baseline samples and correctness oracle.

### E5 - Baseline stability batches

- Artifact identity: `baseline-stability-median-summary-v1`.
- Four independent batches using E2 produced medians of 180, 183, 181, and 182 ms.
- The largest deviation from the reported 182 ms median is 2 ms, or 1.1 percent after rounding to one decimal place.
- The supplied summary states that no batch or sample was excluded, but it does not contain the individual raw samples for those four batches.
- Establishes the reported batch medians and their variation, but not independently reviewable raw-sample retention for the stability batches.

### E6 - CPU profile observation and hypothesis

- Artifact identity: `cpu-profile-aa210-report-10000-summary-v1`.
- A sampling CPU profile was collected separately from timing on the baseline revision with the E1 fixture.
- `Array.find` calls from `renderRows` at `src/report.ts:88` account for 61 percent of sampled CPU time.
- The next ranked symbol accounts for 9 percent.
- This evidence item is the complete retained summary available for the example.
- No full profiler capture, digest, complete ranked symbol table, or path for the next-ranked symbol is supplied.
- Hypothesis: building one lookup map before rendering will remove repeated linear scans and reduce median runtime by at least 20 percent.
- Rejection rule: reject the candidate if correctness differs, median reduction is below 20 percent, or peak RSS rises by more than 8 MB.
- Establishes a profile-informed hypothesis and predeclared rejection rule, but not a complete attributable profile artifact.

### E7 - Candidate raw measurements and correctness

- Revision: `bb22000000000000000000000000000000000000`.
- Raw milliseconds, sorted: `101, 103, 104, 105, 106, 107, 108, 108, 109, 109, 109, 110, 111, 112, 113, 114, 115, 116, 118, 120`.
- Calculated median: 109 ms.
- Calculated p95: 118 ms.
- Peak RSS: 77 MB.
- Rendered output SHA-256: `72f4f1c933b3c70e755c93d11f5a496f78e1d3d3362e638f6f3a5f319e9af99b`.
- `pnpm vitest run test/report.test.ts` exited `0` with 12 tests.
- The same runner, fixture, command, warm-up, sample count, retention rule, and statistic method from E2 were used.
- Establishes comparable candidate measurements and correctness.

### E8 - Measurement integrity and approval state

- All planned primary baseline and candidate timing samples are included in E4 and E7.
- The raw samples behind the separate E5 stability summary are not supplied.
- No profiler ran during either timing batch.
- The service owner has not yet approved the 3 MB peak-RSS increase.
- The repository maintainer may review the candidate only after the service-owner tradeoff disposition is attached.
- Rollback is reverting candidate revision `bb220...` to baseline `aa210...` for `src/report.ts`.
- Establishes sample integrity, pending approval, and rollback.

### E9 - Representativeness limits

- The fixture is deterministic and synthetic.
- The dedicated runner does not model production contention, concurrency, traffic distribution, storage I/O, or autoscaling.
- No production profile, request trace, or deployment result is supplied.
- Establishes that conclusions must remain limited to the measured 10,000-row workload.

## Complete expected output

## Status and decision

Status: F6 blocked evidence-gap handoff.
The supplied primary timing and correctness observations meet their numeric rules for the synthetic 10,000-row workload, but no final performance, tradeoff, or merge recommendation is authorized because the raw stability samples and complete attributable profiler artifact are unavailable and service-owner approval is pending.

Baseline revision `aa21000000000000000000000000000000000000` and candidate revision `bb22000000000000000000000000000000000000` differ only in the lookup strategy in `src/report.ts` [E1].
Provisional observation: the supplied primary batches show a 40.1 percent median reduction and a 3 MB peak-RSS increase [E4, E7].
This handoff does not promote those observations to a final assessment.

## Reproduction protocol

Use the dedicated Linux x64 runner, Node.js 22.14.0, pnpm 10.1.0, frozen lockfile, and fixture `fixtures/rows-10000.json` with SHA-256 `9f2d6f54d2a5e918d3f92f6466df920cfaa4a361a7df8c4c9f2be04e3568a1c7` [E1, E2].
Run `node benchmark/report.mjs fixtures/rows-10000.json` five times for warm-up and twenty times for measurement, restarting the process each time and retaining every sample [E2].
Calculate median from sorted positions 10 and 11 and nearest-rank p95 from position 19 [E2].
Run the timing batches without an active profiler [E2, E8].

## Baseline facts

The baseline median is 182 ms, p95 is 196 ms, peak RSS is 74 MB, and the output SHA-256 is `72f4f1c933b3c70e755c93d11f5a496f78e1d3d3362e638f6f3a5f319e9af99b` [E4].
The report behavior suite exits `0` with 12 tests [E4].
Four independent baseline batches have reported medians from 180 to 183 ms, with maximum deviation 1.1 percent from 182 ms, below the 5 percent noise threshold [E3, E5].
The individual samples for those stability batches are not supplied, so their retention and calculations cannot be independently recomputed [E5].

## Profile observation and hypothesis

Observation: baseline `Array.find` calls from `renderRows` at `src/report.ts:88` account for 61 percent of sampled CPU time, while the next ranked symbol accounts for 9 percent [E6].
The retained artifact is summary `cpu-profile-aa210-report-10000-summary-v1`, not a full profiler capture with a digest and complete ranked symbol paths [E6].

Hypothesis: building one map before rendering removes repeated linear scans and will reduce median time by at least 20 percent.
The hypothesis must be rejected if output changes, the reduction is below 20 percent, or peak RSS increases by more than 8 MB [E3, E6].

The candidate implements only that map-based lookup change [E1].

## Experiment results

| Metric | Baseline | Candidate | Difference | Decision rule | Classification |
| --- | ---: | ---: | ---: | --- | --- |
| Median runtime | 182 ms | 109 ms | -73 ms, -40.1% | At least 20% reduction and more than 5% noise | Provisional observation meets numeric threshold; no final classification |
| p95 runtime | 196 ms | 118 ms | -78 ms, -39.8% | Report as secondary metric | Provisional favorable observation |
| Peak RSS | 74 MB | 77 MB | +3 MB | Increase no more than 8 MB | Provisional observation within ceiling; approval and final classification unavailable |
| Output SHA-256 | `72f4...f99b` | `72f4...f99b` | No change | Must match | Pass |
| Report behavior tests | 12 passing | 12 passing | No change | Must pass | Pass |

Sources: E3, E4, and E7.

The median calculation is `(182 - 109) / 182 x 100 = 40.1%` after rounding to one decimal place.
The p95 calculation is `(196 - 118) / 196 x 100 = 39.8%` after rounding to one decimal place.
All twenty primary samples for each revision remain in the evidence package [E4, E7, E8].
This statement does not include the unavailable raw samples behind the E5 stability summary [E5, E8].

## Causal assessment

Inference: the one-change candidate and supplied profile summary make removal of repeated linear scans a plausible cause of the measured reduction [E1, E6, E7].
The supplied observations are consistent with that hypothesis for this fixture, but the missing complete profile prevents a final profiler-backed causal assessment and no result can establish the same magnitude under production contention or other workload sizes [E6, E9].
No general production-performance claim is made.

## Correctness, tradeoff, and approval

The candidate output hash matches baseline and the same 12 behavior tests pass on both revisions [E4, E7].
The 3 MB peak-RSS increase is below the 8 MB ceiling, but the predeclared rule still requires service-owner approval before merge [E3, E8].
That approval is pending, so the candidate is not yet merge-approved [E8].

Rollback is to restore the baseline implementation of `src/report.ts` from `aa21000000000000000000000000000000000000` [E8].

## Recommendation and next action

No accept, reject, merge, or memory-tradeoff recommendation is issued.
Do not submit the candidate for service-owner tradeoff approval or merge review yet.
First retain the raw samples for all four E5 stability batches and a full profiler capture with immutable identity, digest, ranked symbols, and paths.
Recalculate the stability result from those retained samples and confirm that the complete profile still supports the same focused hypothesis.
Evidence owner: repository maintainer for the stability batches and complete profiler artifact.
Exit criterion: all four batches expose every raw sample, their medians independently recalculate within the 5 percent noise rule, and the retained profile has an immutable identity, digest, complete ranked symbol table, and source paths attributable to the E1 workload.
After those evidence gaps close, rerun the final-assessment workflow and only then decide whether the candidate may proceed to service-owner review.
If the completed evidence changes that classification or approval is denied, revert to the baseline and investigate a lower-memory alternative.

## Residual uncertainty

The synthetic fixture does not model production concurrency, contention, traffic distribution, storage I/O, or autoscaling [E9].
Only a 10,000-row workload was measured.
The evidence package retains only a CPU-profile summary and does not retain the full attributable profiler artifact [E6].
The stability batches retain medians rather than their raw samples [E5].

## Traceability

| Material claim or decision | Evidence |
| --- | --- |
| Immutable revisions, fixture, and one-file candidate | E1 |
| Comparable protocol and statistic method | E2 |
| Success, noise, correctness, resource, and approval rules | E3 |
| Baseline samples and correctness | E4 |
| Reported baseline-stability medians and missing raw samples | E5 |
| Profile summary, hypothesis, rejection rule, and missing full artifact | E6 |
| Candidate samples and correctness | E7 |
| Sample integrity, pending approval, and rollback | E8 |
| Production extrapolation limits | E9 |
