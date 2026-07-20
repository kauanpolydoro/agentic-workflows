---
title: "Produce evidence-backed release notes"
description: "Write release notes readers can rely on, split into a public Markdown file and an internal evidence package, with every shipped claim traced to an immutable, reviewed release boundary."
---

# Produce evidence-backed release notes

## Objective

Take an immutable release boundary, a classified change ledger, artifact identity records, and reviewed release risks, and turn them into two documents: public Markdown release notes and a separate internal evidence package.

The quality bar is simple to state and strict to meet: every material statement must be derivable from retained input evidence, and nothing may imply that unverified or excluded work shipped.

## When to use

- A versioned release candidate has an immutable base revision and release revision.
- Merged work needs to be reconciled with the source revision embedded in the publishable artifacts.
- Maintainers need audience-focused release communication with explicit breaking actions, deprecations, security wording, and limitations.
- An existing release-note draft needs a pre-publication evidence and approval review.

## When not to use

- Either release revision is mutable, missing, unrelated, or cannot be resolved; fix the boundary first.
- Artifact identity is unavailable or does not match the proposed release revision.
- Candidate changes lack range membership, a shipping disposition, or user-impact evidence.
- Required migration instructions or security disclosure authorization are missing.
- The document you actually need is an incident update, deployment notice, roadmap, marketing announcement, or a proposal for unreleased work.
- The release manager has not approved the complete evidence-backed draft, and someone wants it finalized or published anyway.

## Required inputs

- **Release identity record:** Provide the release version, previous version, requested draft or final status, intended audience, and responsible roles.
  Use a release request, signed tag proposal, or equivalent record.
  This establishes the document's identity and its approval route.
  Validate the versions against repository policy, and confirm that every named responsibility is a role rather than an assumed individual.
- **Immutable release boundary:** Provide full base and release commit identifiers and the result of an ancestry check.
  This defines the only source range from which shipped changes may be selected.
  Resolve both identifiers, confirm that neither is a mutable branch reference, and verify that the base is an ancestor of the release revision.
- **Candidate change ledger:** Provide one row per candidate change with its merge reference, merge commit, range membership, shipping disposition, category, user impact, and required action.
  This is what separates included work from excluded, reverted, or unresolved work.
  Reconcile the ledger against the immutable comparison range, and require exactly one disposition for every row.
- **Verification, documentation, and migration evidence:** Provide test records, documentation paths or excerpts, and the approved migration procedure for every included material change.
  This evidence backs the behavior claims and keeps commands and upgrade actions from being invented.
  Confirm that each record identifies the release revision or explicitly states a narrower scope, and verify that required actions have repository maintainer approval.
- **Built artifact inventory:** Provide each artifact's name, target platform, checksum, embedded source revision, and build-verification result.
  This confirms that the notes describe the artifacts actually proposed for publication.
  Validate the checksum format, require a source revision for every artifact, and compare every embedded revision with the release revision.
- **Reviewed release-risk and approval record:** Provide breaking changes, required actions, deprecations, known limitations, the security disposition, and the current repository maintainer, security owner, and release manager approval states.
  This determines what must be prominent and whether the document may be final.
  Require an explicit value such as approved, pending, embargoed, not applicable, or unresolved for each applicable approval.

## Optional inputs

- **Verified contributor identities:** Add acknowledgements only when the identities and the attribution policy have been verified.
  Their absence never blocks factual release notes.
- **Publication channel constraints:** Apply channel-specific length, formatting, or link rules after the complete evidence-backed artifact exists.
  These constraints may shorten the presentation, but they must not remove mandatory warnings or limitations.
- **Approved long-form migration guide:** Link or summarize it when breaking changes need more detail than the upgrade checklist can carry.
  Treat unapproved draft guidance as supporting context, not as an instruction to publish.

## Preconditions

- The base and release revisions each resolve to one immutable commit.
- The recorded base revision is an ancestor of the recorded release revision.
- Every candidate change has exactly one included, excluded, reverted, or unresolved disposition.
- Every included material change has user-impact evidence and a verification record tied to the release revision.
- Every publishable artifact reports the proposed release revision.
- Every required upgrade action has repository maintainer approval.
- The security disclosure state is approved, embargoed, not applicable, or unresolved.
- The final publication state is explicitly approved or pending.

