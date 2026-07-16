# Upgrade dependencies with provenance and rollback

## Objective

Transform an immutable dependency baseline and attributable vendor evidence into a scoped dependency change, compatibility disposition, reproducible lockfile diff, validation record, and exercised rollback.
The primary quality constraint is that no target version, transitive package, runtime claim, behavior claim, or verification result may exceed the supplied source and executed evidence.

## When to use

- Use this workflow for a named direct dependency or tightly coupled dependency group with exact current and target versions.
- Use it for planned maintenance, a supported security remediation, or a compatibility update whose impact can be isolated and tested.
- Use it when the manifest and lockfile are committed and the supported runtime matrix can be exercised or explicitly bounded.

## When not to use

- Do not start when target versions, registry provenance, integrity records, or complete vendor guidance for the version range are unavailable.
- Do not combine unrelated major upgrades whose failures could not be attributed to one package group.
- Do not proceed when the current lockfile cannot install reproducibly or baseline failures have no owner and disposition.
- Do not use this procedure to change package managers, registries, runtime support, and application behavior in one upgrade.
- Do not implement a security upgrade under embargo without the security owner's disclosure and handling procedure.

## Required inputs

- **Immutable manifest and lockfile with package manager, registry, integrity, and exact resolved versions:** provide file paths, revision, package-manager version, configured sources, direct constraints, resolved direct and transitive versions, integrity fields, and lifecycle-script inventory.
  These records establish the supply-chain baseline.
  Validate them through a frozen install and lockfile inspection at the recorded revision.
- **Exact target versions with complete official release, migration, runtime, security, and license evidence:** retain attributable records covering every version between current and target, including breaking changes, deprecations, supported runtimes, published security boundaries, licenses, and checksums or signatures when available.
  This evidence defines the migration obligations and compatibility limits.
  Stop if the evidence covers only selected changes or cannot be tied to the target artifact.
- **Repository usage inventory, public behavior contract, supported environment matrix, and exact changed-file boundary:** provide imports, API calls, configuration, generated types, plugin integrations, user-visible behavior, supported runtimes, operating systems, package-manager modes, and every permitted manifest, lockfile, source, and test path.
  This maps vendor changes to actual consumers.
  Validate the inventory with repository search and owner-reviewed support policy.
- **Reproducible baseline commands, approval state, and executable rollback pin:** provide exact install, build, type, lint, test, smoke, or contract commands and results, plus required approver roles and the prior manifest and lockfile restoration method.
  The upgrade cannot be assessed against an unknown baseline or an untestable rollback.

## Optional inputs

- An attributable vulnerability advisory can define urgency, affected versions, and the first fixed version.
  Do not infer a security benefit when no advisory or scan evidence is supplied.
- Software composition policy can add license, source, signature, and install-script gates.
- Deployment telemetry can extend verification after merge when it uses comparable pre-change and post-change signals.

## Preconditions

- A frozen install of the current lockfile succeeds from only approved sources at the immutable revision.
- Baseline build, type, lint, test, and public behavior checks pass, or each existing failure has an owner and disposition.
- Complete current-to-target vendor guidance and runtime support evidence are retained.
- The supported environment matrix identifies every environment that must remain supported.
- The previous manifest and lockfile are retained, and their restoration can be exercised in an isolated worktree.
- Every approval required before implementation is recorded as granted or the workflow stops at assessment.

## Workflow

### Phase 1 - Freeze scope and provenance

1. Record the immutable revision, exact dependency group, current and target versions, motivation, supported environments, and exclusions.
   Produce an upgrade boundary that names every manifest and lockfile allowed to change.
   Advance only when unrelated package updates can be excluded; otherwise split the work.
2. Run the current frozen install and inspect configured registries, integrity data, lifecycle scripts, patches, overrides, and resolved dependency tree.
   Produce the source and resolution baseline.
   Stop on an unapproved registry, missing integrity field, unexplained script, or nonreproducible resolution.

### Phase 2 - Map vendor changes to local use

3. Read the complete official release and migration records across the selected version range.
   Record every breaking change, deprecation, runtime requirement, security boundary, license change, and package split in a version-range register.
   Advance only when each record is attributable to the target package; stop on incomplete guidance.
4. Search manifests, source, tests, configuration, generated artifacts, and plugins for every changed vendor surface.
   Assign each vendor change one local disposition: affected with action, verified unaffected, blocked, or unknown.
   Stop when a mandatory change remains unknown.
5. Establish comparable baseline results for every supported environment and protected public behavior.
   Retain commands, versions, exit statuses, test counts, and representative outputs.
   Advance only when target results can use the same method.

### Phase 3 - Apply the isolated upgrade

6. Obtain the required major-version, runtime, license, or security approval before modifying files.
   Submit the scope, version-range register, local usage mapping, baseline, and rollback method.
   Stop if any applicable approval is pending.
7. Update only the approved direct constraints through the declared package manager and regenerate the lockfile deterministically.
   Produce a full direct and transitive diff including added, removed, upgraded, downgraded, source, integrity, license, and lifecycle-script changes.
   Stop on an unexpected package, registry, integrity, script, patch, or override change.
8. Apply only migrations justified by the version-range register and local usage mapping.
   Keep public behavior stable unless a separately approved contract migration says otherwise.
   Record each changed file by exact path and the vendor item or protected behavior that required it.

### Phase 4 - Verify and exercise recovery

