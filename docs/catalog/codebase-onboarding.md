---
title: "Build an evidence-based codebase onboarding guide"
description: "Turn a fixed repository snapshot into an onboarding guide a newcomer can trust, with verified setup, traced architecture, safe edit boundaries, and a bounded first task."
---

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

The [synthetic input](#complete-example-input) supplies a fictional TypeScript ledger repository, exact clean-clone results, an observed request flow, ownership records, generated boundaries, and an approved starter task.
The [complete expected output](#complete-expected-output) demonstrates a publishable guide while keeping the Docker-dependent integration validation explicitly unexecuted.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/codebase-onboarding/1.0.0",
  "title": "Codebase onboarding output contract",
  "description": "Validates the contributor guide, verified setup, architecture map, starter task, troubleshooting, and evidence traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "codebase-onboarding-guide.md",
        "audience": "New contributors and repository maintainers",
        "requires_title": true,
        "required_headings": [
          "Audience, revision, and first outcome",
          "Prerequisites and access boundary",
          "Verified clean-clone setup",
          "Architecture and ownership map",
          "Source and generated boundaries",
          "Daily validation loop",
          "Required behavior",
          "Allowed files",
          "Implementation and review sequence",
          "Closing criteria",
          "Troubleshooting",
          "Verification, approvals, and limitations",
          "Evidence traceability"
        ],
        "required_literals": [
          "| Boundary | Role in the system | Dependency rule | Responsible reviewer role | Evidence |",
          "Representative flow:"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This example describes a fictional repository.
Every version, path, command result, owner, and task fact used by the expected guide is supplied below.

## Contributor objective

The audience is a TypeScript backend contributor who knows unit testing but has not worked in a layered domain application.
Their first outcome is to implement approved issue `START-12`, which rejects an optional ledger-entry reference containing only whitespace.

The task must not change HTTP schemas, persistence, generated files, dependencies, deployment, or production data.

## Evidence inventory

### E1 - Immutable repository, contributor, access, and instruction state

- Repository: synthetic `harbor-ledger` workspace.
- Commit: `71c8e42000000000000000000000000000000000`.
- Starting working tree: clean.
- Target contributor: a TypeScript backend contributor who knows unit testing but is new to layered domain applications.
- Available access: repository read and local-write access in the clean clone only, with no production, shared-database, credential, or private-service access.
- Root `AGENTS.md`: domain rules belong in `packages/domain`; HTTP and PostgreSQL adapters depend inward; generated files must not be edited directly; no production or shared-database commands are allowed during onboarding.
- `packages/domain/AGENTS.md`: domain code must remain independent of HTTP, database, framework, and environment imports; behavior changes require focused unit tests.

`git rev-parse HEAD` returned `71c8e42000000000000000000000000000000000`, and `git status --short` returned no entries.

### E2 - Toolchain and workspace manifests

`package.json` requires Node.js 22 and declares pnpm 9.15.4.
`pnpm-workspace.yaml` includes `packages/*` and `apps/*`.
Both retained manifest records come from commit `71c8e42000000000000000000000000000000000`, and the inventory is complete for the workspace globs, required tool versions, and root scripts used by this guide.

Root scripts are:

- `pnpm build` for all workspace builds;
- `pnpm typecheck` for project references;
- `pnpm test:unit` for unit tests;
- `pnpm test:integration` for PostgreSQL integration tests;
- `pnpm generate:http` for HTTP types; and
- `pnpm check:generated` to compare generated HTTP types with their source contract.

### E3 - Package and entry-point inventory

| Path | Observed responsibility |
| --- | --- |
| `apps/api/src/main.ts` | composition root and HTTP server startup |
| `packages/adapters-http/src/routes/entries.ts` | `POST /entries` transport parsing and response mapping |
| `packages/application/src/create-entry.ts` | create-entry use-case orchestration |
| `packages/domain/src/ledger-entry.ts` | ledger-entry invariants and construction |
| `packages/domain/src/entry-repository.ts` | persistence port |
| `packages/adapters-postgres/src/postgres-entry-repository.ts` | PostgreSQL implementation of the port |

The supplied import report shows adapters depend on application and domain, application depends on domain, and domain imports no adapter or application package.
The retained report was generated from commit `71c8e42000000000000000000000000000000000` and is complete for every package, entry point, and dependency edge named in the onboarding scope.

### E4 - Representative request flow

For `POST /entries`:

1. `apps/api/src/main.ts` constructs the PostgreSQL repository and `createEntry` use case.
2. `packages/adapters-http/src/routes/entries.ts` parses the generated request type and calls `createEntry`.
3. `packages/application/src/create-entry.ts` calls `LedgerEntry.create` and then `EntryRepository.save`.
4. `packages/domain/src/ledger-entry.ts` enforces amount, account, and optional reference invariants.
5. `packages/adapters-postgres/src/postgres-entry-repository.ts` writes the accepted entry.

The HTTP adapter maps the domain code `ENTRY_REFERENCE_INVALID` to status `422`.
The retained request-flow inspection covers the complete `POST /entries` path at commit `71c8e42000000000000000000000000000000000`; it establishes source structure and mapping behavior, not an executed request.

### E5 - Source, generated, and ownership boundaries

- Source contract: `contracts/ledger-api.yml`.
- Generated destination: `packages/adapters-http/src/generated/ledger-api-types.ts`.
- Generator: `pnpm generate:http`.
- Consistency check: `pnpm check:generated`.
- `CODEOWNERS` assigns `packages/domain/**` to the domain maintainer role, HTTP contract and adapter paths to the API maintainer role, PostgreSQL adapter paths to the data maintainer role, and application plus composition-root paths to the repository maintainer role.

The generated file header says it is generated from `contracts/ledger-api.yml` and must not be edited directly.
The contract, generated-file header, generator script, consistency check, and `CODEOWNERS` record were all inspected at commit `71c8e42000000000000000000000000000000000` and are complete for the paths named in this section.

### E6 - Clean-clone setup and baseline results

In a clean clone at `71c8e42000000000000000000000000000000000` on Linux x64 with Node.js 22.11.0 and pnpm 9.15.4:

- `pnpm install --frozen-lockfile` exited `0`.
- `pnpm typecheck` exited `0`.
- `pnpm test:unit` exited `0` with 73 tests passing.
- `pnpm build` exited `0`.
- `pnpm check:generated` exited `0` with no diff.

These commands created only ignored package-manager and build-cache directories.
Each retained command record identifies commit `71c8e42000000000000000000000000000000000`, Linux x64, Node.js 22.11.0, pnpm 9.15.4, the exact command, exit status, and relevant result.

### E7 - Integration-test access limitation

`pnpm test:integration` was not executed because the onboarding environment has no Docker daemon and no PostgreSQL service.
The repository contributor guide says integration tests require the local Compose service started by `pnpm dev:services`.

No service-owner approval or executed result for that local service procedure is supplied.
The starter issue in E9 changes only domain code and does not require a database to meet its focused acceptance criteria.
The integration-test limitation is retained for commit `71c8e42000000000000000000000000000000000` and is complete for the unavailable Docker and PostgreSQL prerequisites known to the supplied contributor guide.

### E8 - Observed toolchain troubleshooting record

An earlier disposable clone used Node.js 20.17.0.
`pnpm install --frozen-lockfile` stopped before package installation with `Unsupported engine: wanted node >=22`.

After switching that clone to Node.js 22.11.0, the same install command exited `0`.
No file outside ignored package-manager state was changed by the failed attempt.
The troubleshooting record identifies the disposable clone at commit `71c8e42000000000000000000000000000000000`, both runtime versions, the exact command, and both observed results.

### E9 - Approved starter issue

Issue `START-12` is approved by the domain maintainer role.

Current behavior accepts `reference: "   "` because `LedgerEntry.create` checks only string length.
Required behavior is to return domain error code `ENTRY_REFERENCE_INVALID` when a supplied reference becomes empty after trimming.
Undefined reference remains valid, and a nonblank reference retains its original stored value.

Allowed files:

- `packages/domain/src/ledger-entry.ts`;
- `packages/domain/test/ledger-entry.test.ts`.

Required focused cases:

- undefined reference remains accepted;
- whitespace-only reference returns `ENTRY_REFERENCE_INVALID`;
- nonblank reference preserves its supplied value.

Forbidden scope includes HTTP schemas, generated types, application orchestration, repositories, dependencies, and deployment files.

Required validation is `pnpm test:unit -- ledger-entry`, `pnpm typecheck`, `pnpm test:unit`, and `pnpm build`.
Rollback is reverting only the two allowed-file changes and rerunning the E6 baseline commands.
The retained `START-12` approval snapshot is tied to repository commit `71c8e42000000000000000000000000000000000` and is complete for acceptance criteria, allowed files, forbidden scope, validation, reviewer role, and rollback.

### E10 - Publication approval and limitations

The repository maintainer reviewed E1 through E9 and approved publication of architecture, setup, ownership, and starter-task guidance for commit `71c8e42000000000000000000000000000000000`.
The domain maintainer remains the required reviewer for the eventual `START-12` code change.

No privileged access procedure is included or approved.
The guide must state that integration validation is unexecuted and that the clean-clone evidence applies only to Linux x64.
The publication approval identifies the repository-maintainer role, commit `71c8e42000000000000000000000000000000000`, reviewed evidence range E1 through E9, approved audience, and explicit limitations.

## Complete expected output

## Audience, revision, and first outcome

This guide is for a TypeScript backend contributor who knows unit testing and is learning the synthetic `harbor-ledger` layered domain boundary at immutable commit `71c8e42000000000000000000000000000000000` (E1).
The first contribution is approved issue `START-12`, which adds the whitespace-only reference invariant within two domain files (E9).

HTTP schemas, persistence, generated files, dependencies, deployment, production systems, and shared data are outside this onboarding path (E1, E9).

## Prerequisites and access boundary

- Linux x64, matching the only executed setup environment (E6, E10).
- Node.js 22.11.0 and pnpm 9.15.4, matching the verified toolchain (E2, E6).
- TypeScript and unit-testing familiarity, matching the target role (E1).
- Repository read and local-write access only (E1).

No credential, production, Docker, PostgreSQL, or private-service access is required for the focused starter issue (E7, E9, E10).
Integration tests remain unavailable in the evidenced environment and are not reported as passing (E7).

## Verified clean-clone setup

At commit `71c8e42000000000000000000000000000000000`, run:

```sh
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test:unit
pnpm build
pnpm check:generated
```

On Node.js 22.11.0 with pnpm 9.15.4, these commands exited `0`, 73 unit tests passed, and the generated consistency check reported no diff (E6).
They created only ignored package-manager and build-cache directories (E6).

Do not run production, shared-database, or destructive setup commands during this onboarding path (E1).

## Architecture and ownership map

| Boundary | Role in the system | Dependency rule | Responsible reviewer role | Evidence |
| --- | --- | --- | --- | --- |
| `apps/api/src/main.ts` | composition and server startup | may assemble adapters and application | repository maintainer | E3, E5 |
| `packages/adapters-http` | HTTP parsing and response mapping | depends inward on application and domain | API maintainer | E3, E5 |
| `packages/application` | use-case orchestration | depends on domain ports and rules | repository maintainer | E3, E5 |
| `packages/domain` | ledger invariants and persistence ports | imports no application or adapter package | domain maintainer | E1, E3, E5 |
| `packages/adapters-postgres` | PostgreSQL implementation | depends on the domain repository port | data maintainer | E3, E5 |

The import report, not directory names alone, establishes the inward dependency direction (E3).

## Representative `POST /entries` flow

1. `apps/api/src/main.ts` assembles the PostgreSQL repository and create-entry use case (E4).
2. `packages/adapters-http/src/routes/entries.ts` parses the generated request type and calls the use case (E4).
3. `packages/application/src/create-entry.ts` constructs the domain value and invokes `EntryRepository.save` (E4).
4. `packages/domain/src/ledger-entry.ts` owns amount, account, and optional reference invariants (E4).
5. `packages/adapters-postgres/src/postgres-entry-repository.ts` performs the accepted persistence side effect (E4).

Domain error `ENTRY_REFERENCE_INVALID` is mapped to HTTP status 422 by the HTTP adapter, but the starter task changes only the domain condition and tests (E4, E9).

## Source and generated boundaries

`contracts/ledger-api.yml` is the source contract for `packages/adapters-http/src/generated/ledger-api-types.ts` (E5).
Use `pnpm generate:http` to regenerate that destination and `pnpm check:generated` to verify consistency (E2, E5).

Do not edit the generated destination directly (E1, E5).
The starter task does not change the contract or generated output (E9).

## Daily validation loop

For domain work, begin with the focused command and expand before review:

```sh
pnpm test:unit -- ledger-entry
pnpm typecheck
pnpm test:unit
pnpm build
```

The full unit, typecheck, and build commands passed in the clean-clone baseline (E6).
The focused starter-task command is required by E9 but has not been run against a future implementation, so no post-change result is claimed.

`pnpm test:integration` exists but is unexecuted in this evidence set because Docker and PostgreSQL are unavailable (E2, E7).
Do not infer integration readiness from the unit baseline (E6, E7).

## Safe first contribution: `START-12`

### Required behavior

- Keep undefined reference valid (E9).
- Return `ENTRY_REFERENCE_INVALID` when a supplied reference becomes empty after trimming (E9).
- Preserve the original supplied value for a nonblank reference (E9).

### Allowed files

- `packages/domain/src/ledger-entry.ts` (E9).
- `packages/domain/test/ledger-entry.test.ts` (E9).

Do not change HTTP schemas, generated types, application orchestration, repository adapters, dependencies, or deployment files (E9).

### Implementation and review sequence

1. Read the domain instruction file and existing ledger-entry tests (E1, E9).
2. Add the three focused cases from E9 before or with the bounded invariant change.
3. Keep adapter and transport mappings unchanged (E9).
4. Run the focused test, typecheck, all unit tests, and build in that order (E9).
5. Submit only the two allowed files to the domain maintainer role for review (E5, E9, E10).

### Closing criteria

- All three required reference cases have explicit tests (E9).
- The focused command passes (E9).
- Typecheck, all unit tests, and build pass (E9).
- The diff contains only the two allowed files (E9).
- No generated, HTTP, persistence, dependency, or deployment file changes (E9).
- The domain maintainer approves the behavior and scope (E9, E10).

If the change cannot meet these criteria, revert only the two allowed-file changes and require the E6 baseline commands to pass before another attempt (E6, E9).

## Troubleshooting

### Install reports an unsupported Node engine

Observed symptom: Node.js 20.17.0 caused `pnpm install --frozen-lockfile` to stop with `Unsupported engine: wanted node >=22` (E8).

Recovery: switch the disposable clone to Node.js 22.11.0 and rerun the same install command (E8).
That recovery exited `0` in the supplied record (E8).

Do not bypass the engine check because the verified baseline uses Node.js 22.11.0 (E6, E8).

### Integration tests need PostgreSQL

The repository guide names `pnpm dev:services`, but that procedure was not executed or approved in this evidence set (E7).
Treat integration validation as unavailable and ask the service owner for an approved local procedure if future work requires it (E7).

## Verification, approvals, and limitations

The repository maintainer approved this architecture, setup, ownership, and starter-task guide for commit `71c8e42000000000000000000000000000000000` (E10).
The domain maintainer approved the task boundary and remains the reviewer for the eventual code change (E9, E10).

Clean-clone installation, typecheck, 73 unit tests, build, and generated consistency passed only on Linux x64 with the declared toolchain (E6, E10).
Integration tests were not executed, and no starter-task implementation or post-change result exists yet (E7, E9).

This guide must be revalidated when the revision, manifests, commands, ownership, generated boundary, or issue scope changes.

## Evidence traceability

- Revision, contributor role, access boundary, and instructions: E1.
- Toolchain and scripts: E2.
- Package boundaries: E3.
- Representative flow: E4.
- Generated and ownership boundaries: E5.
- Executed baseline: E6.
- Integration limitation: E7.
- Reproduced setup recovery: E8.
- Starter issue: E9.
- Publication approval and declared limits: E10.
