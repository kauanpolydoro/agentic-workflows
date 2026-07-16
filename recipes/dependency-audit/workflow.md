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

The complete synthetic example is in [examples/input.md](examples/input.md), with its complete artifact in [examples/expected-output.md](examples/expected-output.md).
It demonstrates evidence traceability without relying on external sources.
