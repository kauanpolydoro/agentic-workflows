---
title: "Review a database migration"
description: "Assess a proposed database migration statement by statement for the exact engine version, then plan a staged rollout with approval gates and a rollback or roll-forward recovery package."
---

# Review a database migration

## Objective

You start with the complete migration SQL, evidence of how the exact engine version behaves, workload measurements, and the mixed-version constraints of the application code.
You end with a statement-level risk assessment, a staged rollout, and a recovery approval package.
The quality bar throughout is to preserve data and service compatibility while distinguishing rehearsed facts from proposed controls and untested recovery assumptions.

## When to use

- A DDL or data migration is proposed for a controlled deployment.
- A change to a large or high-traffic table needs lock, rewrite, compatibility, and recovery analysis.
- An expand-migrate-contract sequence needs objective checkpoints and role-based production gates.

## When not to use

- The database engine or its version is unknown.
- The migration SQL or the affected schema is unavailable.
- Production execution is requested as part of the review, or the backup and approval requirements cannot be met.
- Workload, mixed-version behavior, or recovery evidence is missing and the conclusion you are asked for depends on it.

## Required inputs

- **Complete ordered migration SQL, current schema, and affected invariants:** Supply every DDL and DML statement, each transaction boundary, the current columns, indexes, constraints, and triggers, and the data invariants that must hold.
  Together these define the operations and the data contract under review.
  Parse the SQL against a disposable database running the matching engine version, and compare the schema excerpt with an approved inventory.
- **Target database engine, exact version, environment, and engine-behavior evidence:** Supply the precise server version, the deployment topology, the vendor or retained internal references that describe engine behavior, and the non-production rehearsal target.
  Lock, rewrite, transaction, and constraint behavior all vary by engine and version, which is why this evidence is required.
  Confirm the version against the target inventory, and tie every behavioral claim to a supplied reference or a rehearsal result.
- **Table size, row count, write rate, traffic window, and approved abort thresholds:** Supply measured values with their capture time and source query or dashboard, plus the lock, latency, CPU, replica-lag, and error limits an owner has approved.
  These numbers calibrate operational risk and set the stop conditions.
  Validate the units, the freshness, the target identity, and the database-owner role that approved the limits.
- **Old and new application behavior with mixed-version deployment sequence:** Supply reader and writer behavior before, during, and after the rollout, including null handling, defaults, feature flags, instance-drain duration, and contract timing.
  This is what proves, phase by phase, that the migration stays compatible with the code that is actually deployed.
  Validate the sequence against the release plan, and identify the checkpoint where the last old reader and writer is gone.

## Optional inputs

- **Representative rehearsal timings, lock observations, and query plans:** These raise confidence, but only when the dataset scale, engine settings, and commands match the proposed phase.
- **Backup, restore, RTO, RPO, and prior recovery evidence:** This is what determines whether rollback is feasible or an explicit roll-forward is required.
- **Data-quality samples and null or duplicate counts:** These support invariant validation, provided they were captured through approved read-only queries and contain no customer data.

## Preconditions

- The engine, version, SQL, and target environment are recorded.
- No review command points at production.
- The current schema and the affected invariants have an approved source.
- Old and new reader and writer behavior is known for every deployment phase.
- Workload evidence and abort thresholds identify their units, source, and owner.
- A database owner is available for production and recovery decisions, and a data owner is available for irreversible data decisions.

## Workflow

1. **Freeze the scope and classify every statement.**
   Record the engine, its exact version, the target environment, an immutable digest of the SQL, the current schema, the affected objects, the invariants, and anything explicitly excluded.
   Classify each statement as expand, data migration, verification, contract, or cleanup, and note its transaction boundary.
   Advance only when every statement and affected object is accounted for; otherwise stop under F1.
2. **Establish the workload and recovery baseline.**
   Record the row count, table and index sizes, write rate, traffic window, replication topology, RTO, RPO, backup age, restore status, and the owner-approved abort thresholds.
   Check the units and provenance of every measurement.
   When required scale or recovery data is unavailable, keep operational severity unresolved under F2.
3. **Analyze engine-specific behavior.**
   For every statement, determine the lock modes and duration boundaries, table or index rewrite behavior, transaction semantics, disk amplification, replication effects, and constraint validation behavior, all for the exact version.
   Cite a supplied engine reference or a rehearsal observation for each material claim.
   Stop under F3 rather than generalizing from another engine or version.
4. **Build the compatibility matrix.**
   Evaluate old readers, old writers, new readers, and new writers against the schema as it stands after every proposed phase.
   Record accepted nulls, defaults, dual-write behavior, feature flags, and the checkpoint that proves old instances are drained.
   Redesign the sequence if any deployed version could read invalid data or issue writes that would be rejected.
