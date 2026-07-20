# Example input

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
