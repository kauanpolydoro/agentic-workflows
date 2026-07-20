---
title: "Upgrade dependencies with provenance and rollback"
description: "Deliver a scoped dependency upgrade backed by a reviewed version-range contract, a deterministic lockfile diff, results across the supported environments, and a rollback that has been exercised."
---

# Upgrade dependencies with provenance and rollback

## Objective

This workflow starts from an immutable dependency baseline and attributable vendor evidence.
It ends with a scoped dependency change, a compatibility disposition, a reproducible lockfile diff, a validation record, and an exercised rollback.
One quality constraint governs the whole procedure: no target version, transitive package, runtime claim, behavior claim, or verification result may go beyond the supplied sources and the executed evidence.

## When to use

- Use this workflow when you are upgrading a named direct dependency, or a tightly coupled dependency group, and you know the exact current and target versions.
- Use it for planned maintenance, a supported security remediation, or a compatibility update whose impact can be isolated and tested.
- Use it when the manifest and lockfile are committed, and the supported runtime matrix can be exercised or at least explicitly bounded.

## When not to use

- Do not start while target versions, registry provenance, integrity records, or the complete vendor guidance for the version range are still unavailable.
- Do not combine unrelated major upgrades in one pass; a failure must be attributable to a single package group.
- Do not proceed when the current lockfile cannot install reproducibly, or when baseline failures have no owner and no disposition.
- Do not use this procedure to change the package manager, the registries, runtime support, and application behavior in a single upgrade.
- Do not implement a security upgrade under embargo without the security owner's disclosure and handling procedure.

## Required inputs

- **Immutable manifest and lockfile with package manager, registry, integrity, and exact resolved versions:** provide the file paths and revision, the package-manager version, the configured sources, the direct constraints, the resolved direct and transitive versions, the integrity fields, and an inventory of lifecycle scripts.
  Together, these records establish your supply-chain baseline.
  Validate them with a frozen install and a lockfile inspection at the recorded revision.
- **Exact target versions with complete official release, migration, runtime, security, and license evidence:** retain attributable records for every version between current and target, covering breaking changes, deprecations, supported runtimes, published security boundaries, licenses, and checksums or signatures when they exist.
  This evidence defines your migration obligations and your compatibility limits.
  Stop if it covers only selected changes or cannot be tied to the target artifact.
- **Repository usage inventory, public behavior contract, supported environment matrix, and exact changed-file boundary:** list the imports, API calls, configuration, generated types, plugin integrations, user-visible behavior, supported runtimes, operating systems, and package-manager modes, plus every manifest, lockfile, source, and test path that is permitted to change.
  This inventory is what connects vendor changes to the code that actually consumes them.
  Validate it with repository search and an owner-reviewed support policy.
- **Reproducible baseline commands, approval state, and executable rollback pin:** provide the exact install, build, type, lint, test, smoke, or contract commands with their results, the approver roles that are required, and the method for restoring the prior manifest and lockfile.
  Without a known baseline and a testable rollback, the upgrade cannot be assessed.

## Optional inputs

- An attributable vulnerability advisory can establish the urgency, the affected versions, and the first fixed version.
  Do not infer a security benefit when no advisory or scan evidence is supplied.
- A software composition policy can add gates for licenses, sources, signatures, and install scripts.
- Deployment telemetry can extend verification after merge, as long as it uses comparable pre-change and post-change signals.

## Preconditions

- A frozen install of the current lockfile succeeds, using only approved sources, at the immutable revision.
- Baseline build, type, lint, test, and public behavior checks pass, or each existing failure has an owner and a disposition.
- The complete current-to-target vendor guidance and runtime support evidence are retained.
- The supported environment matrix names every environment that must remain supported.
- The previous manifest and lockfile are retained, and their restoration can be exercised in an isolated worktree.
- Every approval required before implementation is recorded as granted, or the workflow stops at assessment.

## Workflow

### Phase 1 - Freeze the scope and check provenance

