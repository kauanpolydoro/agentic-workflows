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

The [synthetic input](examples/input.md) supplies immutable revisions, complete primary timing samples, a stable protocol, a profile summary, a one-change experiment, correctness results, and explicit missing raw stability and profiler artifacts.
The [complete expected output](examples/expected-output.md) demonstrates the F6 evidence-gap handoff, recalculates only supplied observations, and withholds a final recommendation.
