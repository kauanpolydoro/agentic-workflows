# Database migration review

## Verdict

Do not approve the single production statement yet.
The statement requires an `ACCESS EXCLUSIVE` lock but contains no `lock_timeout`, while the approved blocking threshold is 2 seconds [E3, E4, E8].
The 180 GB table receives 2,000 writes per second, and neither matching-scale rehearsal nor restore has been tested [E1, E4, E6, E9].
The constant default is metadata-only under the supplied PostgreSQL 15.4 behavior record, so this report does not claim a table rewrite [E8].
The staged sequence below is a blocked design outline, not an immutable candidate or approval package, because its complete SQL, digest, query plan, and per-statement engine analysis do not exist in the supplied evidence [E9].

## Risk register

| Severity | Confidence | Finding | Evidence | Impact | Recommendation | Verification | Disposition |
|---|---|---|---|---|---|---|---|
| High | High for lock requirement; Low for duration | The proposed statement requires `ACCESS EXCLUSIVE`, has neither a bounded lock wait nor a statement-duration bound, and has not been rehearsed at representative scale. | E1, E3, E4, E7, E8, E9 | Observation: the submitted SQL leaves lock acquisition and total statement duration unbounded by session controls. Inference: on a table receiving 2,000 writes per second, an over-threshold lock can delay writes; no duration is predicted without rehearsal. | Replace the one-step proposal with the staged pattern, set the proposed session-local 1.5-second lock timeout and 5-minute statement timeout before each rehearsal statement, and rehearse every schema phase on representative PostgreSQL 15.4 data. | Retain both timeout settings, lock-wait, DDL duration, write-latency, error-rate, CPU, and replica-lag results for the exact candidate SQL artifact identifier. | Blocking production approval |
| High | High | Recovery is untested, and the only supplied snapshot is 60 minutes older than the schema snapshot, exceeding the declared 15-minute RPO by 45 minutes. | E1, E6, E7, E9 | A failed phase may require a roll-forward or a restore whose duration and accepted-write loss are unknown; the supplied snapshot alone cannot meet the declared RPO at the review capture time. | Obtain an RPO-compliant backup, then rehearse cancellation, batch restart, roll-forward, and snapshot restore before choosing a per-phase recovery disposition. | Restore must demonstrate the declared 60-minute RTO and 15-minute RPO, or the database owner must explicitly reject rollback and approve roll-forward. | Blocking production approval |

## Compatibility assessment

| Phase | Old readers | Old writers | New readers | New writers | Gate |
|---|---|---|---|---|---|
| Before expand | Compatible with current schema | Compatible with current schema | Not deployed | Not deployed | Current state [E1, E5] |
| Nullable `region` added | Continue selecting `id` and `status` | Continue omitting `region`, producing null | Translate null to `unknown` | Write non-null region | Matching-engine rehearsal of expand SQL [E5, E8] |
| Backfill in progress | Unchanged | May still create null rows | Accept null as `unknown` | Write non-null region | Batches remain idempotent and under thresholds [E5, E7] |
| Constraint validation | Remain compatible because they select only `id` and `status` | Old writer instances must be drained before the check is added because they still create null | Compatible | Compatible | Deployment inventory proves old-writer drain and null count is zero [E5, E7] |
| `NOT NULL` enforced | Remain compatible because they select only `id` and `status` | Incompatible because omitted `region` violates the invariant | Compatible | Compatible | Validated constraint, observation evidence, and owner approvals [E5, E8, E9] |

## Proposed rollout

The following sequence defines the evidence-producing work needed before an exact rollout can be reviewed.
It does not identify an approved or immutable staged migration artifact [E9].

1. In the disposable PostgreSQL 15.4 rehearsal, load representative data and test `BEGIN; SET LOCAL lock_timeout = '1500ms'; SET LOCAL statement_timeout = '5min'; ALTER TABLE orders ADD COLUMN region text; COMMIT;` [E2, E7, E8].
   Exit when both timeout settings are retained, observed lock wait stays below 1.5 seconds, the statement completes below 5 minutes, and all E4 signals remain below threshold; otherwise inspect the resulting schema, redesign, and repeat from a reset disposable fixture.