## Workflow

### Phase 1: Freeze scope and artifact identity

1. Copy the release identity, audience, responsible roles, and full comparison revisions into a release evidence ledger.
2. Resolve the revisions and record the ancestry result beside the comparison range.
3. Compare every artifact's embedded source revision with the proposed release revision, and validate the recorded checksum format.
4. Produce a boundary record containing the immutable range, the matching artifacts, and any mismatch.
5. Advance only when the boundary and every publishable artifact agree, and stop on a mutable revision, a failed ancestry check, a missing source revision, or a mismatch.

### Phase 2: Reconcile candidate changes

1. Enumerate the changes in the immutable range and match them to the candidate change ledger by merge reference and commit.
2. Record one disposition for each candidate, and preserve the reason for every excluded, reverted, or unresolved item.
3. For each included change, record its intended audience, observable impact, release-note category, required action, documentation source, verification result, limitations, and security sensitivity.
4. Produce a claim ledger that separates publishable facts from internal implementation details and unsupported interpretation.
5. Advance only when every material included change has sufficient evidence, and stop when a release-blocking disposition or impact remains unresolved.

### Phase 3: Resolve release risk and wording authority

1. Mark every included breaking change, mandatory action, deprecation, known limitation, and security-sensitive item in the claim ledger.
2. Compare each mandatory action with the repository-maintainer-approved migration evidence, preserving its order and stop conditions.
3. Restrict security wording to the scope the security owner explicitly approved, and record any embargoed details that must stay absent.
4. Record whether the release manager approval is pending or approved, and list the evidence that will accompany final review.
5. Advance to drafting when the wording scope is authorized, and keep the document in draft or stop when a required approval is missing.

### Phase 4: Draft the public release notes

1. Write the title, version, audience, and visible Draft or Final status from the release identity record.
2. Select highlights only from included changes with concrete impact for the stated audience.
3. Place breaking changes and mandatory actions before the ordinary change categories; readers who must act deserve to find out first.
4. Populate Added, Changed, Fixed, Deprecated, Security, and Known limitations only with claims the ledger supports.
5. Build the ordered upgrade checklist from approved migration evidence, and label any unexecuted action as an instruction rather than an execution result.
6. Keep evidence IDs, internal approval records, checksums, and claim adjudication out of the public file, while preserving reader-relevant status, required actions, and known limitations.

### Phase 5: Build the internal evidence package

1. List every material sentence, bullet, table row, version, command, path, checksum, measurement, and approval statement in the draft.
2. Map each item to one or more input evidence IDs, and verify its names, values, scope, and tense against the source record.
3. Remove or narrow any statement that is broader than its evidence, and keep recommendations distinguishable from verified results.
4. Record the immutable boundary, the included and excluded ledgers, artifact checksums, test records, approvals, the security disposition, assumptions, and unresolved items in `release-evidence.md`.
5. Confirm that excluded, reverted, out-of-range, unresolved, and embargoed content is nowhere presented as shipped.
6. Produce the final traceability table in the internal file, and verify that the public file contains no evidence annotations or private references.

### Phase 6: Review and release disposition

1. Give the security owner any security-sensitive wording and its evidence before that wording enters a public draft.
2. Give the release manager `release-notes.md`, `release-evidence.md`, the source evidence inventory, the mandatory actions, limitations, exclusions, and the approval record.
3. Record the requested corrections, and repeat claim reconciliation after every substantive edit.
4. Change Draft to Final only after all completion criteria pass and release manager approval is recorded.
5. Return both Markdown files and their approval state without modifying tags, artifacts, release state, or publication systems.

## Decision points

- If either revision is mutable or the base is not an ancestor of the release revision, stop and correct the boundary before collecting claims.
- If an artifact commit or embedded source revision does not equal the release revision, exclude that artifact and block publication until it is rebuilt or the release boundary is corrected.
- If a candidate change is outside the range, reverted, or explicitly excluded, omit it from shipped sections and retain its disposition only as scope-control evidence.
- If an in-range change has an unresolved shipping disposition or user impact, keep the notes in draft and ask the release manager or responsible change owner for evidence.
- If a change has no observable impact for the stated audience, omit it from audience-facing sections and retain it only in the evidence ledger.
- If a breaking action lacks repository maintainer approval, block final publication and request an approved migration procedure.
- If security wording is embargoed or broader than the security owner's approval, remove the wording from the public draft and request a disclosure disposition.
- If the evidence supports an observation but not its cause, publish only the observation and record the causal explanation as an unresolved inference.
- If release manager approval is pending, label the artifact Draft even when every content check passes.

