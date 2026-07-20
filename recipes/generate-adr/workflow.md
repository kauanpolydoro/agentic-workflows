# Record an evidence-backed architecture decision

## Objective

Turn a stable architecture question, attributable evidence, and an accountable approval state into a complete decision record: comparable alternatives, explicit consequences, owned follow-up work, and measurable revisit triggers.
Above all, the ADR must keep six things visibly apart: observed facts, assumptions, preferences, recommendations, approvals, and implementation work that has not happened yet.

## When to use

- A choice has durable consequences for system boundaries, data ownership, integration contracts, operational dependencies, security posture, or several consumers.
- At least two viable alternatives can be evaluated against the same decision drivers.
- You need to propose a decision, retain an approved one, reject a proposal, or explicitly supersede a related ADR.

## When not to use

- The problem boundary, mandatory constraints, affected systems, or accountable owner role is still unknown; frame the question first.
- The choice is local, cheap, and easily reversible, and does not constrain future work; an ADR would be ceremony.
- The real goal is to rationalize a preselected option while withholding a viable alternative or a material disadvantage.
- Nobody can supply retained owner evidence, so the record cannot honestly be marked Accepted, Rejected, or Superseded.
- The document you actually need is an incident record, implementation plan, API specification, or security exception process.

## Required inputs

- **Stable decision boundary, affected systems, current state, and explicit exclusions:** state exactly one decision, what changes if it is made, which systems and consumers are affected, and which adjacent questions remain out of scope.
  This keeps one ADR from hiding several unrelated choices.
  Validate the boundary with repository evidence and the accountable owner before comparing options.
- **Attributable facts, constraints, assumptions, open questions, and decision drivers:** identify the source and integrity of each fact, distinguish mandatory constraints from preferences, label every assumption, and list unresolved questions.
  These inputs explain what can eliminate or favor an option.
  Do not let an unsupported preference dress up as a constraint.
- **Viable alternatives evaluated against common criteria with concrete disadvantages:** provide at least two genuinely possible options, including no change when it is credible, and apply the same defined criteria to each.
  Each option needs positive, negative, transition, and operational consequences.
  Check that no option was intentionally underspecified to manufacture a preferred result.
- **Accountable decision owner, approval state, related decisions, and supersession relationship:** provide the approving role, the exact current status, retained review or approval evidence, and links or identifiers for related ADRs.
  Status must remain Proposed while approval is absent.
  Supersession requires an explicit old-to-new relationship and a migration consequence.

## Optional inputs

- Reproducible benchmarks, incident records, cost models, or security reviews strengthen a driver when their methods, scope, and provenance are retained.
  Without that, label the statement as an assumption or leave it out.
- Reversible experiment results can reduce uncertainty, as long as a pilot is not converted into production proof.
- Implementation sequencing and migration constraints make consequences actionable, but they never prove that implementation occurred.

## Preconditions

- One accountable architecture decision owner role is identified.
- The decision boundary is stable enough to compare at least two viable alternatives.
- Facts, constraints, preferences, assumptions, and unknowns are separately identifiable.
- Every mandatory criterion has a validation method or an explicit evidence gap.
- Existing related decisions have been searched, and any conflict or supersession relationship is known.

## Workflow

### Phase 1 - Frame the decision

1. Write a one-sentence decision question, then the affected systems, current state, desired outcome, and exclusions.
   Assign a provisional ADR identifier only through the repository's naming convention.
   Advance when the owner role confirms this is one durable decision; stop and split a compound question.
2. Build an evidence ledger that separates facts, mandatory constraints, preferences, assumptions, and open questions.
   Record source IDs and note any sensitivity or publication restriction.
   Advance only when each material context claim can be sourced or is explicitly labeled as an assumption.
3. Search related ADRs, architecture documents, contracts, and active migrations.
   Record whether the new ADR is independent, related, amending, or superseding.
   Stop if an existing accepted decision already governs the boundary and no supersession review is authorized.

### Phase 2 - Compare alternatives

4. Define common criteria before scoring or selecting anything.
   Mark each criterion as mandatory, preferred, or informational, and define what satisfactory evidence looks like.
   Stop if the criteria encode an option's name or cannot be applied consistently.
5. Describe every viable option at comparable depth: ownership, dependencies, operational model, migration effort, reversibility, and material disadvantages.
   Include no change when it remains viable.
   Remove an option only with an explicit constraint-based reason.
6. Evaluate every option against every criterion using evidence, stated inference, or known uncertainty.
   Produce a comparison table and a sensitivity note for the assumptions that could change the result.
   If no option satisfies all mandatory criteria, defer the selection and define the evidence or scope work needed.

### Phase 3 - Record decision and consequences

7. State the recommended or selected option and explain each reason through the decision drivers.
   Keep the status Proposed until retained owner approval exists.
   Do not describe implementation as complete unless separate implementation evidence is supplied.
8. Record immediate and long-term positive, negative, and neutral consequences.
   Include new ownership, coupling, operational burden, migration work, failure modes, and every tradeoff that was explicitly accepted.
   Stop if a known material disadvantage has no disposition.
9. Define follow-up actions with owner roles, dependencies, exit criteria, and verification signals.
   Define rollback or supersession behavior for the implementation when applicable.
   Keep decision completion separate from implementation completion.
