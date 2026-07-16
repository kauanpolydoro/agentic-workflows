# Review a database migration

## Objective

Transform complete migration SQL, engine-specific behavior, workload evidence, and mixed-version application constraints into a statement-level risk assessment, staged rollout, and recovery approval package.
The primary quality constraint is to preserve data and service compatibility while distinguishing rehearsed facts from proposed controls and untested recovery assumptions.

## When to use

- DDL or data migration is proposed for a controlled deployment.
- A large or high-traffic table change needs lock, rewrite, compatibility, and recovery analysis.
- An expand-migrate-contract sequence needs objective checkpoints and role-based production gates.

## When not to use

- Database engine or version is unknown.
- Migration SQL or affected schema is unavailable.
- Production execution is requested as part of review, or backup and approval requirements cannot be met.
- Workload, mixed-version behavior, or recovery evidence is missing and the requested conclusion depends on it.

## Required inputs

- **Complete ordered migration SQL, current schema, and affected invariants:** Supply every DDL and DML statement, transaction boundary, current columns, indexes, constraints, triggers, and required data invariants.
  This evidence defines the operations and data contract under review.
  Parse the SQL against a disposable database with the matching engine version and compare the schema excerpt with an approved inventory.
- **Target database engine, exact version, environment, and engine-behavior evidence:** Supply the precise server version, deployment topology, relevant vendor or retained internal behavior references, and the non-production rehearsal target.
  This evidence is required because lock, rewrite, transaction, and constraint behavior varies by engine and version.
  Confirm the version against target inventory and tie each behavioral claim to the supplied reference or rehearsal result.
- **Table size, row count, write rate, traffic window, and approved abort thresholds:** Supply measured values, capture time, source query or dashboard, and owner-approved lock, latency, CPU, replica-lag, and error limits.
  This evidence calibrates operational risk and stop conditions.
  Validate units, freshness, target identity, and the approving database-owner role.
- **Old and new application behavior with mixed-version deployment sequence:** Supply reader and writer behavior before, during, and after rollout, including null handling, defaults, feature flags, instance-drain duration, and contract timing.
  This evidence proves whether each migration phase is compatible with deployed code.
  Validate the sequence with the release plan and identify the last old reader and writer checkpoint.

## Optional inputs

- **Representative rehearsal timings, lock observations, and query plans:** Increase confidence when dataset scale, engine settings, and commands match the proposed phase.
- **Backup, restore, RTO, RPO, and prior recovery evidence:** Determine whether rollback is feasible or an explicit roll-forward is required.
- **Data-quality samples and null or duplicate counts:** Support invariant validation when captured through approved read-only queries without customer data.

## Preconditions

- Engine, version, SQL, and target environment are recorded.
- No review command points at production.
- Current schema and affected invariants have an approved source.
- Old and new reader and writer behavior is known for every deployment phase.
- Workload evidence and abort thresholds identify units, source, and owner.
- A database owner is available for production and recovery decisions, and a data owner is available for irreversible data decisions.

## Workflow

1. **Freeze scope and classify statements.**
   Record the engine, exact version, target environment, immutable SQL digest, current schema, affected objects, invariants, and exclusions.
   Classify each statement as expand, data migration, verification, contract, or cleanup and identify its transaction boundary.
   Advance only when every statement and affected object is accounted for; otherwise stop under F1.
2. **Establish the workload and recovery baseline.**
   Record row count, table and index sizes, write rate, traffic window, replication topology, RTO, RPO, backup age, restore status, and owner-approved abort thresholds.
   Validate measurement units and provenance.
   Keep operational severity unresolved when required scale or recovery data is unavailable under F2.
3. **Analyze engine-specific behavior.**
   For every statement, determine lock modes and duration boundaries, table or index rewrite behavior, transaction semantics, disk amplification, replication effects, and constraint validation behavior for the exact version.
   Cite a supplied engine reference or rehearsal observation for each material claim.
   Stop under F3 rather than generalizing from another engine or version.
4. **Construct the compatibility matrix.**
   Evaluate old readers, old writers, new readers, and new writers against the schema after every proposed phase.
   Record accepted nulls, defaults, dual-write behavior, feature flags, and the checkpoint that proves old instances are drained.
   Redesign the sequence if any deployed version can read invalid data or issue rejected writes.
5. **Design the expand phase.**
   Split blocking or coupled statements into the smallest reversible schema additions supported by engine evidence.
   Set explicit session-scoped `lock_timeout` and `statement_timeout` values before executing any rehearsal statement, justify both against approved thresholds and the rehearsal window, and define the exact evidence required before production.
   Do not use the rehearsal itself to discover an unbounded statement duration; select a conservative bound first and lower or redesign it from retained observations.
   Rehearse first in a disposable matching database.
6. **Design the data-migration phase.**
   Choose a stable traversal key, bounded batch size, commit boundary, idempotent restart rule, pause signals, and progress query.
   Validate the backfill query plan against representative data before accepting the batch design.
   Do not advance while invalid-row counts or load thresholds are unresolved.
7. **Design verification and contract phases.**
   Define objective data checks, constraint validation, old-instance drain evidence, observation window, and owner approvals.
   Contract an old column or enforce an irreversible invariant only after compatibility, data, and recovery checkpoints pass.
8. **Define abort and recovery by phase.**
   Specify how to cancel DDL, pause and restart batches, preserve accepted writes, and choose rollback or roll-forward after each checkpoint.
   Call rollback lossless only when retained rehearsal proves post-migration writes remain valid.
