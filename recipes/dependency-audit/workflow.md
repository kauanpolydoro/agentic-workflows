# Audit dependency risk

## Objective

Take an immutable set of dependency declarations, the lockfile graph they resolve to, and a dated advisory snapshot, then turn them into three artifacts: a reproducible inventory, an evidence-ranked finding register, and a dependency action plan.
The quality constraint that matters most is keeping three statements apart: affected-version presence, vulnerable-API reachability, and demonstrated exploitability.
Never collapse them into a single claim.

## When to use

- You need a supply-chain risk snapshot before a release.
- Runtime dependencies need an assessment covering removal, upgrade, license, provenance, or maintenance.
- A repository needs a time-bounded decision about a specific advisory or an unused direct dependency.

## When not to use

- The manifest and its matching lockfile are unavailable.
- Resolving the dependency graph would require executing untrusted install scripts.
- The request calls for a legal conclusion rather than an engineering risk assessment.
- The advisory source, snapshot time, affected range, or vulnerable condition cannot be retained.

## Required inputs

- **Immutable revision, dependency manifests, and dependency-group policy:** Supply the commit or archive digest, the complete manifest excerpts, the workspace boundaries, and the rule that tells runtime, development, optional, peer, and build dependencies apart.
  Together these define what the project declares and where the audit stops.
  Resolve the revision, then confirm that the manifest excerpts and the policy belong to it.
- **Matching lockfiles with complete resolved graph, versions, and integrity records:** Supply every importer entry, package node, graph edge, resolved version, and integrity field for the audited scope.
  This is the evidence of what actually gets installed or packaged, as opposed to what the manifest merely requests.
  Confirm that frozen resolution succeeds without manifest drift, or parse a trusted existing lockfile instead, and never execute package lifecycle scripts either way.
- **Dated advisory records with affected ranges, conditions, and source identity:** Supply the snapshot timestamp, advisory identifier, ecosystem, affected range, vulnerable API or configuration, fixed boundary when one is known, and the retained source identity.
  This record makes the result reproducible, and it keeps a bare package-name match from quietly becoming an exploitability claim.
  Validate the advisory syntax and keep the exact snapshot; refreshing it during analysis would silently change your evidence.

## Optional inputs

- **Runtime import, call-site, and packaged-artifact inventory:** Improves reachability analysis by identifying static imports, dynamic loaders, plugins, generated code, and bundled packages.
- **Software bill of materials:** Lets you compare what the lockfile resolved against what the produced artifact actually contains.
- **License policy and provenance records:** Let you classify approved licenses, registries, signatures, and maintainership as an engineering matter, without replacing legal review.

## Preconditions

- The manifest and lockfile belong to the same immutable revision.
- Production and development dependencies can be told apart.
- The advisory snapshot carries an explicit timestamp and a retained source identity.
- Registry credentials and private registry addresses can stay redacted throughout.
- Lockfile inspection, and any experimental resolution, can run with lifecycle scripts disabled and inside a disposable directory.

## Workflow

1. **Freeze the audit boundary.**
   Record the immutable revision, the workspace and ecosystem scope, the manifest and lockfile paths, the dependency-group policy, the advisory snapshot time, and any exclusions.
   Hash or otherwise identify each artifact you were given.
   Advance only when every manifest maps to a lockfile importer from the same revision; if any pair disagrees, stop under F1.
2. **Build the resolved dependency inventory.**
   Parse the direct declarations and walk the lockfile graph, without running lifecycle scripts.
   For each package, record direct or transitive status, dependency group, exact version, parent path, integrity presence, registry class, and any platform conditions.
   Reconcile duplicate versions and peer resolutions before moving on.
3. **Reconcile packaged and runtime scope.**
   When the optional inventories are supplied, compare the lock graph against the SBOM, the bundle, runtime imports, dynamic loading, generated code, plugins, and build scripts.
   A package absent from the packaged artifact is not the same as a package that static source merely never references, so mark the two cases separately.
   Do not claim absence while runtime mechanisms remain uncovered.
4. **Match advisory records.**
   Check each resolved version against the exact affected range and ecosystem in the retained snapshot.
   Record advisory presence, the vulnerable API or configuration, the fixed boundary, and any fields the record leaves out.
   A name or version match creates an affected-version observation, nothing more; it is not proof of reachability.
5. **Assess reachability and exposure.**
   Search the supplied imports and call sites for the vulnerable API, then inspect the configuration and data sources the advisory condition depends on.
   Keep three kinds of evidence apart: what static analysis showed, which runtime mechanisms went uninspected, and any safe runtime result that was supplied.
   Assign reachability as demonstrated, not observed, unknown, or not applicable, with a rationale for your confidence.
6. **Assess non-advisory dependency risk.**
   Apply the supplied policies to unused direct dependencies, unsupported runtimes, provenance, integrity, maintenance, and licenses.
   Do not issue a legal conclusion, and do not treat missing optional provenance as malicious behavior.
7. **Select an action with evidence.**
   For each finding, weigh removal, an exact-version upgrade, a constraint change, monitoring, and temporary acceptance against each other.
   Spell out the consumer impact, the owner role, the required approvals, exact copyable mutation and validation commands, the exit criteria, and the rollback path to the retained manifest and lockfile.
   Treat every command as proposed until its retained result identifies the isolated revision and the exit status.
   Never name an upgrade target unless the supplied advisory or a trusted package record supports it.
