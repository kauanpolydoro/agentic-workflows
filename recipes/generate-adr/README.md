# Record an evidence-backed architecture decision

Use this recipe to preserve why a durable technical choice was proposed, accepted, rejected, or superseded.
It turns repository facts, explicit constraints, comparable options, accountable approval, and known uncertainty into an ADR that future maintainers can challenge and revisit.

## Primary use cases

- Decide ownership of a cross-cutting capability or boundary used by several consumers.
- Choose an integration, persistence, deployment, or communication pattern with durable operational consequences.
- Record why an existing architecture decision is being amended or superseded and what migration that creates.
- Preserve a Proposed decision honestly when evidence or owner approval is not complete.

## When not to use

- The choice is local and reversible, the requested artifact is an implementation plan or incident report, or a predetermined option will not be compared fairly.
- The requested status is stronger than the retained disposition from the accountable architecture owner.

## Required evidence

Provide one stable decision boundary, affected systems, current state, desired outcome, and explicit exclusions.

Provide attributable facts, mandatory constraints, preferences, assumptions, open questions, and the drivers that will be applied to every option.

Provide at least two viable alternatives at comparable depth, with operational consequences, ownership, migration cost, reversibility, and material disadvantages.

Provide the accountable decision-owner role, actual approval state, related decision search, and any explicit amendment or supersession relationship.

## Produced artifacts

The recipe produces a complete Markdown ADR whose status can be Proposed, Accepted, Rejected, or Superseded.

The artifact includes a common-criteria option comparison, evidence-backed rationale, consequences, uncertainties, owned follow-up, approval record, limitations, revisit triggers, and traceability.

## Primary risks

The main risks are manufacturing consensus, turning preferences into constraints, hiding disadvantages, using incomparable options, inventing benchmark authority, and assigning a status stronger than the approval evidence.

An ADR can also become misleading when it claims that a selected architecture has already been implemented.

## How to use this recipe

1. Frame one decision and separate it from implementation sequencing or adjacent choices.
2. Follow [workflow.md](workflow.md) to build the evidence ledger and define common criteria before selection.
3. Describe every viable option at comparable depth and expose uncertainty that could change the result.
4. Use [checklist.md](checklist.md) during comparison, approval, and publication review.
5. Compare the result with the [synthetic decision evidence](examples/input.md) and [complete ADR](examples/expected-output.md).
6. Publish the actual approval state and retain follow-up and revisit ownership with the decision.

The `2h` metadata duration is an approximate drafting and review window for a stable, evidenced decision boundary.
Evidence collection, experiments, and cross-team approval require separate estimates.

## Files

- [recipe.yml](recipe.yml) defines catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- [workflow.md](workflow.md) is the canonical framing, comparison, consequence, approval, and publication procedure.
- [checklist.md](checklist.md) controls bias, evidence, option parity, consequence, governance, and status omissions.
- [output.schema.json](output.schema.json) defines the machine-readable contract for the delivered artifact set.
- [examples/input.md](examples/input.md) contains a self-contained synthetic architecture decision evidence package.
- [examples/expected-output.md](examples/expected-output.md) demonstrates a complete Accepted ADR with implementation still pending.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

An ADR records a decision and its rationale but cannot ensure that follow-up implementation is funded, correct, or completed.

Qualitative comparisons remain sensitive to missing evidence and organizational constraints, so assumptions and revisit triggers require human scrutiny.

Restricted security, personnel, or commercial evidence may require a public summary that cannot contain the full rationale.

See the [recipe quality standard](../../docs/quality/recipe-quality-standard.md), [existing repository ADR](../../docs/decisions/0001-portable-core-and-data-only-recipes.md), and [verification model](../../docs/guide/verification.md).