9. **Produce the approval package.**
   Deliver the statement-level findings, compatibility matrix, ordered rollout, commands marked executed or proposed, monitoring, abort conditions, recovery, limitations, and traceability.
   Obtain the database-owner, release-manager, and data-owner approvals at their respective gates before any production or irreversible action.

## Decision points

- If the engine version or SQL is unknown, stop rather than generalize production behavior.
- If an operation can hold a blocking lock beyond the approved threshold, split or replace it with an online staged operation.
- If lock duration is bounded only by a proposed timeout that has not been rehearsed, keep production approval blocked until the timeout behavior is observed in the matching engine.
- If old and new application versions are incompatible at any phase, add an expand or dual-behavior phase and do not advance until both versions pass compatibility checks.
- If the backfill lacks a stable key, idempotent restart, or bounded transaction, redesign it before rehearsal.
- If rollback would discard writes accepted after migration, use an approved roll-forward plan instead of claiming lossless rollback.
- If restore evidence does not meet RTO or RPO, require database-owner acceptance of an explicit roll-forward strategy before production.
- If a destructive or irreversible transformation lacks data-owner approval, stop before that phase while retaining all reversible state.

## Safety guardrails

- Never assume rollback is lossless.
- Never ignore mixed-version deployment behavior.
- Never run migration or destructive SQL against production during review.
- Run any mutating or destructive rehearsal SQL only in an approved disposable matching database whose target identity has been verified immediately before execution.
- Redact customer data from plans and captured query samples.
- Set explicit lock and statement timeouts for rehearsal and production plans; never rely on an operator interrupt as the only bound.
- Stop before rehearsal when either timeout is absent, inherited implicitly, or not justified for the exact phase.
- Do not combine independently gated expand, backfill, validation, and contract work into one production transaction.
- Preserve a schema snapshot, migration digest, monitoring links, and recovery evidence before production approval.
- Stop if backup restore capability or mixed-version compatibility cannot be established for a destructive phase.

## Human approval gates

- Before production execution, the database owner and release manager approve the exact SQL digest, matching-engine rehearsal, workload baseline, timeouts, monitoring, abort commands, deployment sequence, and recovery disposition.
- Before any irreversible data transformation, the data owner approves affected-row counts, validation queries, retained-data evidence, business impact, and the explicit roll-forward or accepted-loss plan.
- Before contracting old columns, the database owner, data owner, and release manager approve zero-use and data-retention evidence, drained old versions, observation results, and the final recovery checkpoint.

## Expected output

- **Statement-level migration risk and compatibility assessment:** Each finding contains evidence, impact, severity, confidence, recommendation, verification, and disposition; the compatibility matrix covers every old and new reader and writer phase.
- **Staged rollout with checkpoints, monitoring, owners, and approvals:** Ordered expand, deploy, migrate, verify, and contract steps with SQL or commands, execution status, dependencies, exit criteria, thresholds, and role ownership.
- **Rollback or roll-forward recovery package:** Expand, application-deploy, backfill, constraint-addition, constraint-validation, contract, and optional-default phases each have an abort trigger, immediate containment, state inspection, safe resume point, protected-write analysis, tested recovery evidence or explicit limitations, assumptions, next steps, and traceability.

The artifact must distinguish observations, inferences, recommendations, executed checks, proposed checks, assumptions, limitations, and next actions.
Material claims must cite example evidence IDs.

## Completion criteria

- Every statement has an engine-specific lock and data-loss assessment.
- Every application version is compatible at each phase or the rollout remains blocked with the incompatible phase identified.
- Workload, backfill, lock, replication, and error abort thresholds identify exact measurements and owner-approved sources.
- Rehearsed commands are distinguished from proposed commands and tied to the exact engine version and SQL digest.
- Recovery is tested against RTO and RPO or marked as an untested plan requiring approval.
- Every rollout phase has a recovery entry that identifies the state to inspect, the safe resume point, and whether rollback or roll-forward protects accepted writes.
- Production, irreversible-transformation, and contraction gates contain their required evidence and responsible roles.

## Failure modes

- **F1:** Engine version or migration SQL is missing.
- **F2:** Workload size or write rate is unavailable.
- **F3:** Engine-specific lock, rewrite, or constraint behavior cannot be established.
- **F4:** Rehearsal exceeds a threshold or recovery fails its RTO or RPO.
- **F5:** Mixed-version validation or data-quality checks fail.

## Recovery procedure

- **R1:** Obtain the exact engine inventory, immutable SQL, and current schema, verify their provenance, and restart at workflow step 1.
- **R2:** Obtain approved read-only measurements or representative staging measurements, retain their source and capture time, and resume at workflow step 2 while keeping production risk unresolved until equivalence is approved.
- **R3:** Obtain a version-specific source or matching-engine rehearsal result, remove unsupported behavior claims, and resume at workflow step 3; escalate to the database owner if behavior remains unknown.
- **R4:** Abort the affected rehearsal phase, preserve sanitized lock and timing evidence, inspect whether that phase changed schema or data, and apply its recorded recovery entry.
  Redesign into smaller or online phases, repair recovery, and restart at workflow step 5 for expand, step 6 for backfill, or step 7 for validation and contract work, with production approval withheld until the failed phase passes.
- **R5:** Stop before the incompatible or invalid phase, preserve the last compatible schema, correct application behavior or data, repeat mixed-version and invariant checks, and resume at workflow step 4 only after they pass.

## Example

The complete synthetic example is in [examples/input.md](examples/input.md), with its complete artifact in [examples/expected-output.md](examples/expected-output.md).
It demonstrates evidence traceability without relying on external sources.