1. Record the immutable revision, the exact dependency group, the current and target versions, the motivation, the supported environments, and the exclusions.
   From these, produce an upgrade boundary that names every manifest and lockfile allowed to change.
   Advance only when unrelated package updates can be excluded; otherwise split the work.
2. Run the current frozen install, then inspect the configured registries, integrity data, lifecycle scripts, patches, overrides, and the resolved dependency tree.
   This gives you the source and resolution baseline.
   Stop on an unapproved registry, a missing integrity field, an unexplained script, or a nonreproducible resolution.

### Phase 2 - Map vendor changes to local use

3. Read the complete official release and migration records across the selected version range.
   Record every breaking change, deprecation, runtime requirement, security boundary, license change, and package split in a version-range register.
   Advance only when each record is attributable to the target package; stop on incomplete guidance.
4. Search the manifests, source, tests, configuration, generated artifacts, and plugins for every changed vendor surface.
   Give each vendor change exactly one local disposition: affected with an action, verified unaffected, blocked, or unknown.
   Stop when a mandatory change remains unknown.
5. Establish comparable baseline results for every supported environment and every protected public behavior.
   Retain the commands, versions, exit statuses, test counts, and representative outputs.
   Advance only when the target results can be produced by the same method.

### Phase 3 - Apply the isolated upgrade

6. Obtain any required major-version, runtime, license, or security approval before modifying files.
   Submit the scope, the version-range register, the local usage mapping, the baseline, and the rollback method.
   Stop if any applicable approval is still pending.
7. Update only the approved direct constraints, through the declared package manager, and regenerate the lockfile deterministically.
   Produce a full direct and transitive diff covering added, removed, upgraded, and downgraded packages, plus source, integrity, license, and lifecycle-script changes.
   Stop on an unexpected package, registry, integrity, script, patch, or override change.
8. Apply only the migrations that the version-range register and the local usage mapping justify.
   Keep public behavior stable unless a separately approved contract migration says otherwise.
   Record each changed file by its exact path, together with the vendor item or protected behavior that required it.

### Phase 4 - Verify the result and exercise recovery

9. Run the target install and the complete baseline command matrix in each supported environment.
   Add focused checks for every affected vendor surface, and compare the public outputs with the baseline.
   Stop on a new failure, an unsupported runtime, or an unexplained output difference.
10. In a disposable worktree, restore the prior manifest and lockfile, run a frozen install, confirm the previous resolved tree, and rerun the protected checks.
    Then reapply the upgrade and rerun the target checks.
    Stop delivery when either the restoration or the reapplication cannot reproduce its recorded state.
11. Reconcile source provenance, the lockfile diff, compatibility, licenses, approvals, validation, rollback, and residual risk into one delivery record.
    Name any untested environment or deferred migration as a blocker or an explicit limitation.
    Advance to merge review only when every completion criterion is directly reviewable.

## Decision points

- If the selected target crosses a major-version boundary, require repository maintainer approval before changing the manifest or lockfile.
- If complete vendor guidance or runtime support evidence is unavailable, hold the upgrade and keep the current version rather than inferring compatibility.
- If the regenerated lockfile contains an unexplained package, registry, integrity, lifecycle-script, patch, or override change, restore the prior files and investigate provenance before retrying.
- If a new license falls outside policy, choose an approved dependency tree or obtain legal or compliance owner approval before continuing.
- If the target checks fail in only one supported environment, roll back and either correct the incompatibility or change support explicitly through the platform-owner gate.
- If an urgent security target conflicts with current compatibility, escalate the supported alternatives, the exposure, the temporary controls, and the rollback evidence to the security and repository owners.

## Safety guardrails

- Never use an untrusted registry or accept unexplained source and integrity changes.
- Never hand-edit resolved lockfile data or omit the complete direct and transitive lockfile diff.
- Never disable install-script audit, type, test, signature, or security checks to obtain a passing result.
- Keep credentials, private registry tokens, and embargoed advisory details out of logs and public artifacts.
- Do not fold a package-manager migration, a runtime-support change, unrelated dependency updates, or application features into the scoped upgrade.
- Run install scripts and rollback drills only in an approved isolated environment.
- Stop on unexpected credential prompts, network destinations, postinstall behavior, or artifact mutations outside the package-manager scope.

