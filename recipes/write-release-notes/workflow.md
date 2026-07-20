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

See [the complete example input](./examples/input.md) and [the complete expected output](./examples/expected-output.md).
