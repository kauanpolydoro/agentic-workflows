# Synthetic release-note delivery bundle

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
