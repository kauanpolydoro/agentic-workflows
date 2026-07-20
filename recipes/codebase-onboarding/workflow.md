# Build an evidence-based codebase onboarding guide

## Objective

Take one fixed repository revision and one contributor role, and turn them into three artifacts a newcomer can trust: a verified orientation guide, an architecture and user-flow map linked to evidence, and a bounded brief for a first contribution.
The rule that keeps the guide honest: every claim about setup, ownership, behavior, or validation must come from inspected repository evidence, an executed result, or an explicitly identified responsible role.

## When to use

- A new contributor needs a safe path from repository access to one bounded contribution at a fixed revision.
- Maintainers need to reconcile setup instructions, package boundaries, generated files, validation commands, and ownership into one role-specific guide.
- Existing onboarding has gone stale after changes to repository structure, toolchain, commands, ownership, or first-task expectations.

## When not to use

- The repository revision, applicable instructions, or required access boundary cannot be established; a guide built on that gap misleads its reader.
- The setup baseline has not been executed in an isolated clone, or its failure is unresolved; do not claim a setup works when nobody has watched it work.
- The request is really about distributing production credentials, customer data, private endpoints, or undocumented privileged access.
- No first contribution can be named whose files, behavior, validation, forbidden scope, and responsible reviewer are all known.
- Directory names contradict what imports and owner records show; folder names alone are not architecture or ownership.

## Required inputs

- **Immutable repository revision, starting working-tree state, and applicable instruction files:** provide the repository path, commit, branch context when relevant, clean or dirty state, root and nested agent or contributor instructions, and generated-file notices.
  These inputs keep the guide from mixing versions or violating local rules.
  Validate the commit and record which instruction file governs each in-scope path.
- **Target contributor role, access boundary, prerequisites, and expected first contribution:** provide the expected language or domain knowledge, allowed local services, prohibited environments, available access, learning objective, and one bounded outcome.
  The guide must fit this role rather than describe every repository function.
  Validate the task and access boundary with the responsible code owner.
- **Manifests, entry points, package boundaries, ownership records, and source-generated file inventory:** provide workspace manifests, scripts, runtime entry points, dependency direction, code-owner records, generator sources, generated destinations, and safe edit rules.
  These records are what the architecture and ownership map stands on.
  Confirm observed imports and runtime composition rather than relying only on directory names.
- **Exact setup, validation, and representative-flow evidence with executed or blocked status:** provide the command, tool version, environment, exit status, relevant output, and mutation for setup and checks, plus concrete files for one user or data flow.
  Label every unexecuted command and every inaccessible dependency.
  A command listed in a manifest is not evidence that it passed.

## Optional inputs

- Owner-approved review, release, branch, and communication conventions explain how the team collaborates after local validation.
  Omit or label any convention that is not retained in repository or owner evidence.
- Maintainer-curated starter tasks shorten the time to a first contribution, provided their current scope, owner, and acceptance criteria are confirmed.
- Sanitized recurring support records can justify troubleshooting entries, as long as the failure and its recovery have been reproduced.

## Preconditions

- The immutable revision resolves and can be inspected without revealing secret values.
- Applicable root and nested instruction files have been identified for every proposed edit path.
- Tool versions and non-secret access prerequisites are recorded before any setup command runs.
- Setup and at least one focused validation can run in an isolated clone, or the blocked dependency and its owner are explicit.
- Architecture, ownership, and starter-task claims each have an accountable reviewer role.

## Workflow

### Phase 1 - Fix audience, version, and safety boundary

1. Record the repository identity, immutable revision, starting working-tree state, contributor role, expected first outcome, available access, and prohibited environments.
   Produce a guide header and explicit scope exclusions.
   Advance when the role and revision are confirmed; stop when the requested outcome requires access that is unavailable or unapproved.
2. Read the root and path-specific instructions before interpreting or running any repository command.
   Build an instruction-precedence map for the setup paths and the proposed starter-task files.
   Stop when instructions conflict and no repository maintainer disposition exists.

### Phase 2 - Establish a reproducible baseline

3. Inspect engine constraints, workspace manifests, lockfiles, environment templates, service definitions, and script declarations.
   Produce a prerequisite table that names required versions and separates real values from secret examples.
   Advance only when a clean setup command can be selected without exposing credentials or touching shared infrastructure.
4. Run setup in a clean clone or disposable worktree with the recorded tool versions.
   Record filesystem mutations, command results, and any service dependency.
   Do not describe setup as verified if the command was skipped, interrupted, or leaned on an unexplained local cache.
5. Run the smallest command set that proves the repository and the starter-task area are usable, then record broader commands as executed, blocked, or unexecuted.
   Retain the exit status, test count or output, environment, and revision.
   Stop when a failing baseline would make the starter task's result ambiguous.

### Phase 3 - Map how the repository works

6. Inventory the top-level directories and relevant packages by observed responsibility, dependency direction, source or generated status, and owner evidence.
   Reconcile names with imports, composition roots, and manifests.
   Flag conflicts instead of choosing the most convenient explanation.
7. Trace one representative flow from a public entry point through application and domain boundaries to persistence, external integration, or generated output.
   Cite exact files, and keep observation separate from inference.
   Advance when a contributor could identify where behavior begins, where the rules live, and where side effects happen.
8. Identify source-of-truth files, generated outputs, migration-owned files, tests, fixtures, configuration, and forbidden edit paths.
   Record the generator and validation command for every generated destination.
   Stop if the proposed starter task would require editing generated output directly.

### Phase 4 - Design the first contribution

9. Create a role-specific learning path that orders only the concepts and files needed for the expected first outcome.
   Include the shortest verified setup and the daily check loop.
   Resist turning the guide into an exhaustive repository reference; a newcomer needs a path, not an atlas.