9. Run the target install and the complete baseline command matrix in each supported environment.
   Add focused checks for every affected vendor surface and compare public outputs with the baseline.
   Stop on a new failure, unsupported runtime, or unexplained output difference.
10. In a disposable worktree, restore the prior manifest and lockfile, run a frozen install, confirm the previous resolved tree, and rerun the protected checks.
    Reapply the upgrade and rerun the target checks.
    Stop delivery when either restoration or reapplication cannot reproduce its recorded state.
11. Reconcile source provenance, lockfile diff, compatibility, license, approval, validation, rollback, and residual risk in one delivery record.
    Identify untested environments or deferred migrations as blockers or explicit limitations.
    Advance to merge review only when every completion criterion is directly reviewable.

## Decision points

- If the selected target crosses a major-version boundary, require repository maintainer approval before changing the manifest or lockfile.
- If complete vendor guidance or runtime support evidence is unavailable, hold the upgrade and keep the current version rather than infer compatibility.
- If the regenerated lockfile contains an unexplained package, registry, integrity, lifecycle script, patch, or override change, restore the prior files and investigate provenance before retrying.
- If a new license falls outside policy, choose an approved dependency tree or obtain legal or compliance owner approval before continuing.
- If target checks fail only in one supported environment, roll back and either correct the incompatibility or explicitly change support through the platform-owner gate.
- If an urgent security target conflicts with current compatibility, escalate the supported alternatives, exposure, temporary controls, and rollback evidence to the security and repository owners.

## Safety guardrails

- Never use an untrusted registry or accept unexplained source and integrity changes.
- Never hand-edit resolved lockfile data or omit the complete direct and transitive lockfile diff.
- Never disable install-script audit, type, test, signature, or security checks to obtain a passing result.
- Keep credentials, private registry tokens, and embargoed advisory details out of logs and public artifacts.
- Do not mix package-manager migration, runtime-support change, unrelated dependency updates, or application features into the scoped upgrade.
- Run install scripts and rollback drills only in an approved isolated environment.
- Stop on unexpected credential prompts, network destinations, postinstall behavior, or artifact mutations outside the package-manager scope.

## Human approval gates

- Before any major-version implementation, the repository maintainer reviews the exact version range, breaking-change dispositions, local usage map, baseline, changed-file boundary, and rollback method.
- Before changing supported runtime or platform requirements, the platform owner reviews consumer impact, environment results, communication plan, and restoration path.
- Before accepting a new dependency license, the legal or compliance owner reviews the package identity, version, transitive path, license text, distribution impact, and available alternatives.
- Before merge, the repository maintainer reviews the final lockfile diff, target matrix, public behavior comparison, rollback drill, and unresolved risks.

## Expected output

Produce a scoped manifest, lockfile, source, and test change set.
Accompany it with one Markdown upgrade record containing:

- immutable scope, current and target versions, approved sources, and exclusions;
- a direct and transitive dependency lockfile diff with provenance, integrity, license, and lifecycle-script review;
- a breaking-change, local-usage, compatibility, and license disposition register;
- exact changed-file mapping from vendor requirement or protected behavior to local implementation;
- comparable baseline and target results across supported environments;
- approval evidence and any non-applicable gates;
- rollback restoration and reapplication evidence;
- residual risks, limitations, follow-up owners, and exit criteria; and
- traceability from every material conclusion to retained evidence.

Mark a command as executed only when its environment and result are supplied.
Mark security benefit, runtime compatibility, and license acceptance only when the corresponding evidence exists.

## Completion criteria

- The manifest and lockfile resolve only the approved target tree from approved sources with expected integrity and lifecycle behavior.
- Every vendor change in the selected version range has a local disposition, and every affected usage has an implemented and verified response.
- Baseline and target checks use comparable commands in every retained supported environment.
- Protected public behavior matches the baseline or has a separately approved migration.
- Every added or changed license has an explicit policy disposition.
- The prior tree restoration and target reapplication both pass in every supported environment in an isolated worktree.
- All applicable approval gates are retained, and every limitation has an owner role and exit condition.

## Failure modes

- **F1:** Complete official guidance or target runtime support cannot be established.
- **F2:** The target lockfile introduces an unexplained source, integrity, package, script, patch, or override change.
- **F3:** A locally used breaking surface has no safe migration or public behavior regresses.
- **F4:** One supported environment fails the target matrix.
- **F5:** Rollback does not reproduce the prior dependency tree and baseline checks.

## Recovery procedure

- **R1:** Keep the current version, record the missing source and affected decision, and restart research only when attributable evidence becomes available.
- **R2:** Restore the prior manifest and lockfile, remove the unexplained resolution, verify approved registry configuration, and regenerate the lockfile before retrying.
- **R3:** Revert the target change, isolate the incompatible usage, and choose a compatible target or obtain a separately reviewed behavior migration.
- **R4:** Restore the prior tree, reproduce the environment-specific failure, and either correct it or complete the platform-owner support-change gate before another target run.
- **R5:** Preserve the failed drill evidence, restore through a reviewed clean checkout, correct the rollback procedure, and rerun both restoration and reapplication before delivery.

## Example

The [synthetic input](examples/input.md) supplies a complete version-range record, source and lockfile data, implemented migration, environment results, approval, and rollback drill for a fictional validation package.
The [complete expected output](examples/expected-output.md) demonstrates a finished upgrade record without relying on external package knowledge.
