# ADR: Own recipe validation in the shared core

## Status

Accepted (E8).

The architecture owner selected the shared-core option in retained review record `architecture-review-17` (E8).
No approval date is recorded because none was supplied (E8).

## Decision boundary

This decision governs deterministic recipe metadata parsing, schema enforcement, cross-file validation, and typed validation errors for the CLI, catalog generator, and documentation consistency check (E1, E2).

It does not govern terminal rendering, command orchestration, catalog presentation, documentation navigation, or implementation sequencing (E1).
No existing ADR is superseded (E7).

## Context and evidence

At synthetic commit `d29c6e1000000000000000000000000000000000`, the three consumers process the same recipe source through separate paths (E1, E2, E3).
The CLI and generator already disagree on an `ID_DIRECTORY_MISMATCH` fixture, and the invalid catalog entry reaches the documentation consistency check (E3).

The architecture must provide one deterministic offline contract, stable typed errors, and a core package free of terminal and documentation framework dependencies (E4).
Single rule ownership and consumer-by-consumer migration are preferred but not mandatory (E4).

## Decision drivers

- Contract consistency across all three consumers is mandatory (E4, E5).
- Validation must operate without a network dependency (E4, E5).
- Callers need stable machine-readable errors while retaining audience-specific rendering (E4, E5).
- The shared core boundary cannot depend on terminal UI or the documentation framework (E2, E4, E5).
- One accountable rule implementation and reversible consumer migration are preferred (E4, E5).

## Options considered

| Option | Contract consistency | Offline operation | Typed errors | Core boundary | Maintenance and migration | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| A - Consumer-owned validators | weak because duplicated rules already diverged | satisfies | can satisfy independently | satisfies | CLI and documentation maintainers own separate local validators; no migration or new dependency is required; each copy can roll back independently; synchronized duplicate maintenance remains the material disadvantage | rejected |
| B - Shared core validation API | satisfies through one rule implementation | satisfies | satisfies through a shared error contract | satisfies if rendering stays in consumers | repository maintainer owns core and fixtures while consumer maintainers own integrations; consumers depend on the core API, migrate one at a time, and can return to retained validators; broader core API and temporary duplicate coexistence are the material disadvantages | accepted |
| C - Validation network service | satisfies through one deployed service | fails mandatory offline constraint | can satisfy | core could remain independent | no service owner, platform, privacy approval, or availability target is supplied; consumers would depend on remote access and migrate to a service client; rollback requires retained local validators; availability, privacy, deployment, and offline violations are material disadvantages | rejected |

The table applies the same criteria defined in E5 to the option descriptions in E6.
Option A also represents the current no-change state because retaining the current approach preserves its duplication risk (E6).
Option C remains non-viable even if centralized ownership were supplied because mandatory offline operation would still fail (E4, E5, E6).
If a future non-TypeScript consumer cannot use the local core API or a deterministic generated contract, the architecture owner must reopen the comparison rather than assuming the network-service option becomes acceptable (E10).

## Decision

Own deterministic recipe metadata parsing, schema enforcement, cross-file checks, and typed validation errors in `packages/core` (E2, E4, E6, E8).

The CLI, catalog generator, and documentation consistency check will call the shared API (E8).
Each consumer remains responsible for command orchestration and audience-specific error rendering, which preserves the core boundary required by E2 and E8.

Existing consumer validators remain available during incremental migration until shared contract fixtures pass for that consumer (E8, E9).

## Consequences

### Positive

- The three consumers can enforce one rule implementation, directly addressing the recorded divergence (E3, E6).
- Validation remains local and deterministic without a service availability dependency (E4, E6).
- A shared typed-error contract can use one retained fixture suite while each consumer verifies its own integration and rendering behavior (E4, E8).
- Consumers can migrate and roll back independently while their existing validator remains available (E6, E9).

### Negative

- `packages/core` gains a broader public API and becomes accountable for cross-file fixtures and error-code stability (E6, E9).
- During migration, shared and consumer validators coexist and can still disagree until both contract and integration tests cover each consumer path (E9).
- A future non-TypeScript consumer may need a deterministic generated contract rather than direct API use (E10).

### Neutral

- CLI terminal output and documentation presentation remain separate even though validation decisions are shared (E2, E8).
- This ADR selects ownership but does not define detailed code structure or claim that implementation has begun (E9).

## Implementation follow-up

| Action | Owner role | Dependency | Exit criterion | Verification signal | Recovery |
| --- | --- | --- | --- | --- | --- |
| Define the core validation result and stable error-code contract | repository maintainer | this ADR | all E4 mandatory requirements are represented without UI types | core type and fixture tests pass | retain current validators and revise the API |
| Publish the shared valid and invalid fixture suite | repository maintainer | core contract | each retained fixture records the expected stable result or error code | core fixture-schema and deterministic-result tests pass | revise the fixture contract without migrating a consumer |
| Migrate CLI validation and rendering | CLI maintainer | core API and shared fixtures | the CLI contract test runs the shared suite and the CLI path preserves CLI-owned rendering | CLI contract and integration tests pass | route the CLI back to its retained validator |
| Migrate catalog generation | documentation maintainer | core API and shared fixtures | the generator contract test runs the shared suite and the integration path excludes an invalid source bundle | generator contract and integration tests pass | route the generator back to its retained validator |
| Migrate the documentation consistency check | documentation maintainer | core API, shared fixtures, and generated catalog | the documentation contract test runs the shared suite and the integration path rejects an invalid generated entry | documentation contract and integration tests pass | route the documentation check back to its retained validator |
| Remove duplicate validation logic | repository maintainer | every consumer contract and integration exit criterion | repository search finds no active duplicate rule implementation | full validation, build, and documentation checks pass | revert removal while retaining the shared API |

Implementation is pending, so none of these verification signals is reported as passing in this ADR (E9).

## Approval and related decisions

Review record `architecture-review-17` authorizes Accepted status and Option B (E8).
It also requires rendering to remain outside core and separate contract and integration evidence for every consumer before implementation closure (E8).

The related architecture note permits reusable parsing and schema types in core but does not decide this boundary, so it is related rather than superseded (E7).

## Revisit triggers

The architecture owner will reopen this decision if a consumer introduces terminal or documentation framework imports into core, typed errors cannot express required diagnostics, the complete validation command exceeds 60 seconds wall-clock or 1 GiB peak RSS on the pinned Linux x64 local-build runner in three consecutive runs, or a new non-TypeScript consumer cannot use the API or a deterministic generated contract (E10).

Neither the approval record nor the revisit-trigger record defines an amendment or supersession procedure (E8, E10).
This ADR records the supplied revisit triggers but leaves the document-governance mechanism to a future architecture-owner disposition.

## Assumptions and limitations

The comparison assumes every current consumer may depend on core, as supplied in E2.
If that dependency rule changes, the first revisit trigger applies (E10).

No benchmark, cost estimate, approval date, implementation result, or claim of consensus is present because the input does not provide one (E8, E9, E10).

## Evidence traceability

- Repository snapshot and decision boundary: E1.
- Consumers and permitted dependency direction: E2.
- Observed divergence: E3.
- Constraints and preferences: E4.
- Common criteria: E5.
- Alternatives: E6.
- Related decisions: E7.
- Owner approval: E8.
- Implementation state and roles: E9.
- Revisit triggers and remaining uncertainty: E10.
