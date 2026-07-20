# Audit dependency risk checklist

## Package inventory

- [ ] Manifest and lockfile come from the same immutable revision.
- [ ] Every direct runtime declaration maps to an exact resolved version and integrity record.
- [ ] Production, development, optional, peer, and build-time packages are distinguished.
- [ ] Private packages and inaccessible metadata are explicitly marked unassessed.
- [ ] Advisory records include source, snapshot date, affected range, and known fixed boundary.
- [ ] Duplicate versions, peer resolutions, optional platforms, and parent paths are represented in the graph.
- [ ] Every resolved node records its registry class or an explicit unavailable disposition.

## Reachability and action

- [ ] Affected version presence is reported separately from application reachability.
- [ ] Static searches name APIs and paths checked without claiming complete runtime absence.
- [ ] Runtime reflection, plugins, generated imports, and lifecycle scripts are included or listed as gaps.
- [ ] Each severity follows the dependency policy and accounts for exposure uncertainty.
- [ ] Upgrade targets are exact and sourced, or target selection remains blocked.
- [ ] Removal candidates have repository, build, package, and runtime usage checks.
- [ ] Transitive, license, runtime-support, registry, and lockfile changes are reviewed.
- [ ] The packaged artifact or SBOM is reconciled with the lock graph when that evidence is available.

## Supply-chain controls

- [ ] No unknown lifecycle script or registry request is executed during static audit.
- [ ] Tokens, private registry addresses, and integrity material are handled without disclosure.
- [ ] Each dependency action names a maintainer role, compatibility checks, and rollback.
- [ ] Mutation, validation, and rollback commands are exact, copyable, isolated, and marked executed or proposed.
- [ ] An upgrade target is named only when retained advisory or package evidence supports the exact version.
- [ ] Temporary vulnerable-dependency acceptance has owner, expiry, mitigation, and evidence.
- [ ] Executed package commands are distinguished from proposed isolated-branch checks.
- [ ] Inaccessible private metadata states which subtree stops, whether unrelated analysis may continue, what blocks the overall decision, and the exact resume evidence.
- [ ] The final inventory and risk plan satisfy every completion criterion.
