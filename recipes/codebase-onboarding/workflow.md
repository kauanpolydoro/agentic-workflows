# Build an evidence-based codebase onboarding guide

## Objective

Transform an immutable repository snapshot and a defined contributor role into a verified orientation guide, evidence-linked architecture and user-flow map, and bounded first-contribution brief.
Every setup, ownership, behavior, and validation claim must come from inspected repository evidence, an executed result, or an explicitly identified responsible role.

## When to use

- Use this workflow when a new contributor needs a safe path from repository access to one bounded contribution at a fixed revision.
- Use it when maintainers need to reconcile setup instructions, package boundaries, generated files, validation commands, and ownership into one role-specific guide.
- Use it to refresh onboarding after repository structure, toolchain, command, ownership, or first-task expectations change.

## When not to use

- Do not publish a guide when the repository revision, applicable instructions, or required access boundary cannot be established.
- Do not claim successful setup when the baseline has not been executed in an isolated clone or its failure is unresolved.
- Do not use this recipe to provide production credentials, customer data, private endpoints, or undocumented privileged access.
- Do not designate a first contribution when its files, behavior, validation, forbidden scope, or responsible reviewer is unknown.
- Do not treat inferred folder names as architecture or ownership when imports and owner records contradict them.

## Required inputs

- **Immutable repository revision, starting working-tree state, and applicable instruction files:** provide repository path, commit, branch context when relevant, clean or dirty state, root and nested agent or contributor instructions, and generated-file notices.
  These inputs prevent guidance from mixing versions or violating local rules.
  Validate the commit and record which instruction file governs each in-scope path.
- **Target contributor role, access boundary, prerequisites, and expected first contribution:** provide expected language or domain knowledge, allowed local services, prohibited environments, available access, learning objective, and one bounded outcome.
  The guide must fit this role rather than describe every repository function.
  Validate the task and access boundary with the responsible code owner.
- **Manifests, entry points, package boundaries, ownership records, and source-generated file inventory:** provide workspace manifests, scripts, runtime entry points, dependency direction, code-owner records, generator sources, generated destinations, and safe edit rules.
  These records support the architecture and ownership map.
  Confirm observed imports and runtime composition rather than relying only on directory names.
- **Exact setup, validation, and representative-flow evidence with executed or blocked status:** provide command, tool version, environment, exit status, relevant output, and mutation for setup and checks, plus concrete files for one user or data flow.
  Label every unexecuted command or inaccessible dependency.
  A command listed in a manifest is not evidence that it passed.

## Optional inputs

- Owner-approved review, release, branch, and communication conventions can explain how the team collaborates after local validation.
  Omit or label conventions that are not retained in repository or owner evidence.
- Maintainer-curated starter tasks can shorten time to first contribution when current scope, owner, and acceptance criteria are confirmed.
- Sanitized recurring support records can justify troubleshooting entries when their failure and recovery have been reproduced.

## Preconditions

- The immutable revision resolves and is inspectable without revealing secret values.
- Applicable root and nested instruction files have been identified for every proposed edit path.
- Tool versions and non-secret access prerequisites are recorded before setup commands run.
- Setup and at least one focused validation can run in an isolated clone, or the blocked dependency and owner are explicit.
- Architecture, ownership, and starter-task claims have an accountable reviewer role.

## Workflow

### Phase 1 - Fix audience, version, and safety boundary

1. Record repository identity, immutable revision, starting working-tree state, contributor role, expected first outcome, available access, and prohibited environments.
   Produce a guide header and explicit scope exclusions.
   Advance when the role and revision are confirmed; stop when the requested outcome requires unavailable or unapproved access.
2. Read root and path-specific instructions before interpreting or running repository commands.
   Build an instruction-precedence map for the setup paths and proposed starter-task files.
   Stop when instructions conflict and no repository maintainer disposition exists.

### Phase 2 - Establish a reproducible baseline

3. Inspect engine constraints, workspace manifests, lockfiles, environment templates, service definitions, and script declarations.
   Produce a prerequisite table that names required versions and distinguishes values from secret examples.
   Advance only when a clean setup command can be selected without exposing credentials or targeting shared infrastructure.
