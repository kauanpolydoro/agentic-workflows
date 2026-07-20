# Performance evidence-gap handoff: report lookup-map candidate

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