## Human approval gates

- Before any major-version implementation, the repository maintainer reviews the exact version range, the breaking-change dispositions, the local usage map, the baseline, the changed-file boundary, and the rollback method.
- Before changing supported runtime or platform requirements, the platform owner reviews the consumer impact, the environment results, the communication plan, and the restoration path.
- Before accepting a new dependency license, the legal or compliance owner reviews the package identity, version, transitive path, license text, distribution impact, and available alternatives.
- Before merge, the repository maintainer reviews the final lockfile diff, the target matrix, the public behavior comparison, the rollback drill, and the unresolved risks.

## Expected output

Produce a scoped change set across the manifest, lockfile, source, and tests.
Accompany it with one Markdown upgrade record containing:

- the immutable scope, the current and target versions, the approved sources, and the exclusions;
- a direct and transitive dependency lockfile diff with provenance, integrity, license, and lifecycle-script review;
- a breaking-change, local-usage, compatibility, and license disposition register;
- an exact changed-file mapping from each vendor requirement or protected behavior to its local implementation;
- comparable baseline and target validation results across the supported environments;
- approval evidence, plus any gates that did not apply;
- rollback restoration and reapplication evidence;
- residual risks, limitations, follow-up owners, and exit criteria; and
- traceability from every material conclusion to retained evidence.

Mark a command as executed only when its environment and result are supplied.
Claim a security benefit, runtime compatibility, or license acceptance only when the corresponding evidence exists.

## Completion criteria

- The manifest and lockfile resolve only the approved target tree, from approved sources, with the expected integrity and lifecycle behavior.
- Every vendor change in the selected version range has a local disposition, and every affected usage has an implemented and verified response.
- Baseline and target checks use comparable commands in every retained supported environment.
- Protected public behavior matches the baseline, or has a separately approved migration.
- Every added or changed license has an explicit policy disposition.
- Both the prior-tree restoration and the target reapplication pass in every supported environment, in an isolated worktree.
- All applicable approval gates are retained, and every limitation has an owner role and an exit condition.

## Failure modes

- **F1:** The complete official guidance or the target's runtime support cannot be established.
- **F2:** The target lockfile introduces an unexplained source, integrity, package, script, patch, or override change.
- **F3:** A breaking surface the repository actually uses has no safe migration, or public behavior regresses.
- **F4:** One supported environment fails the target matrix.
- **F5:** The rollback does not reproduce the prior dependency tree and the baseline checks.

## Recovery procedure

- **R1:** Keep the current version, record the missing source and the decision it affects, and restart the research only when attributable evidence becomes available.
- **R2:** Restore the prior manifest and lockfile, remove the unexplained resolution, verify the approved registry configuration, and regenerate the lockfile before retrying.
- **R3:** Revert the target change, isolate the incompatible usage, and either choose a compatible target or obtain a separately reviewed behavior migration.
- **R4:** Restore the prior tree, reproduce the environment-specific failure, and either correct it or complete the platform-owner support-change gate before another target run.
- **R5:** Preserve the evidence from the failed drill, restore through a reviewed clean checkout, correct the rollback procedure, and rerun both the restoration and the reapplication before delivery.

## Example

