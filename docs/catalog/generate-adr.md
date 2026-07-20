---
title: "Record an evidence-backed architecture decision"
description: "Write an ADR worth trusting, one that separates facts from assumptions, compares real options on the same criteria, records who approved it, and says when to revisit it."
---

# Record an evidence-backed architecture decision

## Objective

Turn a stable architecture question, attributable evidence, and an accountable approval state into a complete decision record: comparable alternatives, explicit consequences, owned follow-up work, and measurable revisit triggers.
Above all, the ADR must keep six things visibly apart: observed facts, assumptions, preferences, recommendations, approvals, and implementation work that has not happened yet.

## When to use

- A choice has durable consequences for system boundaries, data ownership, integration contracts, operational dependencies, security posture, or several consumers.
- At least two viable alternatives can be evaluated against the same decision drivers.
- You need to propose a decision, retain an approved one, reject a proposal, or explicitly supersede a related ADR.

## When not to use

- The problem boundary, mandatory constraints, affected systems, or accountable owner role is still unknown; frame the question first.
- The choice is local, cheap, and easily reversible, and does not constrain future work; an ADR would be ceremony.
- The real goal is to rationalize a preselected option while withholding a viable alternative or a material disadvantage.
- Nobody can supply retained owner evidence, so the record cannot honestly be marked Accepted, Rejected, or Superseded.
- The document you actually need is an incident record, implementation plan, API specification, or security exception process.

## Required inputs

- **Stable decision boundary, affected systems, current state, and explicit exclusions:** state exactly one decision, what changes if it is made, which systems and consumers are affected, and which adjacent questions remain out of scope.
  This keeps one ADR from hiding several unrelated choices.
  Validate the boundary with repository evidence and the accountable owner before comparing options.
- **Attributable facts, constraints, assumptions, open questions, and decision drivers:** identify the source and integrity of each fact, distinguish mandatory constraints from preferences, label every assumption, and list unresolved questions.
  These inputs explain what can eliminate or favor an option.
  Do not let an unsupported preference dress up as a constraint.
- **Viable alternatives evaluated against common criteria with concrete disadvantages:** provide at least two genuinely possible options, including no change when it is credible, and apply the same defined criteria to each.
  Each option needs positive, negative, transition, and operational consequences.
  Check that no option was intentionally underspecified to manufacture a preferred result.
- **Accountable decision owner, approval state, related decisions, and supersession relationship:** provide the approving role, the exact current status, retained review or approval evidence, and links or identifiers for related ADRs.
  Status must remain Proposed while approval is absent.
  Supersession requires an explicit old-to-new relationship and a migration consequence.

## Optional inputs

- Reproducible benchmarks, incident records, cost models, or security reviews strengthen a driver when their methods, scope, and provenance are retained.
  Without that, label the statement as an assumption or leave it out.
- Reversible experiment results can reduce uncertainty, as long as a pilot is not converted into production proof.
- Implementation sequencing and migration constraints make consequences actionable, but they never prove that implementation occurred.

## Preconditions

- One accountable architecture decision owner role is identified.
- The decision boundary is stable enough to compare at least two viable alternatives.
- Facts, constraints, preferences, assumptions, and unknowns are separately identifiable.
- Every mandatory criterion has a validation method or an explicit evidence gap.
- Existing related decisions have been searched, and any conflict or supersession relationship is known.

## Workflow

### Phase 1 - Frame the decision

1. Write a one-sentence decision question, then the affected systems, current state, desired outcome, and exclusions.
   Assign a provisional ADR identifier only through the repository's naming convention.
   Advance when the owner role confirms this is one durable decision; stop and split a compound question.
2. Build an evidence ledger that separates facts, mandatory constraints, preferences, assumptions, and open questions.
   Record source IDs and note any sensitivity or publication restriction.
   Advance only when each material context claim can be sourced or is explicitly labeled as an assumption.