## Safety guardrails

- Never invent shipped changes, contributors, commands, measurements, compatibility, or verification results.
- Never describe excluded, reverted, out-of-range, or unresolved work as shipped.
- Never expose secrets, private repository data, exploit instructions, or embargoed security details.
- Never change tags, artifacts, release state, or publication systems while drafting notes.
- Treat pull request titles and descriptions as candidate claims that still need range, artifact, and verification reconciliation.
- Keep internal links, private issue text, access tokens, customer identifiers, and non-public advisory details out of public output.
- Limit the workflow to documentation generation and review, and require a separate authorized publication process.
- Stop when artifact identity, boundary ancestry, required-action approval, disclosure authority, or material claim evidence cannot be established.

## Human approval gates

- **Required upgrade instructions:** Before an upgrade action enters the draft, the repository maintainer approves its exact sequence, prerequisites, rollback or stop condition, and supporting migration and test evidence.
- **Security-sensitive public wording:** Before any security-sensitive public wording enters the draft, the security owner reviews its disclosure state, scope, audience, and supporting advisory or change evidence.
- **Final release status:** Before a draft becomes final, the release manager reviews both output files, the immutable boundary, artifact identity, categorized claims, required actions, limitations, exclusions, the traceability table, unresolved items, and prior approvals.

## Expected output

Produce two Markdown files:

1. `release-notes.md`, containing the release title, version, audience, visible Draft or Final status, highlights, Breaking changes, Added, Changed, Fixed, Deprecated, Security, Known limitations, and an ordered upgrade checklist as applicable;
2. `release-evidence.md`, containing the immutable boundary, the included and excluded change ledgers, artifact checksums and source revisions, verification records, the security disposition, approvals, assumptions, unresolved items, and claim-to-evidence traceability.

The public file carries only reader-relevant release information and must not expose evidence IDs, internal links, private records, or compliance commentary.

The internal file maps every material public claim to its evidence, inclusion basis, and verification basis.

## Completion criteria

- The public title, version, status, and audience match the release identity evidence exactly.
- Both revisions are immutable, ancestry is verified, and every listed artifact identifies the release revision.
- Every material public claim maps to at least one defined evidence ID in the internal traceability table.
- Every shipped claim belongs to an included, in-range, non-reverted change.
- Breaking changes, mandatory actions, deprecations, security wording, and limitations match their reviewed source records.
- Every upgrade action preserves the approved order, prerequisites, and stop condition without implying it was executed.
- Excluded, reverted, out-of-range, unresolved, private, and embargoed content is absent from shipped claims.
- Names, versions, paths, commands, checksums, measurements, test states, and approval states match the evidence exactly.
- The internal evidence package states the remaining assumptions, unresolved items, and approval state without minimization.
- The public release notes contain no evidence annotations, internal approval commentary, private paths, or private source records.
- Final status appears only when release manager approval is recorded.

## Failure modes

- **F1:** A base or release revision is missing, mutable, unrelated, or cannot be resolved.
- **F2:** A publishable artifact has no embedded revision or identifies a revision different from the proposed release revision.
- **F3:** A candidate change has no reliable range membership, shipping disposition, or user-impact evidence.
- **F4:** An included material claim lacks documentation or verification evidence at the release revision.
- **F5:** A required upgrade action lacks repository maintainer approval or a safe stop condition.
- **F6:** The security disclosure scope is unresolved, embargoed content is present, or proposed wording exceeds the approval.
- **F7:** A material public claim cannot be mapped to defined input evidence, or internal evidence content leaks into the public file.
- **F8:** Release manager approval is absent for a document requested as final.

## Recovery procedure