The [synthetic input](#complete-example-input) supplies everything the workflow needs for a fictional validation package: a complete version-range record, source and lockfile data, an implemented migration, environment results, an approval, and a rollback drill.
The [complete expected output](#complete-expected-output) shows what a finished upgrade record looks like, without relying on knowledge of any external package.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/upgrade-dependencies/1.0.0",
  "title": "Dependency upgrade output contract",
  "description": "Validates the dependency diff, breaking-change mapping, isolated implementation, supported-environment validation, approvals, rollback, limitations, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "dependency-upgrade-record.md",
        "audience": "Repository maintainers and dependency reviewers",
        "requires_title": true,
        "required_headings": [
          "Status, scope, and provenance",
          "Direct and transitive dependency diff",
          "Breaking-change and local-usage register",
          "Implemented change",
          "Supported-environment validation",
          "Approval and policy disposition",
          "Rollback record",
          "Residual risks and limitations",
          "Traceability summary"
        ],
        "required_literals": [
          "| Disposition | Package | Before | After | Source and policy result | Evidence |",
          "| Vendor change | Local observation | Disposition | Verification | Evidence |",
          "| Limitation | Impact | Owner role | Exit condition | Evidence |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This evidence package describes a fictional package and reserved example registry.
It is self-contained and does not assert facts about a real vendor or repository.

## Scenario

At immutable commit `8b64c20000000000000000000000000000000000`, the synthetic TypeScript service `intake-api` uses `@example/validator` 3.7.2.
The approved target is 4.0.1.

The service supports Node.js 20.18.1 and 22.11.0 on Linux x64 with pnpm 9.15.4.
Public validation failures must retain JSON fields `path`, `message`, and `code` in the same order and with the same values for equivalent input.

Only `package.json`, `pnpm-lock.yaml`, `src/validation/format-validation-error.ts`, and `test/validation/format-validation-error.test.ts` may change.
Registry configuration, runtime support, unrelated dependencies, public error shape, and application features are excluded.

## Evidence inventory

### E1 - Immutable dependency baseline

- Commit: `8b64c20000000000000000000000000000000000`.
- Starting working tree: clean.
- `package.json` declares `"@example/validator": "3.7.2"`.
- `pnpm-lock.yaml` resolves `@example/validator@3.7.2` from `https://registry.example.test/` with integrity `sha512-dmFsaWRhdG9yLTMuNy4yLXN5bnRoZXRpYy1pbnRlZ3JpdHk=` and MIT license metadata.
- `pnpm-lock.yaml` resolves `@example/path-array@1.1.0` from `https://registry.example.test/` with integrity `sha512-cGF0aC1hcnJheS0xLjEuMC1zeW50aGV0aWMtaW50ZWdyaXR5` and MIT license metadata.
- The retained complete package manifests for `@example/validator@3.7.2` and `@example/path-array@1.1.0` each contain an empty `scripts` object and no `preinstall`, `install`, `postinstall`, or `prepare` field outside that object.
- The package-manifest records are tied to the exact E1 lockfile integrities and registry identities.
- No patch or override applies to the dependency group.

At E1, `pnpm install --frozen-lockfile` exited `0` from only the configured example registry.
Its retained event log contains zero lifecycle-script start or completion events.

### E2 - Target artifact and official range record

The supplied signed vendor record `validator-3.7.2-to-4.0.1.json` identifies target 4.0.1 and contains these complete range notes:

- `ValidationError.details` was removed, and callers must read `ValidationError.issues`.
- `parseCalendarDate` now rejects timestamps and accepts date-only `YYYY-MM-DD` input.
- The exported schema constructors `object`, `string`, and `safeParse` retain their version 3 call signatures and result semantics.
- Runtime support is Node.js 20 or later.
- `@example/validator@4.0.1` and `@example/issue-path@2.0.0` each declare the MIT license.
- Version 4 replaces transitive `@example/path-array@1.1.0` with `@example/issue-path@2.0.0`.
- The complete target package manifests for `@example/validator@4.0.1` and `@example/issue-path@2.0.0` each contain an empty `scripts` object and no `preinstall`, `install`, `postinstall`, or `prepare` field outside that object.

The record SHA-256 is `d249ab777e1bc7220e67694c2028a4109ad6eeb8f28f6450f72caaf724c7c71d`.
The signature identifies synthetic vendor key `validator-release-key-4`.
The supplied target artifact manifest records the same record SHA-256 and these package integrities:

- `@example/validator@4.0.1`: `sha512-dmFsaWRhdG9yLTQuMC4xLXN5bnRoZXRpYy1pbnRlZ3JpdHk=`;
- `@example/issue-path@2.0.0`: `sha512-aXNzdWUtcGF0aC0yLjAuMC1zeW50aGV0aWMtaW50ZWdyaXR5`.

The signed artifact manifest binds each complete target package manifest, including its empty lifecycle-script inventory, to the corresponding integrity above.

No vulnerability advisory is included in the scenario.

### E3 - Local usage inventory

Repository search produced these results:

- `src/validation/format-validation-error.ts:18` reads `error.details`.
- Three schema modules import `@example/validator` but use only `object`, `string`, and `safeParse`, which the vendor record lists as unchanged.
- No source, test, configuration, or generated file calls `parseCalendarDate`.
- No plugin integration or re-export of the package exists.

### E4 - Protected behavior and baseline

At `8b64c20000000000000000000000000000000000`, both supported Node.js versions produced the same results:

- `pnpm install --frozen-lockfile` exited `0`.
- `pnpm lint` exited `0`.
- `pnpm typecheck` exited `0`.
- `pnpm test` exited `0` with 86 tests passing.
- `pnpm test:validation-contract` exited `0` with 14 fixtures preserving `path`, `message`, and `code`.

The command environment records identify pnpm 9.15.4 and Linux x64.

### E5 - Policy and approval record

The repository policy permits packages from `https://registry.example.test/` when integrity fields are present and licenses are MIT or Apache-2.0.
New lifecycle scripts require security-owner review.

The repository maintainer reviewed E1 through E4 and approved implementation within the exact four-file boundary: `package.json`, `pnpm-lock.yaml`, `src/validation/format-validation-error.ts`, and `test/validation/format-validation-error.test.ts`.
No runtime-support or license-policy change is requested, so platform and legal approval gates are not applicable.

### E6 - Generated manifest and lockfile diff

The upgrade was generated with pnpm 9.15.4.
The complete dependency-group diff is:

| Package | Change | Before | After | Registry | Integrity disposition | License | Lifecycle script |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `@example/validator` | upgraded direct dependency | `3.7.2` | `4.0.1` | `https://registry.example.test/` unchanged | `sha512-dmFsaWRhdG9yLTMuNy4yLXN5bnRoZXRpYy1pbnRlZ3JpdHk=` replaced by `sha512-dmFsaWRhdG9yLTQuMC4xLXN5bnRoZXRpYy1pbnRlZ3JpdHk=` and matched to E2 | MIT unchanged | absent before and after |
| `@example/path-array` | removed transitive dependency | `1.1.0` | absent | `https://registry.example.test/` before removal | `sha512-cGF0aC1hcnJheS0xLjEuMC1zeW50aGV0aWMtaW50ZWdyaXR5` removed with the package | MIT removed with the package | absent before removal |
| `@example/issue-path` | added transitive dependency | absent | `2.0.0` | `https://registry.example.test/` | `sha512-aXNzdWUtcGF0aC0yLjAuMC1zeW50aGV0aWMtaW50ZWdyaXR5` added and matched to E2 | MIT allowed by E5 | absent |

No other direct or transitive version, registry, patch, override, or lifecycle-script field changed.

### E7 - Implemented source migration

`src/validation/format-validation-error.ts:18` changed from:

```ts
return error.details.map(toPublicIssue);
```

to:

```ts
return error.issues.map(toPublicIssue);
```

`test/validation/format-validation-error.test.ts` was updated to construct vendor errors through the v4 `issues` field while retaining the same 14 expected public JSON fixtures.
No `parseCalendarDate` migration was applied because E3 records no local usage.

### E8 - Target validation results

After the E6 and E7 changes, both Node.js 20.18.1 and 22.11.0 on Linux x64 produced:

- `pnpm install --frozen-lockfile`: exit `0`, with only `@example/validator@4.0.1` and `@example/issue-path@2.0.0` in the scoped tree.
- `pnpm lint`: exit `0`.
- `pnpm typecheck`: exit `0`.
- `pnpm test`: exit `0`, 86 tests passing.
- `pnpm test:validation-contract`: exit `0`, all 14 public error fixtures unchanged.

The retained install event log contains zero lifecycle-script start or completion events and no network host other than `registry.example.test`.

### E9 - Rollback and reapplication drill

In a disposable worktree, the manifest and lockfile from E1, the original `error.details` source, and the original focused test fixture were restored.
On both Node.js 20.18.1 and 22.11.0, a frozen install resolved 3.7.2 and `@example/path-array@1.1.0`, and all five baseline commands in E4 passed.

The target changes were then reapplied.
On both Node.js 20.18.1 and 22.11.0, a frozen install restored the E6 tree, and all five target commands in E8 passed again.

### E10 - Final review and limitations

The repository maintainer reviewed the full lockfile diff, local migration, two-runtime results, and rollback drill and approved the change for merge review.

No security remediation claim is made because the scenario supplies no advisory.
The evidence covers Linux x64 only because no other operating system belongs to the supported matrix.

## Complete expected output

## Status, scope, and provenance

Status: ready for merge review.

The synthetic `intake-api` service moves `@example/validator` from 3.7.2 to 4.0.1 at baseline commit `8b64c20000000000000000000000000000000000` (E1, E2).
The change is limited to `package.json`, `pnpm-lock.yaml`, `src/validation/format-validation-error.ts`, and `test/validation/format-validation-error.test.ts` (E5, E7).

All scoped package records resolve from `https://registry.example.test/` with the exact integrity values in E1 and E6.
The target range record SHA-256 `d249ab777e1bc7220e67694c2028a4109ad6eeb8f28f6450f72caaf724c7c71d` matches the supplied artifact manifest (E2).
No registry, patch, override, or lifecycle-script change is present according to the complete baseline and target package manifests, the lockfile diff, and both retained install event logs (E1, E2, E6, E8).

## Direct and transitive dependency diff

| Disposition | Package | Before | After | Source and policy result | Evidence |
| --- | --- | --- | --- | --- | --- |
| upgraded | `@example/validator` | 3.7.2 | 4.0.1 | approved example registry, exact target integrity matched, MIT unchanged, no lifecycle script | E1, E2, E5, E6 |
| removed | `@example/path-array` | 1.1.0 | absent | expected removal, with its integrity and MIT metadata removed | E1, E2, E6 |
| added | `@example/issue-path` | absent | 2.0.0 | approved example registry, exact target integrity matched, MIT allowed, no lifecycle script | E2, E5, E6 |

| Package | Before integrity | After integrity | Registry | License and lifecycle disposition |
| --- | --- | --- | --- | --- |
| `@example/validator` | `sha512-dmFsaWRhdG9yLTMuNy4yLXN5bnRoZXRpYy1pbnRlZ3JpdHk=` | `sha512-dmFsaWRhdG9yLTQuMC4xLXN5bnRoZXRpYy1pbnRlZ3JpdHk=` | approved example registry unchanged | MIT unchanged; no lifecycle script before or after |
| `@example/path-array` | `sha512-cGF0aC1hcnJheS0xLjEuMC1zeW50aGV0aWMtaW50ZWdyaXR5` | absent | approved example registry before removal | MIT and no lifecycle script removed with the package |
| `@example/issue-path` | absent | `sha512-aXNzdWUtcGF0aC0yLjAuMC1zeW50aGV0aWMtaW50ZWdyaXR5` | approved example registry | MIT allowed; no lifecycle script |

No other direct or transitive package changed in the complete lockfile diff (E6).

## Breaking-change and local-usage register

| Vendor change | Local observation | Disposition | Verification | Evidence |
| --- | --- | --- | --- | --- |
| `ValidationError.details` removed in favor of `issues` | one access at `src/validation/format-validation-error.ts:18` | migrated to `error.issues.map(toPublicIssue)` | typecheck and 14 public error fixtures pass | E2, E3, E7, E8 |
| `parseCalendarDate` accepts only date-only input | no usage in source, tests, configuration, or generated files | verified unaffected for current repository scope | repository search result retained | E2, E3 |
| Node.js 20 or later required | supported matrix is Node.js 20.18.1 and 22.11.0 | compatible without a support-policy change | full target matrix passes on both versions | E2, E4, E8 |
| transitive package changed | path helper removed and issue-path helper added | expected lockfile change | full diff and source review complete | E2, E6 |
| target packages declare MIT | policy allows MIT | accepted without a new-license gate | lockfile package identities reconcile with vendor record | E2, E5, E6 |

The three unchanged schema constructors require no source migration because the complete vendor record identifies them as unchanged (E2, E3).

## Implemented change

The destination file `src/validation/format-validation-error.ts` now contains this implemented expression:

```ts
return error.issues.map(toPublicIssue);
```

It is the only production source migration required by the evidenced local usage (E3, E7).
The focused test at `test/validation/format-validation-error.test.ts` now constructs v4 vendor errors through `issues` while retaining the same 14 public JSON expectations (E7).
The public JSON contract remains `path`, `message`, and `code` for all 14 supplied fixtures (E4, E7, E8).

## Supported-environment validation

| Check | Node.js 20.18.1 baseline | Node.js 20.18.1 target | Node.js 22.11.0 baseline | Node.js 22.11.0 target | Evidence |
| --- | --- | --- | --- | --- | --- |
| frozen install | exit 0 | exit 0 | exit 0 | exit 0 | E4, E8 |
| lint | exit 0 | exit 0 | exit 0 | exit 0 | E4, E8 |
| typecheck | exit 0 | exit 0 | exit 0 | exit 0 | E4, E8 |
| unit tests | 86 pass | 86 pass | 86 pass | 86 pass | E4, E8 |
| validation contract | 14 pass | 14 pass | 14 pass | 14 pass | E4, E8 |

The target install resolved only 4.0.1 and its expected new transitive package in the scoped tree (E8).
Its retained event log contains zero lifecycle-script start or completion events and no unexpected network host (E8).

## Approval and policy disposition

The repository maintainer approved the major-version implementation before the four-file change and approved the completed record for merge review (E5, E10).

The platform-owner gate is not applicable because the supported Node.js 20 and 22 matrix remains unchanged and passes (E2, E4, E5, E8).
The legal or compliance gate is not applicable because both supplied package licenses are MIT and current policy already permits MIT (E2, E5).

No security benefit is claimed because no vulnerability advisory was supplied (E2, E10).

## Rollback record

The rollback drill restored the prior manifest, lockfile, transitive tree, `error.details` implementation, and original focused test fixture in a disposable worktree (E9).
On both Node.js 20.18.1 and 22.11.0, the frozen install, lint, typecheck, 86 unit tests, and 14 contract fixtures returned to their E4 baseline (E9).

Reapplication restored the target tree, source migration, and focused fixture migration, and the same five target checks passed again on both supported Node.js versions (E9).

If a merge-review regression appears, restore the E1 manifest, lockfile, and source state, then require the E4 command results before investigating a new target attempt (E1, E4, E9).

## Residual risks and limitations

| Limitation | Impact | Owner role | Exit condition | Evidence |
| --- | --- | --- | --- | --- |
| Operating-system evidence is Linux x64 only | no result can be generalized to another operating system | platform owner | add a supported operating system to policy and execute the same matrix there | E10 |

No unresolved source, integrity, runtime, license, public-contract, or rollback blocker remains for the declared supported matrix (E6, E8, E9, E10).

## Traceability summary

- Baseline package state and provenance: E1.
- Complete target range and license record: E2.
- Local usage: E3.
- Baseline behavior and environments: E4.
- Policy and pre-implementation approval: E5.
- Lockfile diff: E6.
- Source migration: E7.
- Target matrix: E8.
- Rollback and reapplication: E9.
- Final approval and limitations: E10.