3. Search related ADRs, architecture documents, contracts, and active migrations.
   Record whether the new ADR is independent, related, amending, or superseding.
   Stop if an existing accepted decision already governs the boundary and no supersession review is authorized.

### Phase 2 - Compare alternatives

4. Define common criteria before scoring or selecting anything.
   Mark each criterion as mandatory, preferred, or informational, and define what satisfactory evidence looks like.
   Stop if the criteria encode an option's name or cannot be applied consistently.
5. Describe every viable option at comparable depth: ownership, dependencies, operational model, migration effort, reversibility, and material disadvantages.
   Include no change when it remains viable.
   Remove an option only with an explicit constraint-based reason.
6. Evaluate every option against every criterion using evidence, stated inference, or known uncertainty.
   Produce a comparison table and a sensitivity note for the assumptions that could change the result.
   If no option satisfies all mandatory criteria, defer the selection and define the evidence or scope work needed.

### Phase 3 - Record decision and consequences

7. State the recommended or selected option and explain each reason through the decision drivers.
   Keep the status Proposed until retained owner approval exists.
   Do not describe implementation as complete unless separate implementation evidence is supplied.
8. Record immediate and long-term positive, negative, and neutral consequences.
   Include new ownership, coupling, operational burden, migration work, failure modes, and every tradeoff that was explicitly accepted.
   Stop if a known material disadvantage has no disposition.
9. Define follow-up actions with owner roles, dependencies, exit criteria, and verification signals.
   Define rollback or supersession behavior for the implementation when applicable.
   Keep decision completion separate from implementation completion.
10. Define concrete revisit triggers, such as a failed mandatory criterion, a changed constraint, a new consumer class, a cost threshold, an incident pattern, or an unavailable dependency becoming supported.
    Assign the role that decides whether a trigger requires amendment or supersession.

### Phase 4 - Approve and publish

11. Submit the boundary, evidence ledger, common-criteria table, consequences, unknowns, follow-up actions, and revisit triggers to the architecture owner.
    Record the actual decision and status without inventing a date or a consensus.
    If approval is withheld, retain Proposed, or mark Rejected only with explicit evidence.
12. Validate links, identifiers, status, related ADR relationships, sensitive content, and evidence traceability.
    Publish the ADR only when the completion criteria are reviewable and the repository's documentation gate is satisfied.

## Decision points

- If the question contains multiple independently reversible choices, split it into related ADRs before evaluating options.
- If owner approval is absent, retain status Proposed regardless of the author's recommendation or any apparent consensus.
- If no option meets every mandatory constraint, defer the decision and assign evidence or scope work rather than selecting the least incomplete option.
- If a material assumption changes the preferred option, expose that sensitivity and define it as a revisit trigger.
- If an accepted ADR already governs the same boundary, amend or supersede it only after the architecture owner approves the relationship and migration consequences.
- If the rationale contains restricted security or commercial detail, publish a safe summary and retain the sensitive evidence in its approved access-controlled location.

## Safety guardrails

- Never fabricate measurements, dates, consensus, implementation status, or approval.
- Never hide material disadvantages, uncertainty, or a viable alternative to favor one option.
- Never mark an ADR Accepted, Rejected, or Superseded without retained owner evidence.
- Do not expose secrets, exploit details, customer data, or restricted commercial terms in a public ADR.
- Do not present a benchmark beyond its supplied workload, environment, and measurement method.
- Keep the decision boundary narrow enough that one approval has a coherent consequence and rollback story.
- Stop when the ADR is being used to bypass the architecture owner or an applicable security, legal, or operational approval process.

## Human approval gates

- Before marking the ADR Accepted or Rejected, the architecture owner reviews the decision boundary, evidence quality, mandatory criteria, comparable alternatives, consequences, unknowns, and follow-up record, then supplies an attributable disposition.
- Before superseding an existing decision, the architecture owner reviews the old and new boundaries, replacement rationale, compatibility or migration consequences, implementation state, and the links in both records.
- Before publishing sensitive rationale, the information owner reviews the redacted public wording and the retained restricted evidence location.

