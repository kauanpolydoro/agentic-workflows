# Architecture decision record review checklist

## Boundary and evidence

- [ ] The title states one decision rather than a broad project objective.
- [ ] Affected systems, current state, desired outcome, and explicit exclusions define a stable boundary.
- [ ] Facts, mandatory constraints, preferences, assumptions, and open questions use distinct labels.
- [ ] Every material fact identifies an attributable evidence source.
- [ ] Related ADRs and architecture documents were searched and their relationship is recorded.

## Alternative comparison

- [ ] Common criteria were defined before the preferred option was selected.
- [ ] Mandatory, preferred, and informational criteria are distinguishable.
- [ ] At least two genuinely viable options are described at comparable depth.
- [ ] No-change is included when it remains credible or excluded with a constraint-based reason.
- [ ] Every option exposes ownership, dependencies, operational impact, reversibility, and concrete disadvantages.
- [ ] Every option is described at comparable depth, including unknown ownership or operating evidence rather than silently omitting it.
- [ ] Unknown evidence and assumption-sensitive outcomes remain visible in the comparison.

## Decision and consequences

- [ ] Every reason for the selection maps to a stated driver or mandatory constraint.
- [ ] Positive, negative, and neutral consequences are recorded without marketing language.
- [ ] New coupling, operational burden, migration effort, and failure exposure have dispositions.
- [ ] Decision completion is not confused with implementation completion.
- [ ] Follow-up actions name owner roles, dependencies, objective exit criteria, and verification signals.
- [ ] When staged implementation is required, every phase names an objective exit criterion and a recovery path that preserves prior behavior until verification.
- [ ] Recovery, amendment, or supersession behavior is explicit where implementation can fail.

## Governance and publication

- [ ] Proposed, Accepted, Rejected, or Superseded status exactly matches retained architecture-owner evidence.
- [ ] Supersession identifies the prior decision and its migration consequences in both records when files exist.
- [ ] Sensitive rationale is redacted from public text and retained only in an approved location.
- [ ] Dates, consensus, benchmarks, implementation, and approval are absent unless supplied by evidence.
- [ ] Revisit triggers are measurable and assign a deciding owner role.
- [ ] Links, identifiers, evidence references, assumptions, and limitations have been checked.
- [ ] The published ADR satisfies every completion criterion in `workflow.md`.
