# Build an evidence-based codebase onboarding guide

Use this recipe to give one contributor role a trustworthy route from a fixed repository revision to a safe first change.
The result combines verified setup, observed architecture, source and generated boundaries, daily validation, ownership, and a bounded task instead of listing unexplained files and commands.

## Primary use cases

- Onboard a new engineer to one language, domain, package, or contribution type.
- Refresh contributor guidance after toolchain, workspace, ownership, or generated-file boundaries change.
- Trace one representative request or data flow so a newcomer can locate rules and side effects safely.
- Create a first-contribution brief whose files, tests, reviewers, rollback, and closing criteria are explicit.

## When not to use

- The revision, instructions, baseline, access boundary, ownership, or safe first task cannot be established.
- The guide would distribute credentials, document unapproved privileged access, or direct newcomers to production or generated files.

## Required evidence

Provide an immutable revision, starting working-tree state, applicable root and nested instructions, tool manifests, lockfiles, entry points, package imports, and ownership records.

Provide the contributor role, expected first outcome, prerequisites, available and prohibited access, source and generated paths, and responsible reviewer roles.

Provide exact setup and validation commands with environment, execution status, result, and relevant mutations.

Provide concrete file evidence for one representative flow and an owner-approved first task with allowed files, forbidden scope, tests, rollback, and exit criteria.

## Produced artifacts

The workflow produces a role-specific contributor orientation guide with verified clean-clone setup and daily commands.

It includes an evidence-linked architecture, ownership, user-flow, and source-generated boundary map.

It also includes a bounded first-contribution brief with safety controls, focused and full validation, review ownership, rollback, and objective closing criteria.

## Primary risks

The largest risks are exposing secret access, presenting stale commands as verified, inventing ownership, describing folder names as architecture without tracing imports, hiding a broken baseline, and asking a newcomer to edit generated or operationally sensitive files.

The workflow records blocked and unexecuted steps instead of masking them as successful onboarding.

## How to use this recipe

1. Fix the contributor role, immutable revision, expected first outcome, and access boundary.
2. Follow [workflow.md](workflow.md) to inspect instructions and manifests before running any setup command.
3. Verify setup in isolation, trace one concrete flow, and map source, generated, test, and ownership boundaries.
4. Obtain responsible code-owner approval for a reversible starter task.
5. Use [checklist.md](checklist.md) during evidence collection, dry-run review, and publication.
6. Compare the result with the [synthetic repository evidence](examples/input.md) and [complete onboarding guide](examples/expected-output.md).

The `2h` metadata duration is an approximate authoring window for a repository whose baseline and ownership records are already available.
Resolving access, repairing setup, or mapping a large system requires additional time.

## Files

- [recipe.yml](recipe.yml) defines catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- [workflow.md](workflow.md) is the canonical version, setup, architecture, first-task, review, and publication procedure.
- [checklist.md](checklist.md) controls stale commands, unsupported claims, unsafe access, boundary mistakes, and publication omissions.
- [output.schema.json](output.schema.json) defines the machine-readable contract for the delivered artifact set.
- [examples/input.md](examples/input.md) contains a self-contained synthetic TypeScript repository snapshot and execution record.
- [examples/expected-output.md](examples/expected-output.md) demonstrates a complete role-specific guide with an honest blocked integration command.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

An immutable guide still becomes stale when commands, ownership, boundaries, or access procedures change.

Repository evidence cannot prove undocumented systems or consumers do not exist, and a synthetic example cannot demonstrate real newcomer success.

Privileged integration setup may remain intentionally absent until the service owner supplies an approved non-secret procedure.

See the [recipe quality standard](../../docs/quality/recipe-quality-standard.md), [contribution guide](../../docs/guide/contributing.md), and [verification model](../../docs/guide/verification.md).