10. Define concrete revisit triggers, such as a failed mandatory criterion, a changed constraint, a new consumer class, a cost threshold, an incident pattern, or an unavailable dependency becoming supported.
    Assign the role that decides whether a trigger requires amendment or supersession.

### Phase 4 - Approve and publish

11. Submit the boundary, evidence ledger, common-criteria table, consequences, unknowns, follow-up actions, and revisit triggers to the architecture owner.
    Record the actual decision and status without inventing a date or a consensus.
    If approval is withheld, retain Proposed, or mark Rejected only with explicit evidence.
12. Validate links, identifiers, status, related ADR relationships, sensitive content, and evidence traceability.
    Publish the ADR only when the completion criteria are reviewable and the repository's documentation gate is satisfied.

## Decision points

- If the question contains multiple independently reversible choices, split it into related ADRs before evaluating options.
- If owner approval is absent, retain status Proposed regardless of the author's recommendation or any apparent consensus.
- If no option meets every mandatory constraint, defer the decision and assign evidence or scope work rather than selecting the least incomplete option.
- If a material assumption changes the preferred option, expose that sensitivity and define it as a revisit trigger.
- If an accepted ADR already governs the same boundary, amend or supersede it only after the architecture owner approves the relationship and migration consequences.
- If the rationale contains restricted security or commercial detail, publish a safe summary and retain the sensitive evidence in its approved access-controlled location.

## Safety guardrails

- Never fabricate measurements, dates, consensus, implementation status, or approval.
- Never hide material disadvantages, uncertainty, or a viable alternative to favor one option.
- Never mark an ADR Accepted, Rejected, or Superseded without retained owner evidence.
- Do not expose secrets, exploit details, customer data, or restricted commercial terms in a public ADR.
- Do not present a benchmark beyond its supplied workload, environment, and measurement method.
- Keep the decision boundary narrow enough that one approval has a coherent consequence and rollback story.
- Stop when the ADR is being used to bypass the architecture owner or an applicable security, legal, or operational approval process.

## Human approval gates

- Before marking the ADR Accepted or Rejected, the architecture owner reviews the decision boundary, evidence quality, mandatory criteria, comparable alternatives, consequences, unknowns, and follow-up record, then supplies an attributable disposition.
- Before superseding an existing decision, the architecture owner reviews the old and new boundaries, replacement rationale, compatibility or migration consequences, implementation state, and the links in both records.
- Before publishing sensitive rationale, the information owner reviews the redacted public wording and the retained restricted evidence location.

## Expected output

Produce one complete Proposed, Accepted, Rejected, or Superseded architecture decision record in Markdown.
The record must include:

- the identifier or repository-relative filename when supplied, a precise title, and the actual status;
- the decision boundary, affected systems, current state, exclusions, and related decisions;
- facts, assumptions, open questions, constraints, and decision drivers;
- common criteria and a comparable alternatives table with disadvantages and uncertainty;
- the recommendation or approved decision with evidence-backed rationale;
- positive, negative, and neutral consequences;
- implementation follow-up with owner roles, dependencies, exit criteria, verification signals, and recovery considerations;
- the approval record and any explicitly non-applicable gates;
- measurable revisit and supersession triggers;
- limitations and evidence traceability.

An ADR is complete as a decision artifact even when implementation has not started, provided its status and follow-up state say so explicitly.

## Completion criteria

- Every material context, comparison, and rationale claim maps to evidence or is labeled as an assumption or inference.
- Every viable option is evaluated against the same defined criteria and includes concrete disadvantages.
- The selected status exactly matches retained architecture-owner evidence.
- All known material consequences and uncertainties have a disposition, an owner role, or a revisit trigger.
- Follow-up actions identify dependencies, objective exit criteria, verification signals, and recovery considerations.
- Related decisions and any supersession relationship are explicit and bidirectionally linkable when repository files exist.
- The ADR claims no implementation, measurement, consensus, or approval beyond the supplied evidence.

## Failure modes

- **F1:** No accountable owner can approve the decision boundary.
- **F2:** A compound or changing boundary invalidates the option comparison.
- **F3:** Evidence or common criteria cannot distinguish any viable option while a mandatory uncertainty remains.
- **F4:** A material disadvantage or related accepted decision is discovered after selection.
- **F5:** Approval evidence conflicts with the ADR status or supersession claim.

## Recovery procedure

- **R1:** Keep the record Proposed, identify the governance gap, and resume selection only after an accountable owner role is established.
- **R2:** Restate or split the boundary, rebuild the common criteria, and reevaluate every option before retaining any recommendation.
- **R3:** Record the unresolved uncertainty, assign evidence collection with an exit criterion, and defer the decision rather than fabricate differentiation.
- **R4:** Reopen the comparison, add the consequence or related decision, reassess the selected option, and seek a renewed owner disposition.
- **R5:** Downgrade the status to the strongest supported state, correct the relationship, and republish only after owner evidence reconciles with the record.

## Example

The [synthetic input](examples/input.md) supplies a stable validation-ownership question, repository facts, common criteria, alternatives, a related-decision search, and explicit architecture-owner approval.
The [complete expected output](examples/expected-output.md) is an Accepted ADR that does not claim its follow-up implementation has occurred.
