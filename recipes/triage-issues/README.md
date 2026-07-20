# Triage a bounded repository issue queue

Use this recipe to turn a fixed queue snapshot into consistent, evidence-backed disposition proposals without silently responding to, relabeling, assigning, or closing issues.

## Primary use cases

- Triage a periodic queue snapshot or a named issue range under one approved policy revision.
- Identify duplicate candidates while preserving unique evidence.
- Draft minimal information requests, responses, owner roles, next states, and closure criteria for maintainer review.

## When not to use

- A report may contain a vulnerability, secret, customer data, or private reproduction detail that has not entered the private security route.
- The queue is unbounded, changes during review, or lacks evidence required by policy.
- No owner-approved triage policy defines classification, duplicate, closure, and mutation authority.
- The requested result is a technical root cause or code fix rather than issue disposition.

## Required evidence

Provide an immutable snapshot containing every issue body, comment, label, state, environment, reproduction record, and attachment inventory in scope.
Also provide the versioned triage policy, including duplicate thresholds, unsupported-environment handling, closure authority, mutation approvals, and private security routing.

## Produced artifacts

- An issue disposition register that separates facts, claims, inferences, and recommendations.
- A duplicate evidence map with confidence and distinguishing evidence.
- Proposed response drafts and tracker mutations.
- Owned next actions with dependencies, approval states, and closure criteria.

## Primary risks

The main risks are exposing restricted report data, collapsing distinct issues, guessing from missing information, treating unsupported environments as invalid reports, and promising or applying unapproved actions.

## How to use this recipe

1. Freeze the snapshot, policy revision, issue IDs, audience, and authorization boundary.
2. Screen restricted material before public classification.
3. Execute `workflow.md` and use `checklist.md` while classifying and drafting actions.
4. Compare the result with the self-contained synthetic example under `examples/`.
5. Run recipe, content, formatting, and relative-link validation before submitting proposals to their approving roles.

## Files

| File | Purpose |
|---|---|
| `recipe.yml` | Declares catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states. |
| `workflow.md` | Defines the canonical screening, classification, duplicate, approval, and recovery procedure. |
| `checklist.md` | Controls evidence completeness, policy application, restricted data, duplicate confidence, mutations, and delivery. |
| `output.schema.json` | Defines the machine-readable contract for the delivered artifact set. |
| `examples/input.md` | Supplies a complete synthetic snapshot, policy, support matrix, issue records, and authorization boundary. |
| `examples/expected-output.md` | Demonstrates a derivable disposition register, duplicate map, response drafts, and closure criteria. |

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

This workflow proposes actions but does not mutate the tracker.
It cannot establish technical root cause from a report snapshot, choose a priority without product-owner approval, or resolve a policy gap without a maintainer decision.

See [the project recipe quality standard](../../docs/quality/recipe-quality-standard.md).