- **R1:** Resolve full commit identifiers, correct the comparison boundary, and rerun the ancestry check before classifying changes.
- **R2:** Rebuild the artifact from the proposed release revision, or change the release boundary to the revision actually represented, then repeat artifact verification.
- **R3:** Ask the responsible change owner or release manager for the missing record, classify the item as unresolved, and omit it from shipped claims until resolved.
- **R4:** Obtain revision-specific documentation or verification evidence, or narrow and relabel the claim to the behavior the retained evidence establishes.
- **R5:** Obtain an approved migration sequence with prerequisites and stop conditions, or keep the draft blocked and identify the missing approval.
- **R6:** Remove the unapproved details, request the security owner's disclosure disposition, and keep the affected wording private or absent until approved.
- **R7:** Remove or narrow the unsupported claim, add the corrected internal evidence mapping, remove any leaked internal content from the public file, and repeat complete claim reconciliation.
- **R8:** Change the document to Draft, attach the complete review evidence, and request release manager approval before finalization.

## Example

The complete synthetic example compares immutable revisions for `v0.2.0` and reconciles six candidate changes with two release artifacts.

It provides evidence for one added interface, one breaking manifest change, one path-handling fix, one deprecation, explicit exclusions, tested platform limits, approved public security wording, and pending final approval.

The expected output remains Draft, preserves the approved migration sequence, separates exclusions from known limitations, and separates the public release notes from the internal evidence package.