5. **Design the expand phase.**
   Split blocking or coupled statements into the smallest reversible schema additions the engine evidence supports.
   Set explicit session-scoped `lock_timeout` and `statement_timeout` values before any rehearsal statement runs, justify both against the approved thresholds and the rehearsal window, and define the exact evidence required before production.
   Do not use the rehearsal itself to discover an unbounded statement duration; pick a conservative bound first, then lower or redesign it from retained observations.
   Rehearse first in a disposable matching database.
6. **Design the data-migration phase.**
   Choose a stable traversal key, a bounded batch size, a commit boundary, an idempotent restart rule, pause signals, and a progress query.
   Validate the backfill query plan against representative data before accepting the batch design.
   Do not advance while invalid-row counts or load thresholds remain unresolved.
7. **Design the verification and contract phases.**
   Define objective data checks, constraint validation, evidence that old instances are drained, the observation window, and the owner approvals.
   Contract an old column, or enforce an irreversible invariant, only after the compatibility, data, and recovery checkpoints pass.
8. **Define abort and recovery for each phase.**
   Spell out how to cancel DDL, pause and restart batches, preserve accepted writes, and choose between rollback and roll-forward after each checkpoint.
   Call rollback lossless only when retained rehearsal evidence proves that post-migration writes remain valid.
9. **Produce the approval package.**
   Deliver the statement-level findings, the compatibility matrix, the ordered rollout, every command marked as executed or proposed, and the monitoring, abort conditions, recovery, limitations, and traceability that go with them.
   Obtain the database-owner, release-manager, and data-owner approvals at their respective gates before any production or irreversible action.

## Decision points

- If the engine version or the SQL is unknown, stop rather than generalize about production behavior.
- If an operation can hold a blocking lock past the approved threshold, split it or replace it with an online staged operation.
- If lock duration is bounded only by a proposed timeout that has not been rehearsed, keep production approval blocked until the timeout behavior is observed on the matching engine.
- If old and new application versions are incompatible at any phase, add an expand or dual-behavior phase and do not advance until both versions pass the compatibility checks.
- If the backfill lacks a stable key, an idempotent restart, or a bounded transaction, redesign it before rehearsal.
- If rollback would discard writes accepted after the migration, use an approved roll-forward plan instead of claiming lossless rollback.
- If restore evidence does not meet the RTO or RPO, require the database owner to accept an explicit roll-forward strategy before production.
- If a destructive or irreversible transformation lacks data-owner approval, stop before that phase and retain all reversible state.

## Safety guardrails

- Never assume rollback is lossless.
- Never ignore mixed-version deployment behavior.
- Never run migration or destructive SQL against production during review.
- Run mutating or destructive rehearsal SQL only in an approved disposable matching database, and verify its target identity immediately before execution.
- Redact customer data from plans and captured query samples.
- Set explicit lock and statement timeouts for both rehearsal and production plans; an operator interrupt must never be the only bound.
- Stop before rehearsal when either timeout is absent, implicitly inherited, or not justified for the exact phase.
- Do not combine independently gated expand, backfill, validation, and contract work into one production transaction.
- Preserve a schema snapshot, the migration digest, monitoring links, and recovery evidence before production approval.
- Stop if backup restore capability or mixed-version compatibility cannot be established for a destructive phase.

## Human approval gates

- Before production execution, the database owner and release manager approve the exact SQL digest, the matching-engine rehearsal, the workload baseline, the timeouts, the monitoring, the abort commands, the deployment sequence, and the recovery disposition.
- Before any irreversible data transformation, the data owner approves the affected-row counts, the validation queries, the retained-data evidence, the business impact, and the explicit roll-forward or accepted-loss plan.
- Before contracting old columns, the database owner, data owner, and release manager approve the zero-use and data-retention evidence, the drained old versions, the observation results, and the final recovery checkpoint.

## Expected output

- **Statement-level migration risk and compatibility assessment:** Every finding records its evidence, impact, severity, confidence, recommendation, verification, and disposition, and the compatibility matrix covers every old and new reader and writer phase.
- **Staged rollout with checkpoints, monitoring, owners, and approvals:** The rollout orders the expand, deploy, migrate, verify, and contract steps, each with its SQL or commands, execution status, dependencies, exit criteria, thresholds, and role ownership.
- **Rollback or roll-forward recovery package:** The expand, application-deploy, backfill, constraint-addition, constraint-validation, contract, and optional-default phases each carry an abort trigger, immediate containment, state inspection, a safe resume point, protected-write analysis, tested recovery evidence or explicit limitations, assumptions, next steps, and traceability.

