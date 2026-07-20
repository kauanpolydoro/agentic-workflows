# Measure and assess a performance change

## Objective

Take a controlled workload, its raw measurements, and profiler evidence, and turn them into three things a reviewer can check: a reproducible baseline, a bottleneck hypothesis, and a comparably measured candidate recommendation.
That recommendation exists only when the required record is complete.
When a supplied record is incomplete and cannot be recaptured within the authorized scope, deliver an explicit evidence-gap handoff instead, without a final candidate recommendation.
One constraint outranks everything else: performance claims stay bounded to the measured protocol, and they never override correctness or an approved resource limit.

## When to use

- A reproducible workload misses a numeric latency, throughput, CPU, allocation, or memory objective.
- You are investigating a performance regression that has immutable before-and-after revisions and a comparable workload.
- A focused optimization needs quantitative evidence, and a resource-tradeoff decision, before it can merge.
- You want to test a profiler observation by changing one suspected bottleneck and remeasuring under the same protocol.

## When not to use

- No controlled or representative workload can be defined for the behavior under discussion.
- A final recommendation is demanded while a stable correctness oracle is absent, so a faster but semantically different result could not be rejected; if that absence can be inventoried, the evidence-gap handoff is the only allowed output.
- The environment is too variable to meet a predeclared noise threshold and cannot be isolated.
- The request asks for production capacity, cost, or user-impact claims based only on a synthetic microbenchmark.
- Production load is required, but the operations owner has not approved the workload, window, and abort controls.

## Required inputs

- **Immutable baseline and benchmark scope:** Record the full baseline revision, the benchmark target, the source paths allowed to change, the fixture identity and checksum, the workload size, and the excluded production paths.
  Pinning all of this keeps the source and the workload from drifting under you.
  Validate that the revision resolves, that the fixture checksum matches, and that the benchmark command reads only the declared scope.
- **Controlled measurement protocol:** Specify the hardware or runner class, operating system, runtime, dependency lock, power or autoscaling state, command, warm-up count, measured sample count, sample-retention rule, metric units, and statistic calculation for the environment.
  This is what makes repetition possible.
  Validate the protocol with a dry run before collecting baseline samples.
- **Numeric decision thresholds:** Define the success threshold, the noise threshold, the resource ceilings, and a not-applicable disposition for any resource you deliberately omit.
  Fixing these numbers up front keeps thresholds from being chosen after the results are visible.
  Validate that each rule names its owner and its comparison formula.
- **Correctness oracle and baseline result:** Provide a deterministic output hash, snapshot, behavior tests, or contract checks, together with the commands and their results on the baseline revision.
  This keeps speed from masking a semantic regression.
  Validate that the same oracle can run unchanged against the candidate.
- **Evidence-availability inventory:** Identify every retained raw timing batch, profiler capture, digest, path, and approval, plus every required measurement or profile artifact that is unavailable.
  A complete inventory makes a blocked handoff reviewable without treating a summary as the missing source artifact.
  Validate the inventory before calculating or recommending anything about the candidate.

## Optional inputs

- A sanitized production profile tied to an identified route and workload improves representativeness, but it does not by itself authorize a production-impact claim.
- An immutable known-good revision can narrow the range where a regression entered and guide where to point the profiler.
- Allocation, garbage-collection, I/O, or database traces can reveal a dominant resource that CPU samples never show.
- Prior benchmark batches can support the noise estimate, as long as they used the same protocol.

## Preconditions

- The baseline revision, fixture checksum, command, and environment are immutable or reproducibly pinned.
- Independent baseline batches stay within the declared noise threshold.
- The correctness oracle passes on the baseline and can run unchanged on the candidate.
- The success, noise, resource, and sample-retention rules were recorded before any candidate measurement.
- The runner is isolated from unauthorized production load and from unrelated saturation.

## Workflow

### 1. Freeze the performance question

State one workload, one primary metric, one numeric objective, and the user or system impact that metric stands for.
Record the secondary resources and the explicit exclusions.
Advance when success and non-goals can be decided numerically.
Stop if the request mixes incomparable workloads or leaves the impact undefined.

### 2. Lock the measurement protocol

