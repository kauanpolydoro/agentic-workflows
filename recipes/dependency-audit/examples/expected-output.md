# Dependency risk audit

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