The artifact must distinguish observations, inferences, recommendations, executed checks, proposed checks, assumptions, limitations, and next actions.
Material claims must cite example evidence IDs.

## Completion criteria

- Every statement has an engine-specific lock and data-loss assessment.
- Every application version is compatible at each phase, or the rollout stays blocked with the incompatible phase identified.
- The workload, backfill, lock, replication, and error abort thresholds name their exact measurements and owner-approved sources.
- Rehearsed commands are distinguished from proposed commands and tied to the exact engine version and SQL digest.
- Recovery is tested against the RTO and RPO, or it is marked as an untested plan that requires approval.
- Every rollout phase has a recovery entry that names the state to inspect, the safe resume point, and whether rollback or roll-forward protects accepted writes.
- The production, irreversible-transformation, and contraction gates contain their required evidence and responsible roles.

## Failure modes

- **F1:** The engine version or the migration SQL is missing.
- **F2:** The workload size or write rate is unavailable.
- **F3:** Engine-specific lock, rewrite, or constraint behavior cannot be established.
- **F4:** A rehearsal exceeds a threshold, or recovery fails its RTO or RPO.
- **F5:** Mixed-version validation or data-quality checks fail.

## Recovery procedure

- **R1:** Obtain the exact engine inventory, the immutable SQL, and the current schema, verify their provenance, and restart at workflow step 1.
- **R2:** Obtain approved read-only measurements or representative staging measurements, retain their source and capture time, and resume at workflow step 2, keeping production risk unresolved until equivalence is approved.
- **R3:** Obtain a version-specific source or a matching-engine rehearsal result, remove the unsupported behavior claims, and resume at workflow step 3; escalate to the database owner if the behavior remains unknown.
- **R4:** Abort the affected rehearsal phase, preserve sanitized lock and timing evidence, check whether that phase changed schema or data, and apply its recorded recovery entry.
  Redesign the work into smaller or online phases, repair the recovery, and restart at workflow step 5 for expand work, step 6 for backfill, or step 7 for validation and contract work, withholding production approval until the failed phase passes.
- **R5:** Stop before the incompatible or invalid phase, preserve the last compatible schema, correct the application behavior or the data, repeat the mixed-version and invariant checks, and resume at workflow step 4 only after they pass.

## Example

