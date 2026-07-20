# Produce an evidence-linked blameless incident postmortem checklist

## Boundary and evidence integrity

- [ ] Incident ID, affected service, severity basis, UTC window, stability condition, audience, evidence cutoff, and exclusions are fixed.
- [ ] The incident commander confirmed containment or stability and the evidence cutoff.
- [ ] Every source records provenance, timezone or conversion, retention status, conflict status, and redaction status.
- [ ] Expired or unavailable evidence remains visible as a confidence limitation.
- [ ] Conflicting timestamps or measurements are preserved rather than silently averaged or selected.

## Impact and timeline

- [ ] Impact states the numerator, denominator, symptom definition, duration, calculation method, result, and uncertainty.
- [ ] A second reviewer reproduced the arithmetic from the supplied measurements.
- [ ] Every timeline entry cites evidence and marks estimates or conflicts.
- [ ] Mitigation completion, observed recovery, and the declared stability condition are separate events.
- [ ] No timestamp or customer count appears unless the evidence inventory supplies it.

## Analysis and blameless language

- [ ] Observations, inferences, counterevidence, and open hypotheses are visibly distinct.
- [ ] Trigger, failure mechanism, technical-cause inference, contributing factors, and organizational conditions are separate.
- [ ] Every causal statement has evidence and a confidence label.
- [ ] Language describes system behavior, context, and control conditions without individual blame.
- [ ] What worked is supported by response or recovery evidence rather than retrospective assumption.

## Corrective actions

- [ ] Every action maps to an evidence-backed risk.
- [ ] Proposed owner roles and priorities cite the role or policy record that supplied them.
- [ ] Every action records owner role, priority, dependency, exit criterion, verification signal, safe-stop or rollback, and approval state.
- [ ] Proposed actions are not counted as committed actions.
- [ ] Concrete thresholds and test durations come from supplied policy or are explicitly decisions pending owner approval.
- [ ] Open questions identify the evidence needed, responsible role, and disposition.

## Safety and approval

- [ ] Secrets, customer-identifying data, private communications, and unredacted security details are absent.
- [ ] The incident commander approved factual scope, impact method, timeline, uncertainty, and recovery evidence.
- [ ] Service owners approved any committed owners, dates, dependencies, and validation criteria.
- [ ] Wider distribution has sensitive-data owner approval for the exact audience and redacted artifact.
- [ ] Final publication approval covers limitations, open questions, and the complete approval record.

## Delivery

- [ ] The artifact includes status, audience, a factual executive summary, scope, impact, timeline, layered analysis, response, recovery, actions, uncertainty, assumptions, limitations, approvals, and traceability.
- [ ] Every material claim maps to the evidence inventory or is labeled uncertain.
- [ ] The final artifact satisfies every completion criterion in `workflow.md`.