4. Run setup in a clean clone or disposable worktree with the recorded tool versions.
   Record filesystem mutations, command results, and any service dependency.
   Do not describe setup as verified if the command was skipped, interrupted, or used an unexplained local cache state.
5. Run the smallest command set that proves the repository and starter-task area are usable, then record broader commands as executed, blocked, or unexecuted.
   Retain exit status, test count or output, environment, and revision.
   Stop when a failing baseline would make the starter task's result ambiguous.

### Phase 3 - Map how the repository works

6. Inventory top-level directories and relevant packages by observed responsibility, dependency direction, source or generated status, and owner evidence.
   Reconcile names with imports, composition roots, and manifests.
   Flag conflicts instead of choosing the most convenient explanation.
7. Trace one representative flow from public entry point through application and domain boundaries to persistence, external integration, or generated output.
   Cite exact files and distinguish observation from inference.
   Advance when a contributor can identify where behavior begins, where rules live, and where side effects occur.
8. Identify source-of-truth files, generated outputs, migration-owned files, tests, fixtures, configuration, and forbidden edit paths.
   Record the generator and validation command for every generated destination.
   Stop if a proposed starter task would require direct edits to generated output.

### Phase 4 - Design the first contribution

9. Create a role-specific learning path that orders only the concepts and files needed for the expected first outcome.
   Include the shortest verified setup and daily check loop.
   Avoid turning the guide into an exhaustive repository reference.
10. Define one reversible first-contribution brief with objective behavior, allowed files, forbidden scope, focused tests, full required checks, responsible code owner, review evidence, and exit criteria.
    Confirm the task is still current and does not depend on privileged systems.
    If no safe task exists, publish the orientation without inventing one and request a maintainer-curated candidate.
11. Add troubleshooting only for reproduced failures or retained repository procedures.
    State the observed symptom, cause evidence, safe recovery, validation, and whether recovery was executed.
    Do not publish speculative production or credential guidance.

### Phase 5 - Review and publish

12. Ask a repository maintainer to review architecture, source-generated boundaries, setup results, command status, ownership, and the first-contribution brief.
    Obtain service-owner review before including any privileged access procedure and responsible code-owner approval for the starter contribution.
13. Validate every command, path, link, version, owner role, result, assumption, and limitation against the immutable evidence set.
    Deliver the orientation guide, architecture and flow map, starter brief, verification status, blocked steps, and traceability.

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

- audience, immutable revision, intended first outcome, prerequisites, access boundary, and exclusions;
- the shortest verified clean-clone setup with exact tool versions and command results;
- daily development and validation commands with executed, blocked, or unexecuted status;
- an evidence-linked directory, package, ownership, and source-generated boundary map;
- one representative flow from entry point to domain behavior and side effect;
- a bounded first-contribution brief with allowed files, forbidden scope, validation, reviewer role, rollback, and closing criteria;
- troubleshooting limited to observed failures and verified or clearly unexecuted recovery;
- approval status, assumptions, limitations, unresolved access, and evidence traceability.

The guide must not make a manifest script look executed or an inferred owner look confirmed.

## Completion criteria

- Repository revision, tool versions, applicable instructions, and setup environment are explicit.
- A clean-clone setup and at least one starter-area validation have retained results, or the guide identifies a blocking owner and does not claim readiness.
- Every architecture, ownership, command-result, and generated-boundary claim maps to repository evidence or an accountable approval.
- The representative flow names concrete entry, application, domain, and side-effect paths as applicable.
- The first contribution has approved scope, behavior, tests, forbidden files, owner role, rollback, and objective closing criteria.
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
- **R3:** Cite each conflicting source, prefer observed runtime behavior only as an observation, and obtain repository maintainer disposition before publication.
- **R4:** Choose a smaller source-owned task or gather every required code-owner approval, then revalidate scope and rollback before designating it.
- **R5:** Downgrade the claim to unknown or unexecuted, correct the guide from current evidence, and repeat maintainer review before publishing.

## Example

The [synthetic input](examples/input.md) supplies a fictional TypeScript ledger repository, exact clean-clone results, observed request flow, ownership records, generated boundaries, and an approved starter task.
The [complete expected output](examples/expected-output.md) demonstrates a publishable guide while keeping Docker-dependent integration validation explicitly unexecuted.