Before you look at any candidate result, record the revision, fixture checksum, environment, command, warm-up, sample count, sample retention, statistic formula, and correctness command.
Run one untimed dry execution to verify setup and cleanup.
Advance when another reviewer could reproduce the protocol exactly.
Stop if any uncontrolled runner feature or workload input remains unknown.

### 3. Establish baseline stability

Run the correctness oracle, collect every predeclared raw sample, and calculate the primary and secondary statistics by the stated method.
Repeat independent batches when the noise rule requires them.
Advance when baseline variation sits at or below the threshold.
Stop and stabilize the environment if the threshold is exceeded.

### 4. Profile the baseline

Pick CPU, allocation, I/O, lock, or query profiling to match the primary metric, and collect it on the baseline workload.
Keep profiling separate from timing whenever its overhead could alter the results.
Produce a ranked cost table with symbols, paths, sample shares, and the identity of each profile artifact.
Advance when one expensive path is both measurable and inside the authorized code scope.
Stop if the profiling data is too coarse, or too heavily sanitized, to interpret.

### 5. Define a falsifiable hypothesis

Link one observed cost to one proposed mechanism, and predict the metric, resource, and correctness outcomes before you implement anything.
Define a rollback for the candidate and the result that would reject the hypothesis.
Advance when one focused change can test the prediction.
Stop if the proposal bundles multiple optimizations whose effects cannot be attributed separately.

### 6. Implement one controlled experiment

Apply the smallest scoped candidate and record its immutable revision or exact patch.
Run the correctness oracle before any performance sampling.
Advance when correctness matches the baseline and no undeclared source or fixture changed.
Stop and revert immediately when output or behavior differs.

### 7. Measure the candidate comparably

Run the same command, fixture, warm-up, sample count, sample-retention rule, environment, and statistic calculation, with no profiler active.
Retain all raw samples and measure the declared secondary resources.
Advance when the comparability checks pass.
Stop if the protocol or runner changed, and recapture both baseline and candidate under one protocol.

### 8. Classify results and tradeoffs

Calculate the absolute and percentage differences, compare them with the success and noise thresholds, and evaluate correctness and the resource ceilings.
Keep the measured facts separate from the inference that the candidate caused them, and from any extrapolation to production.
Advance when the predeclared rules classify the candidate as accept, reject, or inconclusive.
Stop before merge when a tradeoff requires owner approval.

### 9. Deliver the assessment

Report the revisions, protocol, raw-sample location, baseline, profile observation, hypothesis, candidate change, results, calculation, tradeoffs, recommendation, approval state, limitations, and evidence map.
State which commands actually ran and which future validation remains proposed.
The final assessment is complete when every comparison can be recalculated from retained evidence.
If required raw or attributable evidence is unavailable and cannot be recaptured within scope, deliver the F6 evidence-gap handoff instead, with no accept, reject, merge, or tradeoff recommendation.

## Decision points

- If independent baseline variation exceeds the declared noise threshold, stop the candidate comparison and stabilize or redesign the protocol.
- If profiler overhead materially changes the measured operation, collect profiles separately and time against the unprofiled protocol.
- If the candidate's correctness result differs from the baseline oracle, reject and revert the candidate no matter how fast it is.
- If the measured change is no larger than the noise threshold, classify the performance result as inconclusive rather than improved.
- If the primary improvement misses the success threshold, reject or redesign the candidate even when the direction is favorable.
- If memory or infrastructure cost exceeds its ceiling, pause for service-owner approval or redesign before making a recommendation.
- If the workload is synthetic or otherwise unrepresentative of production, restrict every conclusion to that workload and prohibit production-impact claims.

## Safety guardrails

- **Cherry-picking fastest benchmark runs** is forbidden, and so is discarding any sample after you have seen its value.
- **Removing or weakening correctness checks** to keep an apparently faster candidate alive is forbidden.
- **Claiming production impact from an unrepresentative benchmark**, or extrapolating capacity the evidence does not support, is forbidden.
- Sanitize profiles and fixtures so they carry no credential, request body, customer identifier, or proprietary production payload.
- Run load only in an authorized isolated environment, and enforce the predeclared CPU, memory, error-rate, duration, and cost abort thresholds.
- Change one hypothesized bottleneck per experiment and preserve a reversible checkpoint.
- Stop immediately on correctness divergence, unauthorized saturation, fixture drift, or environment drift.

