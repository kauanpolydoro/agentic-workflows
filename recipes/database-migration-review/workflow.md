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

The complete synthetic example is in [examples/input.md](examples/input.md), and its complete artifact is in [examples/expected-output.md](examples/expected-output.md).
It demonstrates evidence traceability without relying on external sources.
