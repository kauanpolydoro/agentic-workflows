# Synthetic release evidence for Agentic Workflows v0.2.0

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