## Human approval gates

- Before **accepting a memory infrastructure-cost or latency tradeoff**, the service owner approves the complete comparison table, the resource ceilings, the correctness result, the operational impact, and the rollback.
- Before **changing user-visible behavior for performance**, the product owner approves the old and proposed contract, the affected audience, the compatibility impact, and the tests.
- Before **running load against a production environment**, the operations owner approves the workload, schedule, monitoring, abort thresholds, affected services, communications, and rollback.

## Expected output

Produce one Markdown artifact in one of two explicit states: a final performance assessment or a blocked evidence-gap handoff.
Both states contain:

1. Status, the immutable baseline and candidate revisions, the code scope, and the decision.
2. A reproducible baseline measurement report covering protocol, raw samples, statistics, stability, and correctness.
3. A profiler-backed bottleneck hypothesis and experiment record with the observation, prediction, candidate change, and rejection rule.
4. A comparable candidate measurement, tradeoff, and recommendation report with the raw statistics and calculations.
5. The correctness, resource-limit, and approval disposition.
6. Facts, inferences, production extrapolation limits, residual uncertainty, rollback, and the next action.
7. Evidence traceability for every revision, command, measurement, calculation, and decision.

The final assessment must stay recalculable, so it retains or links every raw sample used and identifies the statistic method.
It may accept, reject, or classify a candidate as inconclusive.
The blocked handoff must inventory every missing or unavailable artifact, the material conclusions it prevents, the owner role responsible for recovery, and an objective exit criterion.
It may recalculate supplied measurements as provisional retained observations, but it must not issue a final candidate or merge recommendation.

## Completion criteria

- In a final assessment, a reviewer can reproduce the baseline and candidate protocol from the recorded revisions, fixture, environment, commands, warm-up, sample count, and calculation method.
- In a final assessment, every retained sample from the predeclared run set is represented, baseline stability is recalculated, and candidate correctness matches the baseline oracle before performance is classified.
- In a final assessment, the primary and secondary differences are classified against the predeclared success, noise, and resource rules.
- In a blocked handoff, every failed completion item names the missing artifact, the decision it prevents, the owner role, and a measurable recovery criterion.
- Both states keep profile observation, causal inference, recommendation limits, and production limitations separate.
- Every required owner approval is recorded, explicitly pending, or listed as a later gate after evidence recovery.

## Failure modes

- **F1:** Baseline batches vary beyond the declared noise threshold.
- **F2:** Profiling overhead or insufficient symbols obscure the dominant cost path.
- **F3:** The candidate's output or behavior differs from the correctness baseline.
- **F4:** Baseline and candidate were measured with different fixtures, environments, commands, or sampling rules.
- **F5:** The candidate exceeds a declared resource ceiling or requires a tradeoff nobody has approved.
- **F6:** Required raw stability samples, complete attributable profiler evidence, or another decision-critical retained artifact is unavailable.

## Recovery procedure

- **R1:** Isolate the runner, disable uncontrolled scaling or background work, find the source of the variation, and restart baseline collection under the same predeclared rule.
- **R2:** Collect sampling profiles separately from timing, improve symbol resolution, quantify the overhead, and resume hypothesis formation only once the path is attributable.
- **R3:** Revert the candidate, use the correctness oracle to locate the semantic difference, and restart the candidate implementation only after baseline behavior is restored.
- **R4:** Discard the incomparable comparison, pin one protocol, and recapture both revisions before calculating any difference.
- **R5:** Keep the candidate unapproved, and either redesign within the ceiling or obtain service-owner approval with the full tradeoff and rollback evidence.
- **R6:** Do not reconstruct or infer the missing artifact.
  Deliver the blocked evidence-gap handoff, assign recovery to the evidence owner, and resume the final assessment only after the exact missing record is retained and independently reviewable.

## Example

The [synthetic input](examples/input.md) supplies immutable revisions, complete primary timing samples, a stable protocol, a profile summary, a one-change experiment, correctness results, and an explicit list of missing raw stability and profiler artifacts.
The [complete expected output](examples/expected-output.md) demonstrates the F6 evidence-gap handoff: it recalculates only the supplied observations and withholds a final recommendation.
