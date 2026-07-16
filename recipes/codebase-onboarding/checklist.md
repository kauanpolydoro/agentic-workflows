# Codebase onboarding publication checklist

## Audience, revision, and access

- [ ] The guide names one contributor role, immutable revision, first outcome, and explicit exclusions.
- [ ] The starting working-tree state and all applicable root or nested instructions are recorded.
- [ ] Required tool versions come from inspected manifests or retained owner evidence.
- [ ] Access prerequisites describe roles and request paths without credentials, secret values, or private endpoints.
- [ ] Any privileged or unavailable dependency is marked blocked with an accountable owner.

## Setup and command evidence

- [ ] Setup was run in a clean clone or disposable worktree at the stated revision.
- [ ] Each executed command includes tool environment, exit status, and relevant result.
- [ ] Manifest scripts that were not run are labeled unexecuted rather than passing.
- [ ] Setup mutations, generated output, caches, services, and containers are identified.
- [ ] A failing baseline blocks any starter-task readiness claim that depends on it.

## Architecture and boundaries

- [ ] Package responsibilities are supported by imports, entry points, manifests, or owner review rather than names alone.
- [ ] One representative flow names concrete entry, application, domain, and side-effect files.
- [ ] Observations and architectural interpretations are distinguishable.
- [ ] Source-of-truth and generated paths are paired with the correct generator and validation command.
- [ ] Ownership claims reconcile with code-owner or maintainer evidence.
- [ ] Conflicting documentation remains visible until a maintainer resolves it.

## First contribution

- [ ] The starter task is current and approved by the responsible code owner.
- [ ] Allowed files, forbidden files, behavior contract, and expected tests are explicit.
- [ ] The task requires no production access, shared-data mutation, or direct generated-file edit.
- [ ] Focused and full required validation commands are separately identified.
- [ ] Rollback is a bounded revert of the starter-task change and does not discard unrelated work.
- [ ] Closing criteria can be reviewed without subjective language.

## Publication and maintenance

- [ ] Troubleshooting entries come from reproduced failures or retained repository procedures.
- [ ] Architecture, setup, ownership, and starter-task wording has repository maintainer review.
- [ ] Privileged access wording, if any, has service-owner approval.
- [ ] Paths, links, versions, commands, results, and evidence references were checked at the immutable revision.
- [ ] Limitations and blocked commands state their effect on contributor readiness.
- [ ] The final onboarding package satisfies every completion criterion in `workflow.md`.
