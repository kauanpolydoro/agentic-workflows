# `@example/validator` 4.0.1 upgrade record

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
