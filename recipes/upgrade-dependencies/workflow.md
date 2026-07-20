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

The [synthetic input](examples/input.md) supplies everything the workflow needs for a fictional validation package: a complete version-range record, source and lockfile data, an implemented migration, environment results, an approval, and a rollback drill.
The [complete expected output](examples/expected-output.md) shows what a finished upgrade record looks like, without relying on knowledge of any external package.