The complete synthetic example is in [#complete-example-input](#complete-example-input), and its complete artifact is in [#complete-expected-output](#complete-expected-output).
It demonstrates evidence traceability without relying on external sources.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/database-migration-review/1.0.0",
  "title": "Database migration review output contract",
  "description": "Validates the migration verdict, risk and compatibility analysis, staged rollout, recovery controls, approvals, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "database-migration-review.md",
        "audience": "Database owners, release managers, and data owners",
        "requires_title": true,
        "required_headings": [
          "Verdict",
          "Risk register",
          "Compatibility assessment",
          "Proposed rollout",
          "Abort and recovery",
          "Approval package",
          "Assumptions and limitations",
          "Traceability"
        ],
        "required_literals": [
          "| Severity | Confidence | Finding | Evidence | Impact | Recommendation | Verification | Disposition |",
          "| Phase | Old readers | Old writers | New readers | New writers | Gate |",
          "| Phase | Abort or failure trigger | Immediate containment and state check | Resume or recovery gate |",
          "| Material conclusion | Evidence |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This is a synthetic, self-contained scenario.
No external record should be consulted.

## Context

Synthetic PostgreSQL 15.4 migration for a high-traffic orders table.
The review concerns a proposed production change, but all commands and controls below remain synthetic and unexecuted.

## Request

Review the proposed SQL and produce a safe rollout recommendation.

## Constraints

- Use only the evidence below.
- Treat commands as executed only when their evidence explicitly records a result.
- State assumptions and limitations.
- Do not connect to a database or treat proposed SQL as approved.

## Evidence inventory

### E1 - Current schema

- Type: Approved schema and volume snapshot.
- Content: The complete affected table definition is:

```sql
CREATE TABLE orders (
  id bigint PRIMARY KEY,
  status text NOT NULL
);
```

- Content: The table contains 200 million rows, occupies 180 GB including its primary-key index, and has no `region` column, trigger, secondary index, or partition.
- Integrity: The schema and volume snapshot identify the synthetic production inventory at capture `2026-01-10T10:00:00Z`.
- Establishes: Current structure, affected invariant boundary, scale, and absence of dependent schema objects.

### E2 - Target inventory

- Type: Engine and deployment inventory.
- Content: The target is a PostgreSQL 15.4 primary with one asynchronous replica.
- Content: A rolling application deployment keeps old instances for at most 30 minutes after new instances begin serving.
- Content: The disposable rehearsal environment also runs PostgreSQL 15.4 but currently has no representative data loaded.
- Integrity: The database owner supplied the engine and topology inventory.
- Establishes: Exact engine version, replication topology, mixed-version window, and current rehearsal limitation.

### E3 - Proposed SQL

- Type: Immutable migration artifact.
- Content: The complete proposed migration, with immutable synthetic artifact identifier `migration-orders-region-v1`, is:

```sql
ALTER TABLE orders ADD COLUMN region text NOT NULL DEFAULT 'unknown';
```

- Content: The artifact defines no explicit transaction, `lock_timeout`, `statement_timeout`, backfill, validation query, or recovery statement.
- Establishes: The exact single-statement proposal and omitted operational controls.

### E4 - Workload

- Type: Owner-approved workload and abort baseline.
- Content: Peak write rate is 2,000 rows per second, application p95 write latency is 80 ms, and normal replica lag is below 1 second.
- Content: The database owner approves a maximum blocking-lock wait of 2 seconds, database CPU of 70 percent, replica lag of 5 seconds, and write-error-rate increase of 0.5 percentage points.
- Content: Metrics come from approved platform dashboards for the synthetic production target during the peak traffic window.
- Establishes: Operational baseline, thresholds, sources, and approving role.

### E5 - Application behavior

- Type: Mixed-version application contract.
- Content: Old writers omit `region`, and old readers select only `id` and `status`.
- Content: New writers send a non-null region, and new readers translate database null to the string `unknown`.
- Content: The release manager can prove old-instance drain from deployment inventory after the 30-minute mixed-version window.
- Establishes: Reader and writer compatibility behavior plus the drain checkpoint.

### E6 - Recovery status

- Type: Backup and recovery record.
- Content: A snapshot exists from `2026-01-10T09:00:00Z`, with declared RPO 15 minutes and RTO 60 minutes.
- Content: Restore, migration rehearsal, cancellation, and roll-forward have not been tested.
- Content: No evidence establishes whether restore meets RPO or RTO.
- Establishes: Available backup artifact and unverified recovery capability.

### E7 - Proposed operational controls

- Type: Unexecuted owner proposal.
- Content: The database owner proposes session-local `lock_timeout = '1500ms'` and `statement_timeout = '5min'` before every rehearsal statement, batches of at most 10,000 rows ordered by primary key, and idempotent updates limited to rows where `region IS NULL`.
- Content: Both timeout values are unexecuted proposals that require database-owner review against representative rehearsal results before production values are approved.
- Content: Pause conditions are CPU above 70 percent, replica lag above 5 seconds, or write-error-rate increase above 0.5 percentage points.
- Content: The progress query is `SELECT count(*) FROM orders WHERE region IS NULL`; lock, CPU, replica-lag, and error signals use the approved platform dashboards.
- Content: The release manager owns traffic and deployment gates; the database owner owns SQL, load thresholds, and recovery evidence; the data owner approves the final non-null invariant.
- Content: Migration policy rates production DDL with unbounded lock or untested recovery as High and mixed-version compatibility risk with a staged mitigation as Medium.
- Establishes: Exact proposed rehearsal batching and timeout controls, monitoring, accountable roles, and severity; none has been rehearsed or approved for production.

### E8 - PostgreSQL 15.4 behavior reference

- Type: Retained synthetic engine-behavior record approved for this example.
- Content: Adding a column with a constant default is metadata-only on the supplied PostgreSQL 15.4 configuration and does not rewrite existing rows.
- Content: `ALTER TABLE ... ADD COLUMN` still requires an `ACCESS EXCLUSIVE` table lock, and lock acquisition has no 2-second bound when `lock_timeout` is absent.
- Content: The approved staged pattern for this environment is add nullable column, deploy compatible readers and writers, backfill, add a `CHECK (region IS NOT NULL) NOT VALID`, validate it, then set `NOT NULL` using the validated constraint evidence.
- Content: Every schema-changing phase still requires matching-scale rehearsal and a bounded lock wait.
- Establishes: Version-specific rewrite, lock, and staged-constraint behavior for the review; it does not establish observed timing.

### E9 - Approval and execution state

- Type: Gate record.
- Content: No SQL, parse, rehearsal, restore, query-plan, compatibility, or production command was executed for this example.
- Content: The database owner, release manager, and data owner have not approved production execution or the staged alternative.
- Content: No immutable staged-SQL artifact, staged-SQL digest, complete backfill DML, representative query plan, or per-statement disk-amplification and replication analysis is supplied.
- Content: Only the original one-statement artifact `migration-orders-region-v1` is immutable, and that artifact remains rejected for production approval.
- Establishes: Unexecuted status, missing staged approval artifacts, and pending human gates.

## Complete expected output

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
