# Review a database migration

Turn complete SQL, engine behavior, workload measurements, and application compatibility evidence into a staged migration and recovery package with objective production gates.

## Primary use cases

- DDL or data migration is proposed for a controlled deployment.
- A large or high-traffic table change needs lock, rewrite, compatibility, and recovery analysis.
- An expand-migrate-contract sequence needs bounded batches, abort signals, and role-owned checkpoints.

## When not to use

- Database engine or version is unknown.
- Migration SQL or affected schema is unavailable.
- Production execution is requested as part of review, or backup and approval requirements cannot be met.
- Workload, mixed-version, engine-behavior, or recovery evidence is unavailable and the requested production conclusion depends on it.

## Required evidence

- **SQL and schema:** Complete ordered statements, transaction boundaries, current columns, indexes, constraints, triggers, and affected invariants.
- **Engine context:** Exact database version, topology, target environment, and version-specific behavior sources or rehearsal results.
- **Operational baseline:** Row count, sizes, write rate, traffic window, replication, RTO, RPO, and owner-approved abort thresholds.
- **Compatibility sequence:** Old and new reader and writer behavior, defaults, null handling, feature flags, instance drain, and contract timing.
- **Recovery evidence:** When available, backup age, restore result, representative rehearsal, and protected-write analysis.

## Produced artifacts

- A statement-level finding register and old/new application compatibility matrix.
- An ordered expand, deploy, migrate, verify, and contract rollout with SQL status, checkpoints, owners, monitoring, and approvals.
- A per-phase rollback or roll-forward package with tested evidence or explicit limitations.

## Primary risks

- Never run migration or destructive SQL against production during review.
- Run mutating or destructive rehearsal SQL only in an approved disposable matching database after verifying target identity.
- Set explicit session-local lock and statement timeouts before every rehearsal statement.
- Redact customer data from plans and captured query samples.
- Stop if backup restore capability or mixed-version compatibility cannot be established for a destructive phase.
- Never describe a proposed timeout, SQL statement, rehearsal, restore, or rollback as executed.

## How to use this recipe

1. Freeze the exact engine version, environment, SQL digest, current schema, invariants, workload, and deployment sequence.
2. Follow [workflow.md](workflow.md) to analyze every statement, build the compatibility matrix, and design bounded expand, migrate, verify, and contract phases.
3. Use [checklist.md](checklist.md) to control engine evidence, target identity, both rehearsal timeouts, batch restartability, per-phase recovery, monitoring, and exact production artifacts.
4. Compare package structure with the synthetic [example input](examples/input.md) and [expected output](examples/expected-output.md), without treating its proposed SQL as executed guidance for another database.
5. Obtain database-owner and release-manager approval before production, plus data-owner approval before irreversible transformation or contraction.

## Files

- `recipe.yml` contains catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- `workflow.md` is the canonical operational procedure.
- `checklist.md` controls evidence, safety, approval, and delivery omissions.
- `output.schema.json` defines the machine-readable contract for the delivered artifact set.
- `examples/input.md` is a synthetic evidence package.
- `examples/expected-output.md` is a complete reference artifact.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

The example proves editorial derivability for a synthetic scenario, not execution through an external agent.
Domain evidence and approvals must be recollected for every real use.
The recipe reviews and plans a migration; it does not authorize or perform production SQL.

See the repository [recipe quality standard](../../docs/quality/recipe-quality-standard.md) and [adapter sources](../../docs/research/adapter-sources.md).