10. Define one reversible first-contribution brief with objective behavior, allowed files, forbidden scope, focused tests, the full required checks, the responsible code owner, review evidence, and exit criteria.
    Confirm the task is still current and does not depend on privileged systems.
    If no safe task exists, publish the orientation without inventing one and request a maintainer-curated candidate.
11. Add troubleshooting only for reproduced failures or retained repository procedures.
    State the observed symptom, the evidence for its cause, the safe recovery, the validation, and whether recovery was actually executed.
    Do not publish speculative production or credential guidance.

### Phase 5 - Review and publish

12. Ask a repository maintainer to review the architecture, source-generated boundaries, setup results, command status, ownership, and first-contribution brief.
    Obtain service-owner review before including any privileged access procedure, and responsible code-owner approval for the starter contribution.
13. Validate every command, path, link, version, owner role, result, assumption, and limitation against the immutable evidence set.
    Deliver the orientation guide, the architecture and flow map, the starter brief, the verification status, the blocked steps, and the traceability record.

## Decision points

- If a documented setup command fails at the immutable revision, report the failing baseline and stop before presenting a first contribution whose validation depends on it.
- If directory names and observed imports imply different boundaries, document the observed dependency path and request maintainer disposition for the naming conflict.
- If a command requires privileged infrastructure or secret values, mark it blocked and include only an owner-approved non-secret access request procedure.
- If a path is generated, direct the contributor to its source and generator instead of designating the generated output for editing.
- If no owner record supports an ownership claim, identify the approval role and leave the specific owner unresolved.
- If the proposed starter task crosses package, data, authentication, deployment, or generated boundaries, reduce its scope or require the additional accountable owners before publication.

## Safety guardrails

- Never expose credentials, environment secrets, customer data, or private service endpoints.
- Never invent architecture, ownership, commands, access, or validation results.
- Never recommend destructive setup, production access, or direct edits to generated artifacts.
- Run mutable commands only in a clean clone, disposable worktree, or explicitly approved local environment.
- Do not instruct a newcomer to reset, delete, migrate, or seed shared resources.
- Distinguish repository source from generated, vendored, cached, and environment-specific files.
- Keep the first contribution limited to approved paths and reversible behavior.
- Stop when setup would alter infrastructure or data outside the declared local boundary.

## Human approval gates

- Before publishing architecture, ownership, or setup guidance, the repository maintainer reviews the immutable revision, instruction map, observed dependency flow, generated boundaries, executed results, and stated limitations.
- Before documenting any privileged access procedure, the service owner reviews the minimum role, non-secret request path, environment boundary, expiry or revocation expectations, and prohibited data.
- Before designating a starter contribution, the responsible code owner reviews the current task, allowed and forbidden files, behavior contract, focused validation, full required checks, and objective exit criteria.

## Expected output

Produce one role-specific Markdown onboarding package containing:

- the audience, immutable revision, intended first outcome, prerequisites, access boundary, and exclusions;
- the shortest verified clean-clone setup with exact tool versions and command results;
- daily development and validation commands with executed, blocked, or unexecuted status;
- an evidence-linked directory, package, ownership, and source-generated boundary map;
- one representative flow from entry point to domain behavior and side effect;
- a bounded first-contribution brief with allowed files, forbidden scope, validation, reviewer role, rollback, and closing criteria;
- troubleshooting limited to observed failures and verified or clearly unexecuted recovery;
- approval status, assumptions, limitations, unresolved access, and evidence traceability.

The guide must never make a manifest script look executed or an inferred owner look confirmed.

## Completion criteria

- The repository revision, tool versions, applicable instructions, and setup environment are explicit.
- A clean-clone setup and at least one starter-area validation have retained results, or the guide identifies a blocking owner and does not claim readiness.
- Every architecture, ownership, command-result, and generated-boundary claim maps to repository evidence or an accountable approval.
- The representative flow names concrete entry, application, domain, and side-effect paths as applicable.
- The first contribution has approved scope, behavior, tests, forbidden files, an owner role, rollback, and objective closing criteria.
- Every unexecuted or externally blocked command is labeled without implying a pass.
- Secrets, production access, destructive actions, and direct generated-file edits are absent.
- A repository maintainer has reviewed the publishable guide against the immutable evidence set.

## Failure modes

- **F1:** Setup requires undocumented or unavailable access.
- **F2:** Clean-clone setup or the starter-area baseline fails.
- **F3:** Observed imports, existing documentation, and ownership records conflict.
- **F4:** The proposed starter contribution touches generated, privileged, or cross-owner scope without approval.
- **F5:** A command, version, path, or ownership claim cannot be reproduced at the immutable revision.

## Recovery procedure

- **R1:** Mark the step blocked, remove secret-dependent instructions, assign the service owner, and resume only after an approved non-secret access procedure exists.
- **R2:** Preserve the exact failing command and output, assign baseline repair, and withhold the starter-task readiness claim until the same clean-clone check passes.
- **R3:** Cite each conflicting source, treat observed runtime behavior as an observation rather than the verdict, and obtain repository maintainer disposition before publication.
- **R4:** Choose a smaller source-owned task or gather every required code-owner approval, then revalidate scope and rollback before designating it.
- **R5:** Downgrade the claim to unknown or unexecuted, correct the guide from current evidence, and repeat maintainer review before publishing.

## Example

The [synthetic input](examples/input.md) supplies a fictional TypeScript ledger repository, exact clean-clone results, an observed request flow, ownership records, generated boundaries, and an approved starter task.
The [complete expected output](examples/expected-output.md) demonstrates a publishable guide while keeping the Docker-dependent integration validation explicitly unexecuted.
