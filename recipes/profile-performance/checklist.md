# Measure and assess a performance change checklist

For a final assessment, every applicable item must pass.
If a decision-critical item cannot pass because its retained evidence is unavailable, use the blocked-handoff checks below and do not issue a final recommendation.

## Question and protocol

- [ ] One workload, primary metric, numeric objective, and user or system impact are recorded.
- [ ] Baseline revision, candidate revision or patch, code scope, and fixture checksum are immutable.
- [ ] Runtime, dependency lock, runner class, operating system, power or scaling state, and background load are recorded.
- [ ] Command, warm-up count, measured sample count, retention rule, units, and statistic formula were fixed before candidate results.
- [ ] Noise, success, correctness, and resource thresholds have owners and numeric rules.

## Baseline and profiler evidence

- [ ] The baseline correctness oracle passes before timing begins.
- [ ] Every predeclared raw baseline sample is retained, including slow values.
- [ ] Independent baseline batches meet the declared noise rule.
- [ ] The profile is tied to the baseline revision, workload, and environment.
- [ ] Profiling overhead is separated from timing or quantified.
- [ ] Profile symbols and paths are detailed enough to support the stated observation.
- [ ] Sensitive request data, credentials, and customer identifiers are absent from the profile.

## Candidate experiment

- [ ] The hypothesis links one measured cost to one predicted metric and resource outcome.
- [ ] The candidate changes one hypothesized bottleneck and has a recorded rollback.
- [ ] The correctness oracle matches baseline before candidate timing is accepted.
- [ ] Fixture, environment, command, warm-up, sample count, retention, and statistics match baseline.
- [ ] Every candidate sample is retained without result-driven exclusion.
- [ ] No profiler is active during timing unless the same measured overhead is part of both protocols.

## Decision and approval

- [ ] Absolute and percentage differences have been independently recalculated.
- [ ] The primary result is compared with both success and noise thresholds.
- [ ] Memory, CPU, allocation, I/O, and cost limits are evaluated or explicitly not applicable.
- [ ] Correctness failure rejects the candidate regardless of speed.
- [ ] A memory or infrastructure-cost tradeoff has service-owner approval before merge.
- [ ] Production load has operations-owner approval, monitoring, and abort thresholds before execution.
- [ ] Conclusions are limited to the measured workload unless representative production evidence exists.

## Delivery

- [ ] Facts, hypothesis, experiment, results, causal inference, recommendation, and production extrapolation are separate.
- [ ] Executed and proposed commands have distinct status.
- [ ] Raw samples, revisions, paths, calculations, approvals, and limitations cite evidence.
- [ ] The artifact identifies itself as a final assessment or a blocked evidence-gap handoff.
- [ ] A final assessment satisfies every final-assessment completion criterion.

## Blocked evidence-gap handoff

- [ ] Every unavailable raw sample, profiler artifact, digest, path, or approval is named without reconstruction or inference.
- [ ] Every decision prevented by each missing item is explicit.
- [ ] Each recovery action has an owner role and objectively reviewable exit criterion.
- [ ] Provisional calculations are labeled as observations and no accept, reject, merge, or tradeoff recommendation is issued.