2. After database-owner review of rehearsal evidence, deploy new readers that map null to `unknown` and new writers that supply non-null region while old instances remain supported [E5].
   Exit when mixed-version tests cover all four reader and writer combinations.
3. Backfill only rows where `region IS NULL`, in primary-key order, at no more than 10,000 rows per transaction [E1, E7].
   Set the same proposed session-local lock and statement timeouts before each rehearsal batch, then revise production bounds only from retained representative results [E7].
   Pause when CPU exceeds 70 percent, replica lag exceeds 5 seconds, or write-error rate rises more than 0.5 percentage points [E4, E7].
4. Continue idempotent batches until `SELECT count(*) FROM orders WHERE region IS NULL` returns zero, then observe for newly created nulls while old writers remain [E5, E7].
5. After the release manager proves all old instances are drained beyond the 30-minute window, author exact SQL for `CHECK (region IS NOT NULL) NOT VALID`, constraint validation, and `NOT NULL`, assign immutable statement identities, and analyze each statement before rehearsal [E2, E5, E8, E9].
6. Set the default to `unknown` only if the data owner confirms that omitted future values have that business meaning; this meaning is not established by the supplied evidence.
7. Do not request database-owner, release-manager, or data-owner approval until a complete staged SQL artifact and digest, representative backfill query plan, compatibility evidence, null count, per-statement engine analysis, monitoring, and recovery evidence exist [E7, E9].

Every SQL fragment above must first run only in an approved disposable rehearsal and remains unexecuted [E2, E9].
No migration or destructive SQL is authorized against production by this review [E9].

## Staged-design readiness gaps

| Phase | Supplied SQL identity | Required engine analysis | Missing evidence | Current status |
|---|---|---|---|---|
| Expand nullable column | Proposed excerpt only; no immutable digest | Lock mode and duration, transaction behavior, storage effect, replication effect, cancellation state | Matching-scale result and immutable staged artifact | Blocked [E8, E9] |
| Backfill | No complete DML artifact | Batch transaction boundary, row-lock behavior, WAL and replica effect, restart behavior | Representative query plan, representative data, exact DML, and digest | Blocked [E2, E7, E9] |
| Add `NOT VALID` check | No complete statement or digest | Lock mode, catalog effect, replication effect, and failure state | Exact SQL and matching-engine rehearsal | Blocked [E8, E9] |
| Validate constraint | No complete statement or digest | Validation lock, scan and I/O cost, replica effect, and cancellation state | Exact SQL, representative timing, and invalid-row result | Blocked [E8, E9] |
| Set `NOT NULL` | No complete statement or digest | Lock behavior, validated-check reuse, transaction state, and accepted-write recovery | Exact SQL, zero-null evidence, drained writers, and approvals | Blocked [E5, E8, E9] |
| Optional default | No approved statement or business meaning | Lock and metadata behavior plus mixed-version effect | Data-owner semantics and exact SQL | Blocked [E7, E9] |

No row above is accepted for production design review.
The table records missing work rather than claiming an engine conclusion that E8 does not supply.

## Abort and recovery

