---
title: "Audit dependency risk"
description: "Produce a reproducible dependency inventory and risk plan separating affected versions from application reachability."
---

# Audit dependency risk

## Objective

Transform immutable dependency declarations, their resolved graph, and a dated advisory snapshot into a reproducible inventory, evidence-ranked finding register, and dependency action plan.
The primary quality constraint is to separate affected-version presence, vulnerable-API reachability, and demonstrated exploitability instead of collapsing them into one claim.

## When to use

- A release needs a supply-chain risk snapshot.
- Runtime dependencies need removal, upgrade, license, provenance, or maintenance assessment.
- A repository needs a time-bounded decision about a specific advisory or unused direct dependency.

## When not to use

- The manifest and matching lockfile are unavailable.
- The dependency graph cannot be resolved without executing untrusted install scripts.
- The request requires a legal conclusion rather than an engineering risk assessment.
- The advisory source, snapshot time, affected range, or vulnerable condition cannot be retained.

## Required inputs

- **Immutable revision, dependency manifests, and dependency-group policy:** Supply the commit or archive digest, complete manifest excerpts, workspace boundaries, and the rule that distinguishes runtime, development, optional, peer, and build dependencies.
  This evidence defines declared intent and audit scope.
  Resolve the revision and confirm the manifest excerpts and policy belong to it.
- **Matching lockfiles with complete resolved graph, versions, and integrity records:** Supply all importer entries, package nodes, graph edges, resolved versions, and integrity fields for the audited scope.
  This evidence defines what is actually installed or packaged.
  Confirm that frozen resolution succeeds without manifest drift, or use a trusted existing lockfile parser without executing package lifecycle scripts.
- **Dated advisory records with affected ranges, conditions, and source identity:** Supply the snapshot timestamp, advisory identifier, ecosystem, affected range, vulnerable API or configuration, fixed boundary when known, and retained source identity.
  This record makes the result reproducible and prevents a package-name match from becoming an exploitability claim.
  Validate advisory syntax and retain the exact snapshot rather than silently refreshing it during analysis.

## Optional inputs

- **Runtime import, call-site, and packaged-artifact inventory:** Improves reachability analysis by identifying static imports, dynamic loaders, plugins, generated code, and bundled packages.
- **Software bill of materials:** Allows comparison between lockfile resolution and the produced artifact.
- **License policy and provenance records:** Permit engineering classification of approved licenses, registries, signatures, and maintainership without replacing legal review.

## Preconditions

- Manifest and lockfile correspond to the same immutable revision.
- Production and development dependencies can be distinguished.
- The advisory snapshot has an explicit timestamp and retained source identity.
- Registry credentials and private registry addresses can remain redacted.
- Lockfile inspection and any experimental resolution can disable lifecycle scripts and use a disposable directory.

## Workflow

1. **Freeze the audit boundary.**
   Record the immutable revision, workspace and ecosystem scope, manifest and lockfile paths, dependency-group policy, advisory snapshot time, and exclusions.
   Hash or otherwise identify each supplied artifact.
   Advance only when every manifest maps to a lockfile importer from the same revision; otherwise stop under F1.
2. **Build the resolved dependency inventory.**
   Parse direct declarations and traverse the lockfile graph without running lifecycle scripts.
   Record direct or transitive status, dependency group, exact version, parent path, integrity presence, registry class, and optional platform conditions.
   Reconcile duplicate versions and peer resolutions before advancing.
3. **Reconcile packaged and runtime scope.**
   When supplied, compare the lock graph with SBOM, bundle, runtime imports, dynamic loading, generated code, plugins, and build scripts.
   Mark packages absent from the packaged artifact separately from packages merely unreferenced by static source.
   Stop short of an absence claim when runtime mechanisms are not covered.
4. **Match advisory records.**
   Evaluate each resolved version against the exact affected range and ecosystem in the retained snapshot.
   Record advisory presence, vulnerable API or configuration, fixed boundary, and unavailable fields.
   A name or version match creates an affected-version observation, not proof of reachability.
5. **Assess reachability and exposure.**
   Search supplied imports and call sites for the vulnerable API, then inspect configuration and data sources required by the advisory condition.
   Record static evidence, uninspected runtime mechanisms, and any supplied safe runtime result separately.
   Assign reachability as demonstrated, not observed, unknown, or not applicable, with a confidence rationale.