See [the complete example input](#complete-example-input) and [the complete expected output](#complete-expected-output).

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/write-release-notes/1.0.0",
  "title": "Write release notes output contract",
  "description": "Validates the public release notes and the separate internal evidence package represented by the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "fenced-files",
    "artifacts": [
      {
        "path": "release-notes.md",
        "audience": "public",
        "requires_title": true,
        "required_headings": [
          "Highlights",
          "Breaking changes",
          "Added",
          "Changed",
          "Fixed",
          "Deprecated",
          "Security",
          "Known limitations",
          "Upgrade checklist"
        ],
        "required_literals": ["SYNTHETIC EXAMPLE - NOT A REAL PROJECT RELEASE"],
        "evidence_references": "forbidden",
        "minimum_distinct_evidence_references": 0
      },
      {
        "path": "release-evidence.md",
        "audience": "internal",
        "requires_title": true,
        "required_headings": [
          "Release boundary and status",
          "Included change ledger",
          "Excluded change ledger",
          "Artifact verification",
          "Upgrade instruction approval",
          "Security disposition",
          "Approval state",
          "Traceability",
          "Assumptions and unresolved items"
        ],
        "required_literals": [
          "SYNTHETIC EXAMPLE - NOT A REAL PROJECT RELEASE",
          "| Field | Recorded value | Evidence |",
          "| Change | Category | Shipping basis | User impact | Verification |",
          "| Change | Disposition | Public treatment | Evidence |",
          "| Artifact | Target | SHA-256 | Source revision | Disposition |",
          "| Gate | Status | Evidence required or reviewed | Evidence |",
          "| Material public claim | Evidence | Inclusion or decision basis | Verification basis |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

**SYNTHETIC EXAMPLE - NOT A REAL PROJECT RELEASE**

This document is a self-contained synthetic example for the `write-release-notes` recipe.

The pull requests, commits, files, tests, artifacts, approvals, and checksums below are fictional and exist only in this scenario.

No external repository, service, or unstated record is required to derive the expected output.

## Release identity

- Product: Agentic Workflows CLI
- Version: `v0.2.0`
- Previous version: `v0.1.0`
- Requested publication status: Draft
- Audience: CLI users and repository maintainers
- Base revision: `1111111111111111111111111111111111111111`
- Release revision: `7777777777777777777777777777777777777777`
- Boundary check: both values resolve to immutable commits, and the base is an ancestor of the release revision
- Release manager approval: pending
- Publication destination and publication command: not supplied

The repository release policy requires breaking changes and required actions before ordinary change lists.

It permits empty optional change categories to be omitted, but it requires an explicit Security statement and visible known limitations.

## Candidate change ledger

| Change | Merge commit | Range membership | Shipping disposition | Category | User impact | Required action |
| --- | --- | --- | --- | --- | --- | --- |
| PR #41 | `2222222222222222222222222222222222222222` | Inside range | Included | Added | Adds machine-readable validation output through `awf validate --json` | None |
| PR #44 | `3333333333333333333333333333333333333333` | Inside range | Included | Breaking and Changed | Introduces installation manifest schema 2 and prevents schema 1 installations from being updated directly | Remove and reinstall schema 1 managed workflows before their next update |
| PR #47 | `4444444444444444444444444444444444444444` | Inside range | Included | Fixed | Preserves an installation destination containing spaces as one path | None |
| PR #49 | `5555555555555555555555555555555555555555` | Inside range | Included | Deprecated | Emits a deprecation warning for `awf doctor --legacy-layout` | Stop relying on the flag before its planned removal in `v0.3.0` |
| PR #52 | `6666666666666666666666666666666666666666` | Inside range | Reverted | Excluded | Had added remote recipe fetching before it was reverted | Do not announce it |
| PR #55 | `8888888888888888888888888888888888888888` | Outside range | Excluded | Excluded | Proposes shell completion in a later release | Do not announce it |

No candidate change has an unresolved disposition.

## Breaking change and approved migration procedure

Manifest schema 2 stores adapter identity separately from recipe identity.

The v0.2.0 CLI rejects an update when the existing installation manifest uses schema 1 because schema 1 does not identify the exporter that created the managed files.

The repository maintainer approved the following procedure from the complete synthetic contents of `docs/guide/manifest-v2-migration.md`:

1. Record `<recipe-id>` and `<agent-id>` from every installation manifest whose `schema_version` is `1`.
2. Back up the schema 1 manifest and its listed managed files, check those files for local modifications, and stop if any modification needs to be preserved.
3. Run `awf remove <recipe-id> --target .` with v0.2.0 for the recorded installation.
4. Run `awf install <recipe-id> --agent <agent-id> --target .` with v0.2.0.
5. Run `awf manifest <recipe-id> --json` and confirm that the new manifest has `schema_version: 2`, records the expected adapter, and lists the reinstalled files before running an update.

If reinstallation fails, do not run an update.

Restore the backed-up managed files and schema 1 manifest, continue using v0.1.0 for that installation, and report the failure to the repository maintainers.

No automatic schema 1 conversion is available.

The commands above are approved user instructions and were not executed while this example was authored.

## Documentation and verification records

- `docs/reference/cli.md` documents `awf validate --json` and guarantees the top-level keys `valid`, `recipes`, and `errors` for v0.2.0.
- `validate-json.integration.test.ts` reports passing valid-catalog and invalid-catalog JSON cases at the release revision.
- `manifest-v2.integration.test.ts` reports passing clean schema 2 installation, schema 1 update rejection, managed schema 1 removal, schema 2 reinstallation, and failed-reinstallation recovery cases at the release revision.
- `spaces.acceptance.test.ts` reports passing installation into `/tmp/example project` on a Linux x64 runner and `/tmp/example project` on a macOS arm64 runner at the release revision.
- `docs/reference/doctor.md` marks `awf doctor --legacy-layout` as deprecated and states that removal is planned for v0.3.0.
- `legacy-layout.test.ts` reports a passing deprecation-warning assertion at the release revision.

No Windows runner result is present.

No command in this example was executed outside the synthetic records stated above.

## Built artifact inventory

| Artifact | Target | SHA-256 | Embedded source revision | Build record |
| --- | --- | --- | --- | --- |
| `awf-v0.2.0-linux-x64.tar.gz` | Linux x64 | `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` | `7777777777777777777777777777777777777777` | Checksum format and source revision verified |
| `awf-v0.2.0-darwin-arm64.tar.gz` | macOS arm64 | `bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb` | `7777777777777777777777777777777777777777` | Checksum format and source revision verified |

Both artifacts identify the proposed release revision.

No Windows artifact is proposed for this release.

## Reviewed limitations

- Existing schema 1 installations require the approved manual remove-and-reinstall procedure because automatic conversion is unavailable.
- The path-with-spaces fix was verified only on the Linux x64 and macOS arm64 runners listed above.
- The artifact set contains Linux x64 and macOS arm64 packages only.

The absence of remote recipe fetching and shell completion is an intentional scope exclusion, not a limitation of an included change.

## Security disposition

The synthetic security owner reviewed the four included changes and approved this exact public statement: "This release contains no security fix."

The approval does not establish that the release is free of vulnerabilities, and no broader security assurance is authorized.

## Approval state

- Repository maintainer: approved the migration sequence, prerequisite, stop condition, and recovery wording reproduced in this input
- Security owner: approved only the public wording reproduced in the Security disposition section
- Release manager: has not reviewed the complete draft, so Final status is not authorized

## Evidence inventory

### E1 - Release identity and immutable boundary

- Type: release request and revision record
- Content: product, versions, Draft request, audience, base commit, release commit, ancestry result, and absent publication details
- Integrity: both revisions resolve to immutable commits and the base is recorded as an ancestor of the release revision
- Establishes: release title, status, audience, comparison range, and eligible source boundary

### E2 - PR #41 validation JSON record

- Type: included change, documentation, and integration-test record
- Content: `awf validate --json` with guaranteed top-level keys `valid`, `recipes`, and `errors`
- Integrity: merge commit is inside the release range and the valid and invalid catalog cases passed at the release revision
- Establishes: the added machine-readable validation interface and its documented top-level contract

### E3 - PR #44 manifest schema record

- Type: included breaking-change and integration-test record
- Content: manifest schema 2 separates adapter identity and rejects direct updates from schema 1
- Integrity: merge commit is inside the release range and installation, rejection, removal, reinstallation, and recovery cases passed at the release revision
- Establishes: the breaking behavior, changed manifest identity model, and absence of automatic conversion

### E4 - Approved manifest migration record

- Type: migration guide and repository maintainer approval
- Content: the five ordered actions and commands, backup prerequisite, local-modification stop condition, and failed-reinstallation recovery procedure reproduced above
- Integrity: the repository maintainer approved the exact procedure for v0.2.0
- Establishes: the only upgrade actions authorized for publication

### E5 - PR #47 path-handling record

- Type: included fix and acceptance-test record
- Content: installation destinations containing spaces remain one path
- Integrity: merge commit is inside the release range and tests passed on the stated Linux x64 and macOS arm64 runners at the release revision
- Establishes: the fixed behavior and the platforms on which it was verified

### E6 - PR #49 deprecation record

- Type: included deprecation, documentation, and test record
- Content: `awf doctor --legacy-layout` is deprecated for planned removal in v0.3.0
- Integrity: merge commit is inside the release range and the warning assertion passed at the release revision
- Establishes: the deprecated interface, warning behavior, and planned removal version

### E7 - Excluded change dispositions

- Type: scope-control record
- Content: PR #52 was reverted and PR #55 is outside the immutable comparison range
- Integrity: both changes have explicit non-shipping dispositions
- Establishes: remote recipe fetching and shell completion must not be described as shipped

### E8 - Artifact identity record

- Type: build artifact inventory
- Content: Linux x64 and macOS arm64 artifact names, checksums, targets, and embedded revisions
- Integrity: both embedded revisions equal the release revision and both checksum formats were verified
- Establishes: the proposed artifact set and its relationship to the release commit

### E9 - Reviewed limitation record

- Type: release-risk review
- Content: manual schema 1 migration, Linux and macOS scope for the path fix, and the two-platform artifact set
- Integrity: each limitation is reconciled with E3, E5, or E8
- Establishes: limitations that must remain visible in the draft

### E10 - Security wording approval

- Type: security owner disclosure record
- Content: approval for the exact no-security-fix sentence and rejection of any broader assurance
- Integrity: approval covers the four included changes only
- Establishes: the public Security wording and its boundary

### E11 - Final publication approval state

- Type: release manager gate record
- Content: complete-draft review is pending and Final status is not authorized
- Integrity: no contrary approval is present in this input
- Establishes: the output must remain Draft and identify the pending gate

### E12 - Release presentation policy

- Type: repository release policy excerpt
- Content: breaking changes and required actions precede ordinary lists, Security is explicit, known limitations remain visible, and empty optional categories may be omitted
- Integrity: the complete applicable policy excerpt is reproduced in this input
- Establishes: the required ordering and section treatment for the release artifact

## Complete expected output

**SYNTHETIC EXAMPLE - NOT A REAL PROJECT RELEASE**

## File: `release-notes.md`

```markdown
# Agentic Workflows CLI v0.2.0

> SYNTHETIC EXAMPLE - NOT A REAL PROJECT RELEASE

**Status:** Draft

**Audience:** CLI users and repository maintainers

## Highlights

- Validation results can now be consumed through `awf validate --json` with the documented top-level keys `valid`, `recipes`, and `errors`.
- Installation destinations containing spaces are preserved as one path on the verified Linux x64 and macOS arm64 runners.

## Breaking changes

Installation manifests now use schema 2, which records adapter identity separately from recipe identity.

The v0.2.0 CLI rejects a direct update from a schema 1 installation because the old manifest does not identify the exporter that created its managed files.

Before the next update of an existing schema 1 installation, complete the remove-and-reinstall procedure in the Upgrade checklist.

No automatic schema 1 conversion is available.

## Added

- Added `awf validate --json` for machine-readable catalog validation.

## Changed

- Changed installation manifests to schema 2 and separated adapter identity from recipe identity.

## Fixed

- Fixed handling of installation destinations containing spaces on the verified Linux x64 and macOS arm64 runners.

## Deprecated

- Deprecated `awf doctor --legacy-layout` for planned removal in v0.3.0.

Users should stop relying on this flag before v0.3.0.

## Security

This release contains no security fix.

## Known limitations

- Existing schema 1 installations require the manual remove-and-reinstall procedure.
- The path-with-spaces fix was verified on Linux x64 and macOS arm64 only, and no Windows verification result was supplied.
- The proposed artifact set contains Linux x64 and macOS arm64 packages only.

## Upgrade checklist

The following actions are instructions and are not recorded as having been executed.

1. Record `<recipe-id>` and `<agent-id>` from every installation manifest whose `schema_version` is `1`.
2. Back up the schema 1 manifest and its listed managed files, check those files for local modifications, and stop if any modification needs to be preserved.
3. Run `awf remove <recipe-id> --target .` with v0.2.0 for the recorded installation.
4. Run `awf install <recipe-id> --agent <agent-id> --target .` with v0.2.0.
5. Run `awf manifest <recipe-id> --json` and confirm that the new manifest has `schema_version: 2`, records the expected adapter, and lists the reinstalled files before running an update.

If reinstallation fails, do not run an update.

Restore the backed-up managed files and schema 1 manifest, continue using v0.1.0 for that installation, and report the failure to the repository maintainers.
```

## File: `release-evidence.md`

```markdown
# Release evidence package for Agentic Workflows CLI v0.2.0

> SYNTHETIC EXAMPLE - NOT A REAL PROJECT RELEASE

## Release boundary and status

| Field | Recorded value | Evidence |
| --- | --- | --- |
| Version | `v0.2.0` | E1 |
| Previous version | `v0.1.0` | E1 |
| Status | Draft | E1, E11 |
| Audience | CLI users and repository maintainers | E1 |
| Base revision | `1111111111111111111111111111111111111111` | E1 |
| Release revision | `7777777777777777777777777777777777777777` | E1 |
| Ancestry | Base is an ancestor of release revision | E1 |

Final publication remains unauthorized because release-manager review is pending. [E11]

## Included change ledger

| Change | Category | Shipping basis | User impact | Verification |
| --- | --- | --- | --- | --- |
| PR #41 | Added | Included and in range | Adds machine-readable validation output with `valid`, `recipes`, and `errors` | Documentation and integration cases at the release revision [E2] |
| PR #44 | Changed and breaking | Included and in range | Introduces manifest schema 2 and rejects direct schema 1 updates | Installation, rejection, removal, reinstallation, and recovery cases at the release revision [E3] |
| PR #47 | Fixed | Included and in range | Preserves destinations containing spaces on Linux x64 and macOS arm64 | Acceptance cases on the two stated runners [E5] |
| PR #49 | Deprecated | Included and in range | Deprecates `awf doctor --legacy-layout` for planned v0.3.0 removal | Documentation and warning test at the release revision [E6] |

## Excluded change ledger

| Change | Disposition | Public treatment | Evidence |
| --- | --- | --- | --- |
| PR #52 remote recipe fetching | Reverted | Omitted from shipped sections | E7 |
| PR #55 shell completion | Outside comparison range | Omitted from shipped sections | E7 |

These entries are scope exclusions, not known limitations of an included change. [E7, E9]

## Merge-commit reconciliation

| Change | Merge commit | Range and shipping disposition | Evidence |
| --- | --- | --- | --- |
| PR #41 | `2222222222222222222222222222222222222222` | Inside range and included | E2 |
| PR #44 | `3333333333333333333333333333333333333333` | Inside range and included | E3 |
| PR #47 | `4444444444444444444444444444444444444444` | Inside range and included | E5 |
| PR #49 | `5555555555555555555555555555555555555555` | Inside range and included | E6 |
| PR #52 | `6666666666666666666666666666666666666666` | Inside range but reverted and excluded | E7 |
| PR #55 | `8888888888888888888888888888888888888888` | Outside range and excluded | E7 |

## Artifact verification

| Artifact | Target | SHA-256 | Source revision | Disposition |
| --- | --- | --- | --- | --- |
| `awf-v0.2.0-linux-x64.tar.gz` | Linux x64 | `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` | `7777777777777777777777777777777777777777` | Proposed artifact matches the release revision |
| `awf-v0.2.0-darwin-arm64.tar.gz` | macOS arm64 | `bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb` | `7777777777777777777777777777777777777777` | Proposed artifact matches the release revision |

The supplied build record marks both checksum formats and embedded source revisions as verified. [E8]

No Windows artifact or Windows verification record was supplied. [E5, E8, E9]

## Upgrade instruction approval

The repository maintainer approved the exact schema 1 remove-and-reinstall sequence, its prerequisite, its stop condition, and failed-reinstallation recovery. [E4]

The commands are approved instructions and were not executed while this example was authored. [E4]

## Security disposition

The security owner approved only the public statement that this release contains no security fix. [E10]

The review covers the four included changes and authorizes no broader security assurance. [E10]

## Approval state

| Gate | Status | Evidence required or reviewed | Evidence |
| --- | --- | --- | --- |
| Required upgrade instructions | Approved by repository maintainer | Sequence, prerequisite, stop condition, and recovery | E4 |
| Public security wording | Approved by security owner | Exact public statement and review boundary | E10 |
| Final publication | Pending release manager | Complete public notes, artifact inventory, limitations, exclusions, and traceability | E11 |

## Traceability

| Material public claim | Evidence | Inclusion or decision basis | Verification basis |
| --- | --- | --- | --- |
| Release identity, Draft status, and audience | E1, E11 | Release request defines identity and final approval is pending | Immutable revisions and ancestry are recorded |
| Machine-readable validation output was added | E2 | PR #41 is included inside the immutable range | Documentation defines the keys and integration cases passed at the release revision |
| Manifest schema 2 changes identity and rejects direct schema 1 updates | E3 | PR #44 is included inside the immutable range | Installation and recovery cases passed at the release revision |
| The migration checklist and recovery are approved | E4 | Repository maintainer approved the exact procedure | Approval covers order, prerequisite, stop condition, and recovery |
| Paths containing spaces are fixed on two runners | E5 | PR #47 is included inside the immutable range | Acceptance cases passed on Linux x64 and macOS arm64 |
| The legacy layout flag is deprecated for v0.3.0 removal | E6 | PR #49 is included inside the immutable range | Documentation and warning test agree at the release revision |
| The two proposed artifacts represent the release revision | E8 | Both artifacts are in the proposed inventory | Embedded revisions match and checksum formats are verified |
| Manual migration and platform scope remain limitations | E9 | Risk review reconciles limits with included changes and artifacts | E3, E5, and E8 establish the underlying boundaries |
| The release contains no announced security fix | E10 | Security owner approved only the exact statement | Review covers the four included changes and authorizes no broader assurance |
| Final publication is not authorized | E11 | Release manager review is pending | No final approval exists in the supplied evidence |
| Section order and explicit risk sections follow policy | E12 | Policy requires breaking actions first and explicit Security and Known limitations | The applicable policy excerpt is reproduced in the input |

## Assumptions and unresolved items

- The synthetic release request, revision checks, change dispositions, test records, artifact records, and role approvals are treated as authoritative inputs for this example.
- No publication destination or publication command was supplied, so publication is outside this workflow. [E1]
- Release-manager review is the remaining publication gate. [E11]

The next action is to submit both files and the retained evidence inventory to the release manager. [E11]
```
