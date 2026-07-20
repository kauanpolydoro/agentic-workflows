# Synthetic report-rendering performance evidence package

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
