# Dependency upgrade execution checklist

## Scope and source provenance

- [ ] Current and target versions, immutable revision, manifests, lockfiles, supported environments, and exclusions are fixed.
- [ ] A frozen baseline install resolves from only approved registries with retained integrity data.
- [ ] Lifecycle scripts, patches, overrides, and package-manager configuration are inventoried before the upgrade.
- [ ] Complete official guidance covers every version between current and target.
- [ ] Security and license conclusions are absent unless attributable evidence supports them.

## Breaking-change and usage mapping

- [ ] Every breaking change, deprecation, runtime requirement, package split, and configuration change has one local disposition.
- [ ] Repository search covers source, tests, manifests, configuration, generated types, and plugins.
- [ ] Every affected local usage maps to a specific migration and focused verification.
- [ ] Unknown or unsupported surfaces remain blockers rather than implied compatibility.
- [ ] Public behavior that must remain stable has a concrete before-and-after check.

## Lockfile and implementation controls

- [ ] Only the approved direct constraints changed in manifests.
- [ ] The full lockfile diff accounts for every added, removed, upgraded, and downgraded package.
- [ ] Registry, integrity, license, lifecycle-script, patch, and override changes match the approved evidence.
- [ ] No resolved lockfile field was hand-edited.
- [ ] Each source change cites the vendor change and local usage that require it.
- [ ] Every changed manifest, lockfile, source, and test file is named by exact path and has a recorded reason.
- [ ] Unrelated packages, runtime changes, and application features are absent.

## Validation and recovery

- [ ] Baseline and target commands use the same method in every supported environment.
- [ ] Target results identify runtime, package-manager version, command, exit status, and test count or output.
- [ ] Focused checks cover each affected vendor surface and protected public behavior.
- [ ] The prior manifest and lockfile were restored and frozen-installed in a disposable worktree.
- [ ] The previous resolved tree and protected checks returned to baseline after restoration.
- [ ] The target change was reapplied and its complete matrix passed again in every supported environment.

## Approvals and delivery

- [ ] Major-version approval precedes manifest or lockfile implementation.
- [ ] Any runtime-support change has platform-owner evidence, and any new license has legal or compliance evidence.
- [ ] Credentials, private registry data, and embargoed details are absent from retained public output.
- [ ] Residual risks and untested environments have owner roles and measurable exit conditions.
- [ ] Every material claim maps to evidence, and the final upgrade record satisfies every completion criterion in `workflow.md`.
