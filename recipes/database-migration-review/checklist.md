# Review a database migration checklist

## Engine and workload facts

- [ ] Every SQL statement is reviewed against the exact database engine and version.
- [ ] Current schema, indexes, constraints, row count, table size, and write rate are recorded.
- [ ] Mixed-version readers and writers are mapped for every rollout phase.
- [ ] Lock, rewrite, replication, storage, and data-loss behavior is classified per statement.
- [ ] RTO, RPO, snapshot, restore, and rehearsal status are explicit.
- [ ] Every engine-behavior claim cites a version-specific source or retained rehearsal result.

## Staged rollout

- [ ] Expand SQL is independently executable and compatible with old application instances.
- [ ] Backfill has a stable key, bounded batch size, pause conditions, and restart behavior.
- [ ] Backfill query plans and batch timings come from representative data before production approval.
- [ ] CPU, lock wait, replica lag, error rate, and null-count signals have exact thresholds.
- [ ] Each abort signal names its query or approved dashboard.
- [ ] Constraint validation requires backfill completion, zero invalid rows, and drained old writers.
- [ ] Contract SQL waits for observation evidence and data-owner approval.
- [ ] Every phase identifies database owner, release manager, and data owner responsibilities.

## Production and recovery gates

- [ ] Rehearsal uses a disposable matching database and representative scale.
- [ ] Target identity is verified before every mutating rehearsal command, and no review command points at production.
- [ ] Every rehearsal phase sets explicit session-local lock and statement timeouts before SQL execution.
- [ ] Production execution has reviewed timings, monitoring, permissions, and abort commands.
- [ ] Irreversible transformation has explicit approval and a roll-forward disposition.
- [ ] Rollback is called lossless only when post-migration writes are preserved by tested evidence.
- [ ] Recovery commands and restore evidence are retained before the production gate.
- [ ] Expand, application deploy, backfill, check addition, validation, contract, and optional-default phases each identify abort, state inspection, resume, and protected-write behavior.
- [ ] The exact approved SQL digest matches the production artifact at the gate.
- [ ] Proposed SQL and thresholds are never described as executed.
- [ ] The migration package satisfies every completion criterion.