8. **Produce and approve the audit artifact.**
   Deliver the scope, the complete inventory, the finding register, the actions, executed and proposed checks, assumptions, limitations, and traceability.
   Obtain repository-maintainer approval before removing public runtime capability, and security-owner approval before temporarily accepting a vulnerable dependency.

## Decision points

- If the manifest and lockfile disagree, stop and regenerate or obtain the matching immutable pair.
- If an advisory affects a resolved version but no runtime path is shown, report affected presence and mark reachability as unknown.
- If static search finds no use of the vulnerable API while dynamic loading, plugins, generated code, or reflection remain uninspected, classify reachability as unknown rather than unreachable.
- If the advisory lacks a supported fixed boundary, do not guess an upgrade target; request authoritative version evidence or choose a separately justified mitigation.
- If a removal changes public runtime capability, require repository maintainer approval before implementation.
- If a reachable vulnerability cannot be remediated before release, require security-owner acceptance with controls, an owner, an expiry, and revalidation evidence.
- If the only way to resolve metadata is running an unknown lifecycle script, stop dynamic resolution and rely on static evidence with the gap documented.
- If private metadata is inaccessible, stop findings and actions for that package subtree; continue unrelated graph analysis only when the lockfile proves the subtree boundary, and stop the requested release decision when the inaccessible subtree can change that decision.

## Safety guardrails

- Never run install or lifecycle scripts from unknown packages during the audit.
- Never print registry tokens, and never copy private registry URLs into public output.
- Do not claim exploitability without reachability evidence.
- Do not install, publish, remove, or upgrade dependencies in the audited working tree during a read-only audit.
- Perform experimental resolution only in a disposable directory, with scripts disabled and no production credentials present.
- Do not contact unapproved private registries, and do not include private package contents in a public artifact.
- Preserve the original manifest and lockfile as rollback evidence for any proposed change.

## Human approval gates

- Before removing a public runtime capability, the repository maintainer approves the static and packaged usage evidence, the consumer impact, the validation plan, and the manifest-and-lockfile rollback.
- Before temporarily accepting a vulnerable dependency, the security owner approves the affected-version and reachability evidence, the severity, the compensating controls, the accountable owner, the expiry, and the revalidation date.

## Expected output

- **Reproducible dependency inventory and audit scope:** The immutable revision, snapshot time, and artifact identities, plus every in-scope direct and transitive resolution with its dependency group, integrity status, and coverage exclusions.
- **Risk-ranked dependency finding register with reachability dispositions:** One row per finding, carrying the finding, evidence, impact, severity, confidence, recommendation, verification, disposition, advisory status, and reachability.
- **Removal, upgrade, monitoring, or acceptance plan:** The exact target when evidence supports one, the owner role, dependencies, commands to run, objective exit criteria, rollback, approvals, assumptions, and limitations.

The artifact must keep observations, inferences, recommendations, executed checks, proposed checks, assumptions, limitations, and next actions clearly apart.
Material claims must cite example evidence IDs.

## Completion criteria

- The inventory is tied to an immutable revision and a timestamp.
- Every in-scope direct and transitive resolution carries an exact version and an integrity disposition.
- Every advisory finding identifies its affected resolved version, source snapshot, range, and vulnerable condition.
- Reachability is either evidenced or explicitly unknown, and exploitability is never claimed without validation.
- Every action has an owner, a supported target or an explicit target blocker, validation, rollback, and its required approval gate.
- Executed package operations are clearly distinguished from proposed isolated changes.

## Failure modes

- **F1:** The lockfile does not match the manifest.
- **F2:** An advisory record lacks the affected range, vulnerable condition, or fixed-version evidence that the requested decision needs.
- **F3:** Private package metadata cannot be reached without exposing credentials or contacting an unapproved registry.
- **F4:** Safe resolution would require running unknown lifecycle scripts.

## Recovery procedure

- **R1:** Obtain the matching immutable manifest-lockfile pair, or generate one in an approved disposable environment with scripts disabled, then retain the new artifact identities and restart at workflow step 1.
- **R2:** Request a complete retained advisory record, keep target selection and affected-status conclusions blocked in the meantime, and resume at workflow step 4 only after the record is validated.
- **R3:** Stop advisory, provenance, license, and action conclusions for the inaccessible private package and its affected subtree, retain only redacted metadata, and escalate through the package owner without contacting the registry.
  Continue analyzing unrelated nodes only when the supplied lockfile establishes a complete subtree boundary; otherwise stop any audit conclusion that depends on graph completeness.
  Resume at workflow step 2 once the package owner supplies an approved immutable metadata record with provenance, or at step 4 when only a complete retained advisory record was missing, and re-run every downstream inventory and finding that included the subtree.
- **R4:** Stop dynamic resolution, fall back to static manifest and lockfile analysis, record lifecycle-dependent coverage as unknown, and resume at workflow step 2 without claiming a complete runtime inventory.

## Example

The complete synthetic example lives in [examples/input.md](examples/input.md), and its complete artifact is in [examples/expected-output.md](examples/expected-output.md).
It demonstrates evidence traceability without relying on external sources.