6. **Assess non-advisory dependency risk.**
   Apply supplied policies to unused direct dependencies, unsupported runtimes, provenance, integrity, maintenance, and licenses.
   Do not issue a legal conclusion or treat missing optional provenance as malicious behavior.
7. **Select an action with evidence.**
   For each finding, compare removal, exact-version upgrade, constraint change, monitoring, and temporary acceptance.
   Identify consumer impact, owner role, required approvals, exact copyable mutation and validation commands, exit criteria, and rollback to the retained manifest and lockfile.
   Keep commands proposed until their retained result identifies the isolated revision and exit status.
   Do not name an upgrade target unless the supplied advisory or trusted package record supports it.
8. **Produce and approve the audit artifact.**
   Deliver the scope, complete inventory, finding register, actions, executed and proposed checks, assumptions, limitations, and traceability.
   Obtain repository-maintainer approval before removing public runtime capability and security-owner approval before temporary vulnerable-dependency acceptance.

## Decision points

- If manifest and lockfile disagree, stop and regenerate or obtain the matching immutable pair.
- If an advisory affects a version but no runtime path is shown, report affected presence and reachability as unknown.
- If static search finds no vulnerable API but dynamic loading, plugins, generated code, or reflection remain uninspected, classify reachability as unknown rather than unreachable.
- If the advisory lacks a supported fixed boundary, do not guess an upgrade target; request authoritative version evidence or choose a separately justified mitigation.
- If removal changes public runtime capability, require repository maintainer approval before implementation.
- If a reachable vulnerability cannot be remediated before release, require security-owner acceptance with controls, owner, expiry, and revalidation evidence.
- If the only way to resolve metadata is to run an unknown lifecycle script, stop dynamic resolution and use static evidence with a documented gap.
- If private metadata is inaccessible, stop findings and actions for that package subtree; continue unrelated graph analysis only when the lockfile proves the subtree boundary, and stop the requested release decision when the inaccessible subtree can change that decision.

## Safety guardrails

- Never run lifecycle scripts from unknown packages during audit.
- Never print registry tokens or copy private registry URLs into public output.
- Do not claim exploitability without reachability evidence.
- Do not install, publish, remove, or upgrade dependencies in the audited working tree during a read-only audit.
- Perform experimental resolution only in a disposable directory with scripts disabled and no production credentials.
- Do not contact unapproved private registries or include private package contents in a public artifact.
- Preserve the original manifest and lockfile as rollback evidence for any proposed change.

## Human approval gates

- Before removing a public runtime capability, the repository maintainer approves static and packaged usage evidence, consumer impact, validation plan, and manifest-and-lockfile rollback.
- Before temporarily accepting a vulnerable dependency, the security owner approves affected-version and reachability evidence, severity, compensating controls, accountable owner, expiry, and revalidation date.

## Expected output

- **Reproducible dependency inventory and audit scope:** Immutable revision, snapshot time, artifact identities, every in-scope direct and transitive resolution, dependency group, integrity status, and coverage exclusions.
- **Risk-ranked dependency finding register with reachability dispositions:** Each row contains finding, evidence, impact, severity, confidence, recommendation, verification, disposition, advisory status, and reachability.
- **Removal, upgrade, monitoring, or acceptance plan:** Exact target when supported, owner role, dependencies, commands to run, objective exit criteria, rollback, approvals, assumptions, and limitations.

The artifact must distinguish observations, inferences, recommendations, executed checks, proposed checks, assumptions, limitations, and next actions.
Material claims must cite example evidence IDs.

## Completion criteria

- The inventory is tied to an immutable revision and timestamp.
- Every in-scope direct and transitive resolution has an exact version and integrity disposition.
- Every advisory finding identifies its affected resolved version, source snapshot, range, and vulnerable condition.
- Reachability is evidenced or explicitly unknown, and exploitability is not claimed without validation.
- Every action has an owner, supported target or explicit target blocker, validation, rollback, and required approval gate.
- Executed package operations are distinguished from proposed isolated changes.

## Failure modes

- **F1:** The lockfile does not match the manifest.
- **F2:** An advisory record lacks the affected range, vulnerable condition, or fixed-version evidence needed for the requested decision.
- **F3:** Private package metadata is inaccessible without exposing credentials or an unapproved registry.
- **F4:** Safe resolution would require unknown lifecycle scripts.