## Expected output

Produce one complete Proposed, Accepted, Rejected, or Superseded architecture decision record in Markdown.
The record must include:

- the identifier or repository-relative filename when supplied, a precise title, and the actual status;
- the decision boundary, affected systems, current state, exclusions, and related decisions;
- facts, assumptions, open questions, constraints, and decision drivers;
- common criteria and a comparable alternatives table with disadvantages and uncertainty;
- the recommendation or approved decision with evidence-backed rationale;
- positive, negative, and neutral consequences;
- implementation follow-up with owner roles, dependencies, exit criteria, verification signals, and recovery considerations;
- the approval record and any explicitly non-applicable gates;
- measurable revisit and supersession triggers;
- limitations and evidence traceability.

An ADR is complete as a decision artifact even when implementation has not started, provided its status and follow-up state say so explicitly.

## Completion criteria

- Every material context, comparison, and rationale claim maps to evidence or is labeled as an assumption or inference.
- Every viable option is evaluated against the same defined criteria and includes concrete disadvantages.
- The selected status exactly matches retained architecture-owner evidence.
- All known material consequences and uncertainties have a disposition, an owner role, or a revisit trigger.
- Follow-up actions identify dependencies, objective exit criteria, verification signals, and recovery considerations.
- Related decisions and any supersession relationship are explicit and bidirectionally linkable when repository files exist.
- The ADR claims no implementation, measurement, consensus, or approval beyond the supplied evidence.

## Failure modes

- **F1:** No accountable owner can approve the decision boundary.
- **F2:** A compound or changing boundary invalidates the option comparison.
- **F3:** Evidence or common criteria cannot distinguish any viable option while a mandatory uncertainty remains.
- **F4:** A material disadvantage or related accepted decision is discovered after selection.
- **F5:** Approval evidence conflicts with the ADR status or supersession claim.

## Recovery procedure

- **R1:** Keep the record Proposed, identify the governance gap, and resume selection only after an accountable owner role is established.
- **R2:** Restate or split the boundary, rebuild the common criteria, and reevaluate every option before retaining any recommendation.
- **R3:** Record the unresolved uncertainty, assign evidence collection with an exit criterion, and defer the decision rather than fabricate differentiation.
- **R4:** Reopen the comparison, add the consequence or related decision, reassess the selected option, and seek a renewed owner disposition.
- **R5:** Downgrade the status to the strongest supported state, correct the relationship, and republish only after owner evidence reconciles with the record.

## Example

The [synthetic input](#complete-example-input) supplies a stable validation-ownership question, repository facts, common criteria, alternatives, a related-decision search, and explicit architecture-owner approval.
The [complete expected output](#complete-expected-output) is an Accepted ADR that does not claim its follow-up implementation has occurred.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/generate-adr/1.0.0",
  "title": "Architecture decision record output contract",
  "description": "Validates the decision boundary, evidence, common-criteria option analysis, consequences, follow-up, approvals, revisit triggers, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "architecture-decision-record.md",
        "audience": "Architecture owners and repository maintainers",
        "requires_title": true,
        "required_headings": [
          "Status",
          "Decision boundary",
          "Context and evidence",
          "Decision drivers",
          "Options considered",
          "Decision",
          "Consequences",
          "Positive",
          "Negative",
          "Neutral",
          "Implementation follow-up",
          "Approval and related decisions",
          "Revisit triggers",
          "Assumptions and limitations",
          "Evidence traceability"
        ],
        "required_literals": [
          "| Option | Contract consistency | Offline operation | Typed errors | Core boundary | Maintenance and migration | Disposition |",
          "| Action | Owner role | Dependency | Exit criterion | Verification signal | Recovery |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

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

## Complete expected output

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
