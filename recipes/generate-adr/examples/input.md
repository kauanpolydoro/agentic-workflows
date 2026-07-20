# Synthetic validation-ownership decision evidence

This example is entirely synthetic.
It provides every fact, option, approval, and limitation used by the expected ADR.

## Decision question

Where should deterministic recipe metadata and cross-file validation be owned so that a CLI, catalog generator, and documentation build apply one contract without requiring network access?

The decision covers parsing, schema enforcement, cross-file checks, and typed validation errors.
It excludes terminal rendering, command orchestration, catalog presentation, documentation navigation, and the detailed implementation sequence.

## Evidence inventory

### E1 - Immutable repository context and decision boundary

The synthetic repository snapshot is commit `d29c6e1000000000000000000000000000000000` with a clean working tree.
It is a TypeScript workspace containing `packages/core`, `packages/cli`, `scripts/generate.ts`, and a documentation build.
The supplied decision asks where deterministic recipe metadata parsing, schema enforcement, cross-file validation, and typed validation errors should be owned for the CLI, catalog generator, and documentation consistency check.
The boundary excludes terminal rendering, command orchestration, catalog presentation, documentation navigation, and detailed implementation sequencing.

### E2 - Current consumers and dependency direction

- The CLI validates recipes for its `validate` command.
- `scripts/generate.ts` parses the same recipes to generate catalog data.
- The documentation build consumes the generated catalog and performs a source consistency check.
- The CLI, generator, and documentation build may depend on `packages/core`.
- `packages/core` must not import terminal UI, generator orchestration, or documentation framework code.

### E3 - Observed divergence defect

The CLI and generator currently implement separate recipe-ID and required-file checks.
Fixture `invalid-directory-id` contains metadata ID `sample-recipe` under directory `different-name`.

The supplied defect run records:

- CLI validation rejected the fixture with typed code `ID_DIRECTORY_MISMATCH`.
- Catalog generation accepted the same fixture and emitted catalog ID `sample-recipe`.
- The documentation consistency check therefore consumed a catalog entry for an invalid source bundle.

### E4 - Mandatory constraints and preferences

Mandatory constraints:

- All three consumers must apply the same deterministic contract.
- Validation must run without network access.
- Callers must receive stable typed error codes.
- Core must remain independent of terminal UI and documentation framework code.

Preferences:

- One rule implementation should be maintained when feasible.
- Consumers should remain free to render errors for their own audience.
- Migration should be reversible consumer by consumer.

### E5 - Common evaluation criteria

| Criterion | Class | Satisfactory result |
| --- | --- | --- |
| Contract consistency | mandatory | all consumers call one rule implementation or prove identical generated rules |
| Offline operation | mandatory | no network service or remote schema is needed at runtime or build time |
| Typed errors | mandatory | consumers receive stable machine-readable codes |
| Core boundary | mandatory | shared validation imports no terminal or documentation framework code |
| Maintenance ownership | preferred | validation rules have one accountable code owner |
| Incremental migration | preferred | consumers can move and roll back independently |

### E6 - Alternatives

- **Option A - Consumer-owned validators:** Retain the CLI validator and implement matching logic separately in the generator and documentation build.
  The CLI maintainer and documentation maintainer own their respective copies, with no new runtime dependency or migration.
  Each consumer validates locally and can independently revert a rule change in its own copy.
  Its material disadvantage is synchronized duplicate maintenance, and the supplied defect demonstrates that those copies can diverge.
- **Option B - Shared core validation API:** Move the deterministic contract into `packages/core` and let each consumer call it and render typed errors independently.
  The repository maintainer owns the core API and fixtures, while the CLI and documentation maintainers own their consumer integrations.
  It depends on a stable core API and shared fixture contract, runs locally, and migrates one consumer at a time while retaining that consumer's old validator for rollback.
  Its material disadvantages are a broader core public API, central fixture ownership, and temporary coexistence of shared and duplicated validation during migration.
- **Option C - Validation network service:** Send recipe bundles to one service from all consumers.
  No accountable service-owner role, deployment platform, privacy approval, or availability target is supplied for this option.
  It depends on network reachability, remote deployment, access control, and service operations, and every consumer would need a remote-client migration.
  Consumers could return to local validation only by retaining or restoring their prior validators.
  Its material disadvantages are violation of mandatory offline operation plus new availability, privacy, deployment, and rollback dependencies.

No-change is equivalent to Option A's current duplication risk and is represented there rather than evaluated as a fourth implementation.

### E7 - Related-decision search

The supplied ADR index has no accepted or proposed decision governing validation ownership.
One related architecture note states only that `packages/core` may contain reusable parsing and schema types; it does not decide cross-file validation ownership.

No supersession is required.

### E8 - Architecture-owner disposition

The architecture owner reviewed E1 through E7 under review record `architecture-review-17`.
The owner selected Option B and authorized ADR status Accepted.

The approval requires terminal and documentation rendering to remain outside core.
Before implementation work closes, the same retained valid and invalid fixtures must run through a contract test for each of the CLI, catalog generator, and documentation consistency consumers.
Each consumer must also pass its own integration test showing that it invokes shared core validation while preserving its consumer-specific behavior.
No approval date was supplied.

### E9 - Implementation state and ownership

Implementation has not started.

- Core API and fixtures owner role: repository maintainer.
- CLI integration owner role: CLI maintainer.
- Catalog generator integration owner role: documentation maintainer.
- Documentation consistency integration owner role: documentation maintainer.

The existing validator for a consumer must remain available until that consumer passes both the shared-fixture contract test and its own integration test and can roll back independently.

### E10 - Revisit triggers and open uncertainty

The architecture owner must revisit the decision if:

- a consumer cannot depend on core without introducing terminal or documentation framework imports into core;
- stable typed errors cannot represent a consumer's required diagnostics;
- the complete validation command exceeds 60 seconds wall-clock or 1 GiB peak RSS on the repository's pinned Linux x64 local-build runner in three consecutive runs; or
- an additional non-TypeScript consumer cannot use the shared API or a deterministic generated contract.

The 60-second and 1-GiB local-build limits are the complete resource thresholds supplied by repository policy.
No current benchmark or implementation-effort estimate is supplied.
