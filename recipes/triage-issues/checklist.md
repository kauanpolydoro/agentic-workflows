# Triage a bounded repository issue queue checklist

## Snapshot and policy integrity

- [ ] Snapshot ID, issue IDs, policy revision, audience, evidence cutoff, and exclusions are recorded.
- [ ] Issue count, bodies, comments, labels, states, environments, and attachment inventories match the frozen snapshot.
- [ ] The policy defines types, impacts, states, labels, duplicate confidence, closure authority, mutation authority, and private security routing.
- [ ] The authorization record states which responses and tracker mutations, if any, may be applied.
- [ ] The snapshot remained unchanged while dispositions were produced.

## Restricted data and evidence

- [ ] Every attachment was inventoried before public analysis.
- [ ] Secrets, customer data, private attachments, and security reproduction details are absent from the public artifact.
- [ ] Repository facts, reporter claims, triager inferences, and recommendations are visibly distinct.
- [ ] Missing evidence is recorded as a gap and is not treated as proof that a report is invalid.

## Classification and duplicates

- [ ] Every type, impact, support status, and proposed state cites a policy rule and issue evidence.
- [ ] Unsupported-environment status is separate from validity and impact.
- [ ] Duplicate candidates record shared behavior, environment, reproduction, distinguishing evidence, threshold, and confidence.
- [ ] Canonical issue selection follows an explicit policy rule or remains pending maintainer decision.
- [ ] Unique evidence from a proposed duplicate is retained for the canonical issue.
- [ ] Information requests contain only fields needed for a named next decision.

## Actions and approvals

- [ ] Every proposed response, label, assignment, priority, duplicate relationship, and closure names its approving role.
- [ ] Every next action records owner role, dependency, exit criterion, approval state, and mutation status.
- [ ] Security-sensitive routing has security owner approval before any public response.
- [ ] No delivery date, priority commitment, public response, or completed tracker action is claimed without evidence.
- [ ] A rejected proposal remains unapplied and records the requested revision.

## Delivery

- [ ] Every issue in the frozen snapshot appears exactly once in the disposition register.
- [ ] The duplicate map, response drafts, closure criteria, limitations, blocked dispositions, and traceability are complete.
- [ ] Public-safe wording has been reviewed separately from internal evidence.
- [ ] The final artifact satisfies every completion criterion in `workflow.md`.
