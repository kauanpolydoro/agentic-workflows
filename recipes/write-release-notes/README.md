# Produce evidence-backed release notes

Use this recipe to turn release evidence into public Markdown release notes plus a separate internal evidence package whose claims can be independently checked.

It is designed for release managers, repository maintainers, and technical writers preparing notes for a versioned software release.

## Primary use cases

- Draft notes for a release candidate with immutable base and release commits.
- Reconcile merged work with the exact source revision embedded in release artifacts.
- Review breaking actions, deprecations, limitations, and security wording before publication.
- Audit an existing draft for unsupported claims, missing exclusions, and premature final status.

## When not to use

- Release boundaries are mutable or unresolved, artifact source identity is unknown, or candidate changes remain unclassified.
- The requested artifact is incident communication, deployment status, a roadmap, or a marketing announcement.
- The request requires Final status while migration, security, or release-manager approval is unavailable.

## Required evidence

Provide a release identity record with the current and previous versions, requested status, audience, and responsible roles.

Provide immutable base and release commits with a verified ancestry result, a candidate change ledger with range membership and shipping disposition, and revision-specific verification and documentation records for each material included change.

Provide artifact names, checksums, target platforms, and embedded source revisions.

Provide reviewed breaking changes, required actions, deprecations, known limitations, security disposition, and repository maintainer, security owner, and release manager approval states.

The synthetic example shows the required evidence granularity and defines a unique ID for every source used by the expected output.

## Produced artifacts

The workflow produces `release-notes.md` with a visible Draft or Final status, audience-focused highlights, change sections, prominent breaking actions, known limitations, and an ordered upgrade checklist.

It separately produces `release-evidence.md` with the immutable boundary, included and excluded change ledgers, artifact verification, approvals, assumptions, unresolved items, and claim-to-evidence traceability.

## Primary risks

The main risks are announcing work that did not ship, describing artifacts built from another revision, inventing migration instructions or verification results, minimizing known limitations, exposing private or embargoed information, and presenting an unapproved draft as final.

The workflow contains mandatory stop conditions for ambiguous boundaries, artifact mismatches, missing material evidence, unapproved breaking actions, unresolved disclosure scope, and absent final approval.

## How to use this recipe

1. Assemble the required evidence and assign unique evidence IDs before drafting prose.
2. Follow the phases in `workflow.md` to freeze the boundary, classify candidate changes, resolve release risk, and draft only supported claims.
3. Use `checklist.md` during execution to detect omissions in scope, evidence, safety, approvals, and delivery.
4. Reconcile every material public statement against the evidence inventory and complete the internal traceability table.
5. Obtain repository maintainer and security owner approvals at their applicable gates.
6. Keep the artifact in Draft until the release manager reviews the complete evidence-backed document.

## Files

- `recipe.yml` contains catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- `workflow.md` is the canonical operational procedure with decisions, stop conditions, and failure recovery.
- `checklist.md` is the domain-specific execution control for release boundary, evidence, risk, approvals, and delivery.
- `output.schema.json` defines the machine-readable contract for the delivered public and internal artifact set.
- `examples/input.md` is a self-contained synthetic release evidence set.
- `examples/expected-output.md` contains the complete public and internal Markdown files derived from that evidence set.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

This workflow cannot determine whether a change shipped when repository history, change disposition, or artifact identity evidence is incomplete.

It cannot validate the truth of a supplied synthetic or project record beyond the integrity checks available to the executor.

It does not replace artifact signing, security disclosure review, release authority, platform-specific publication procedures, or legal review.

The quality of audience wording still requires human editorial judgment after deterministic structure and traceability checks pass.

See the [recipe quality standard](../../docs/quality/recipe-quality-standard.md) and the [verification model](../../docs/guide/verification.md) for related project-wide requirements.