| Phase | Abort or failure trigger | Immediate containment and state check | Resume or recovery gate |
|---|---|---|---|
| Disposable rehearsal | Either proposed timeout fires, an E4 threshold is breached, or target identity is not the approved disposable PostgreSQL 15.4 fixture. | Stop the session, preserve sanitized timing and lock evidence, inspect schema and row state, discard or reset the disposable fixture, and never redirect the command to production [E2, E4, E7]. | Reload representative data and restart only the failed phase after the database owner approves revised SQL and both timeout values. |
| Expand | Lock wait reaches 1.5 seconds, statement duration reaches 5 minutes, or any E4 signal breaches its limit. | Cancel the phase, stop application rollout, and inspect whether the nullable column exists before issuing any inverse SQL [E4, E7]. | If the column is absent, correct the lock cause and repeat rehearsal; if it exists, retain the compatible nullable state and obtain a database-owner roll-forward decision before proceeding [E5]. |
| Compatible application deploy | A mixed-version test fails or deployment inventory cannot prove which reader or writer version is active. | Stop deployment, keep `region` nullable, and preserve the last schema and application revisions known to satisfy the matrix [E5]. | Correct the application behavior, repeat all four reader and writer combinations, and resume only after deployment inventory can prove the intended versions and later prove old-writer drain. |
| Backfill | CPU, replica lag, write-error increase, statement timeout, invalid-row result, or batch error breaches its gate. | Pause new batches, retain committed idempotent batches, record the last processed primary key and current null count, and inspect the failed batch without reversing accepted application writes [E4, E7]. | Correct the query or load condition and resume only rows where `region IS NULL` after database-owner approval of recovered metrics. |
| `NOT VALID` check addition | The statement times out, a load threshold is breached, or the expected check is not present afterward. | Stop before validation and inspect whether the check exists while retaining the nullable column and populated data [E7, E8]. | Rehearse corrected check SQL from a reset disposable fixture, then resume at check addition only after the exact schema state is recorded. |
| Constraint validation | Validation times out, finds invalid rows, or breaches a load threshold. | Cancel validation, keep the column nullable, retain the unvalidated check if present, and stop contract work [E7, E8]. | Repair remaining nulls or redesign the validation window, repeat the zero-null check, and restart validation after database-owner review. |
| `NOT NULL` contract | Old-writer drain, zero-null evidence, validated-check evidence, observation, or owner approval is absent, or the statement fails. | Do not start when a gate is absent; on failure, stop and inspect the schema before any inverse statement [E5, E7, E8, E9]. | Retry only after all gates pass; after successful enforcement, prefer approved roll-forward because new writes can depend on the invariant unless tested recovery proves RPO, RTO, and accepted-write preservation [E6]. |
| Optional default | The data owner has not approved `unknown` as the business meaning, or post-change validation disagrees with that meaning. | Do not add the default without approval; if a later approved phase fails, stop new rollout and inspect affected writes before changing the default again [E7]. | Resume only with data-owner-approved semantics, mixed-version validation, and a database-owner recovery disposition. |

No recovery path is described as tested or lossless [E6, E9].

## Approval package

No staged approval package can be submitted from the supplied evidence [E9].
The next database-owner and release-manager package must contain a new immutable staged-SQL artifact and digest, complete per-phase SQL, representative rehearsal timings, lock and storage evidence, replication effects, query plans, compatibility results, dashboards, abort procedures, and recovery dispositions [E7, E9].
The next data-owner package must contain affected-row counts, zero-null results, approved business meaning for any default, retained-data evidence, and the exact irreversible invariant proposal [E7, E9].
No approval is currently granted [E9].

## Assumptions and limitations

The engine behavior comes from the supplied synthetic PostgreSQL 15.4 record, not an executed rehearsal [E8, E9].
The rehearsal target currently lacks representative data, so it cannot yet support a production timing claim [E2].
The proposed default value `unknown` has no supplied business approval and must not be adopted silently.

## Traceability

| Material conclusion | Evidence |
|---|---|
| Current schema, scale, and affected object inventory | E1 |
| Engine, replica, and mixed-version window | E2 |
| Exact one-statement proposal and missing timeouts | E3 |
| Workload baseline and abort thresholds | E4 |
| Old and new reader and writer behavior | E5 |
| Snapshot age calculation plus untested RPO and RTO | E1, E6 |
| Proposed batching, monitoring, roles, and severity policy | E7 |
| PostgreSQL 15.4 lock, rewrite, and staged constraint behavior | E8 |
| No execution, missing staged artifacts, and no current approval | E9 |
