# Synthetic validation dependency upgrade evidence

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