## Recovery procedure

- **R1:** Obtain the matching immutable manifest-lockfile pair or generate it in an approved disposable environment with scripts disabled, retain the new artifact identities, and restart at workflow step 1.
- **R2:** Request a complete retained advisory record, keep target selection and affected-status conclusions blocked, and resume at workflow step 4 only after the record is validated.
- **R3:** Stop advisory, provenance, license, and action conclusions for the inaccessible private package and its affected subtree, retain only redacted metadata, and escalate through the package owner without contacting the registry.
  Continue analysis of unrelated nodes only when the supplied lockfile establishes a complete subtree boundary; otherwise stop the audit conclusion that depends on graph completeness.
  Resume at workflow step 2 after the package owner supplies an approved immutable metadata record with provenance, or at step 4 when only a complete retained advisory record was missing, and re-run every downstream inventory and finding that included the subtree.
- **R4:** Stop dynamic resolution, perform static manifest and lockfile analysis, record lifecycle-dependent coverage as unknown, and resume at workflow step 2 without claiming complete runtime inventory.

## Example

The complete synthetic example is in [#complete-example-input](#complete-example-input), with its complete artifact in [#complete-expected-output](#complete-expected-output).
It demonstrates evidence traceability without relying on external sources.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/dependency-audit/1.0.0",
  "title": "Dependency audit output contract",
  "description": "Validates the resolved inventory, evidence-ranked findings, bounded action plan, proposed commands, approvals, limitations, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "dependency-audit.md",
        "audience": "Repository maintainers and security owners",
        "requires_title": true,
        "required_headings": [
          "Scope",
          "Inventory",
          "Findings",
          "Action plan",
          "Proposed command sequence",
          "Approval and decision record",
          "Limitations",
          "Traceability"
        ],
        "required_literals": [
          "| Package | Relationship | Resolved version | Integrity | Runtime and package status | Advisory status | Evidence |",
          "| Severity | Confidence | Reachability | Finding | Evidence | Impact | Recommendation | Verification | Disposition |",
          "| Order | Proposed action | Owner | Dependency and approval | Exit evidence | Recovery |",
          "| Material conclusion | Evidence |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This is a synthetic, self-contained scenario.
No external record should be consulted.

## Context

Synthetic Node.js service at immutable revision `d300000000000000000000000000000000000000`.
The audit is limited to the complete three-package runtime graph supplied below.

## Request

Audit runtime dependencies and recommend evidence-supported actions.

## Constraints

- Use only the evidence below.
- Treat commands as executed only when their evidence explicitly records a result.
- State assumptions and limitations.
- Do not contact a registry, run lifecycle scripts, or modify the supplied manifest and lockfile.

## Evidence inventory

### E1 - Immutable manifest and scope policy

- Type: Manifest excerpt and repository policy.
- Content: Revision `d300000000000000000000000000000000000000` contains this complete dependency declaration:

```json
{
  "dependencies": {
    "kleur": "4.1.5",
    "left-pad": "1.3.0",
    "lodash": "4.17.20"
  },
  "devDependencies": {}
}
```

- Content: The repository classifies entries under `dependencies` as direct runtime dependencies and contains no workspaces, optional dependencies, peer dependencies, or build-time dependency group.
- Integrity: The excerpt is from immutable revision `d300000000000000000000000000000000000000`.
- Establishes: Complete direct declarations and dependency-group classification.

### E2 - Matching lockfile graph

- Type: Lockfile parser record.
- Content: The complete synthetic resolution excerpt is:

```yaml
importers:
  .:
    dependencies:
      kleur: { specifier: 4.1.5, version: 4.1.5 }
      left-pad: { specifier: 1.3.0, version: 1.3.0 }
      lodash: { specifier: 4.17.20, version: 4.17.20 }
packages:
  kleur@4.1.5:
    resolution:
      integrity: sha512-d6WARGQ/CT335eCASLGn3xhwGwW5j0jilIeEuU2brOdBxWJi+HYsy5zjN66YA5AaCRmIOBN6QkPo/Rzlij4kDg==
  left-pad@1.3.0:
    resolution:
      integrity: sha512-9EwzZSPvj3frCmYXxxCGcx6xaxCj0LkuFUbVw8pSzOzd/qoru+5byLFcik38Wdm3A5XI8Bxj6wrpiw5Lj9eCZQ==
  lodash@4.17.20:
    resolution:
      integrity: sha512-20rm38VK80iYfygSgfmU/VXFfoqB3fRhO4AxKTXFHL9SUFa8+Vmw3P7uXOoCb1eHnYBAA5bb6HPdO7ax1XmXgQ==
```

- Content: The complete graph has those three package nodes, no transitive edges, and one distinct version of each package.
- Content: Each node is reached directly from root importer `.`, resolves from the approved public npm registry class, and has no operating-system, CPU, or other optional-platform condition.
- Content: Frozen resolution reports no manifest-lockfile drift at revision `d300000000000000000000000000000000000000`; this result was supplied, not executed during the example.
- Integrity: Immutable synthetic artifact identifier `lock-d300000000000000000000000000000000000000-v1` ties this excerpt to revision `d300000000000000000000000000000000000000`.
- Establishes: Exact resolved graph, direct status, parent paths, registry class, optional-platform disposition, integrity presence, and manifest correspondence.

### E3 - Runtime import inventory

- Type: Complete static and packaged usage inventory.
- Content: `src/read-config.ts` imports `get` from `lodash/get`; `src/format.ts` imports `kleur`; no source, generated file, build script, plugin declaration, or packaged module references `left-pad`.
- Content: The application has no runtime plugin loader, reflection-based module loading, or externally supplied module path.
- Content: The packaged-artifact inventory contains `lodash` and `kleur` but not `left-pad`.
- Integrity: The inventory was generated from revision `d300000000000000000000000000000000000000` and immutable synthetic package artifact `package-d300000000000000000000000000000000000000-v1`; both the source search record and packaged inventory identify that same revision and artifact.
- Establishes: Observed runtime uses, covered dynamic mechanisms, and absence of `left-pad` from the supplied artifact.

### E4 - Advisory snapshot

- Type: Retained synthetic advisory record.
- Content: Advisory `ADV-1` for the npm ecosystem affects `lodash >=4.0.0 <4.17.21` only when untrusted input reaches `lodash/template`.
- Content: The first version outside the supplied affected range is `4.17.21`.
- Content: The retained snapshot contains no advisory entry for `kleur@4.1.5` or `left-pad@1.3.0`.
- Content: The synthetic advisory source identity is `fixture://advisories/ADV-1`, captured `2026-01-10`.
- Integrity: This is the complete advisory record supplied for the example, not a current external lookup.
- Establishes: Affected range, vulnerable API condition, candidate fixed boundary, source identity, and timestamp.

### E5 - Call-site search

- Type: Static reachability record.
- Content: Exact-symbol and property-access searches find no import, require, re-export, or call of `lodash/template` or `_.template`; only `lodash/get` is referenced.
- Content: No supplied input reaches a dynamically selected lodash function.
- Integrity: The search covers source, generated code, build scripts, and the packaged artifact at revision `d300000000000000000000000000000000000000`.
- Establishes: The vulnerable API is not observed within the supplied static and packaged scope; no runtime experiment proves non-reachability.

### E6 - Audit context

- Type: Execution record.
- Content: No install script, package-manager command, registry request, dependency update, removal, build, test, or runtime command was executed for this example.
- Content: All resolution and usage records were supplied as synthetic evidence.
- Content: No license, maintainer, registry-provenance, or signature policy was supplied, so those concerns are outside this example's requested finding scope.
- Establishes: Static-only execution status and the boundary between evidence and proposed work.

### E7 - Action constraints

- Type: Repository dependency and severity policy.
- Content: An affected direct runtime version with the vulnerable API unobserved is Medium until the upgrade or an approved runtime validation closes the exposure question.
- Content: A direct package absent from source, dynamic loading, and the packaged artifact is Low, but removal still requires compatibility checks and repository-maintainer approval.
- Content: The repository maintainer owns dependency changes and requires lockfile review, build, unit tests, packaging comparison, and manifest-lockfile rollback evidence before merge.
- Content: The unit-test inventory at `d300000000000000000000000000000000000000` includes `test/advisory-match.test.ts`, which matches the resolved lodash version against retained snapshot `ADV-1` and fails if a `lodash/template` or `_.template` reference appears in the complete static scope, and `test/read-config.test.ts`, which exercises configuration reads through `lodash/get`.
- Content: The repository runbook supplies these exact commands for an isolated branch based on `d300000000000000000000000000000000000000`: `pnpm --config.ignore-scripts=true add --save-exact lodash@4.17.21`, `pnpm --config.ignore-scripts=true remove left-pad`, `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm test -- advisory-match`, `pnpm test -- read-config`, `pnpm build`, `pnpm test`, `pnpm pack --dry-run --json`, and `git diff -- package.json pnpm-lock.yaml`.
- Content: The rollback command is `git restore --source=d300000000000000000000000000000000000000 -- package.json pnpm-lock.yaml`, followed by `pnpm install --frozen-lockfile --ignore-scripts`; update and removal must use separate isolated branches.
- Content: Temporary acceptance of an affected runtime dependency requires security-owner approval, compensating controls, an owner, and an expiry.
- Establishes: Severity, action ownership, focused advisory, vulnerable-API, and configuration-read checks, exact proposed commands, exit evidence, rollback, and approval rules.

### E8 - Compatibility constraints

- Type: Supported runtime and API record.
- Content: The service supports Node.js 20, and both `lodash@4.17.20` and the proposed boundary `lodash@4.17.21` declare compatibility with that runtime in the supplied package records.
- Content: No public service contract is documented as depending on `left-pad`; the usage and packaging inventory in E3 remains the evidence required before removal.
- Establishes: Candidate target runtime compatibility and the limit of known removal impact.

## Complete expected output

## Scope

Revision: `d300000000000000000000000000000000000000`.
Snapshot: `2026-01-10`.
Scope: the complete three-node direct runtime graph from the matching manifest and lockfile [E1, E2].
No install script, package-manager command, registry request, update, removal, build, test, or runtime command was executed [E6].

## Inventory

| Package | Relationship | Resolved version | Integrity | Runtime and package status | Advisory status | Evidence |
|---|---|---:|---|---|---|---|
| `kleur` | Direct runtime | 4.1.5 | Present | Imported and packaged | No supplied advisory | E1, E2, E3, E4 |
| `left-pad` | Direct runtime | 1.3.0 | Present | No source, dynamic, generated, build, or packaged reference | No supplied advisory | E1, E2, E3, E4 |
| `lodash` | Direct runtime | 4.17.20 | Present | `lodash/get` imported and package included | Resolved version falls within `ADV-1`; vulnerable `template` API not observed | E1, E2, E3, E4, E5 |

| Package | Parent path | Registry class | Optional platform conditions | Evidence |
|---|---|---|---|---|
| `kleur` | Root importer `.` | Approved public npm registry | None | E2 |
| `left-pad` | Root importer `.` | Approved public npm registry | None | E2 |
| `lodash` | Root importer `.` | Approved public npm registry | None | E2 |

There are no transitive graph nodes, duplicate versions, optional packages, peer packages, or workspace importers in the supplied scope [E1, E2].

## Findings

| Severity | Confidence | Reachability | Finding | Evidence | Impact | Recommendation | Verification | Disposition |
|---|---|---|---|---|---|---|---|---|
| Medium | High for affected presence; Medium for reachability because complete static and packaged mechanisms were inspected but no runtime experiment ran | Not observed | `lodash@4.17.20` is inside synthetic advisory `ADV-1`; the required `template` call is not observed in the complete supplied static and packaged scope. | E2, E3, E4, E5, E6, E7 | Observation: an affected version is shipped. Inference: the advisory condition is not currently reachable through the supplied inventory, but no runtime experiment establishes non-reachability. | Upgrade to the supplied first outside-range boundary `4.17.21` in an isolated change and retain the exact resolution. Do not claim current exploitability. | Run the exact update, frozen install, build, unit-test, pack, and diff commands in the proposed command sequence, compare immutable artifact `package-d300000000000000000000000000000000000000-v1`, exercise configuration reads using `lodash/get`, and verify the exact rollback. None has run. | Open until the upgrade and compatibility evidence pass, or the security owner accepts temporary risk |
| Low | High because the complete source, dynamic-loading, generated, build, and immutable packaged-artifact inventories agree | Not applicable, because no advisory or vulnerable condition is supplied for `left-pad` | `left-pad@1.3.0` is a direct runtime declaration absent from the supplied source, covered dynamic mechanisms, and packaged artifact. | E1, E2, E3, E6, E7, E8 | It increases dependency and supply-chain surface without an observed packaged capability; unknown external consumer dependence is not claimed. | Remove it in a separate isolated change after repository-maintainer approval. | Run the exact removal, frozen install, build, unit-test, pack, and diff commands in the proposed command sequence, compare immutable artifact `package-d300000000000000000000000000000000000000-v1`, and verify the exact rollback. None has run. | Removal candidate pending repository-maintainer approval and validation |

## Action plan

| Order | Proposed action | Owner | Dependency and approval | Exit evidence | Recovery |
|---:|---|---|---|---|---|
| 1 | Update only `lodash` from 4.17.20 to exact 4.17.21 in an isolated branch. | Repository maintainer | Candidate boundary and Node.js 20 compatibility are supplied [E4, E8]. | Exact lock resolution, reviewed lock diff, passing build and unit tests, unchanged package entry points, and `pnpm test -- read-config` passing the supplied `lodash/get` configuration-read check [E7]. | Restore the retained manifest and lockfile from `d300000000000000000000000000000000000000`, then rerun frozen resolution in the isolated branch. |
| 2 | Re-run the retained advisory match and static `template` search through `pnpm test -- advisory-match`. | Repository maintainer | Step 1 candidate artifacts and the focused test inventory supplied by E7. | `ADV-1` range no longer matches and no newly introduced `lodash/template` or `_.template` reference appears [E4, E5, E7]. | Keep the finding open and do not merge the update if evidence disagrees. |
| 3 | Remove `left-pad` in a separate isolated branch. | Repository maintainer | Repository-maintainer approval based on complete usage and package evidence [E3, E7]. | Reviewed manifest and lockfile diff, passing build and unit tests, and package artifact comparison [E7]. | Restore both retained files and reject removal if any capability or artifact regresses. |

All actions and validation commands are proposed and unexecuted [E6].

## Proposed command sequence

Run the `lodash` change only in its isolated branch based on `d300000000000000000000000000000000000000` [E7]:

```sh
pnpm --config.ignore-scripts=true add --save-exact lodash@4.17.21
pnpm install --frozen-lockfile --ignore-scripts
pnpm test -- advisory-match
pnpm test -- read-config
pnpm build
pnpm test
pnpm pack --dry-run --json
git diff -- package.json pnpm-lock.yaml
```

Run the `left-pad` removal only after repository-maintainer approval and in a separate isolated branch based on `d300000000000000000000000000000000000000` [E7]:

```sh
pnpm --config.ignore-scripts=true remove left-pad
pnpm install --frozen-lockfile --ignore-scripts
pnpm build
pnpm test
pnpm pack --dry-run --json
git diff -- package.json pnpm-lock.yaml
```

If either isolated change fails its exit evidence, restore the retained dependency files and resolution [E7]:

```sh
git restore --source=d300000000000000000000000000000000000000 -- package.json pnpm-lock.yaml
pnpm install --frozen-lockfile --ignore-scripts
```

These commands were supplied by the synthetic runbook and were not executed for this example [E6, E7].

## Approval and decision record

The repository maintainer must approve the `left-pad` capability-removal evidence before implementation [E7].
No temporary acceptance is proposed because an evidence-supported candidate `lodash` boundary is available.
If the update cannot be completed before release, the security owner must approve compensating controls, owner, expiry, and revalidation before temporary acceptance [E7].

## Limitations

The inventory is complete only for the synthetic three-node scope at revision `d300000000000000000000000000000000000000` [E1, E2].
The supplied application has no plugin or reflective loader, but no runtime experiment was performed [E3, E5, E6].
Advisory data is the retained synthetic snapshot, not a current external lookup [E4].
Version `4.17.21` is supported only as the first boundary outside the supplied range and a Node.js 20-compatible candidate; it is not described as validated in this service [E4, E8].
License, maintainer, registry-provenance, and signature risk are outside the supplied policy and evidence scope [E6].

## Traceability

| Material conclusion | Evidence |
|---|---|
| Immutable direct declarations and dependency groups | E1 |
| Complete resolved graph and integrity presence | E2 |
| Runtime, dynamic-loading, and immutable packaged-artifact usage | E3 |
| Affected range, condition, boundary, source, and date | E4 |
| Vulnerable API not observed in supplied scope | E5 |
| No package or validation command executed | E6 |
| Severity, owner, exact proposed commands, rollback, and approval policy | E7 |
| Node.js 20 target compatibility and removal-impact limit | E8 |
