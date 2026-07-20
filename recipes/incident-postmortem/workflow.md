# Produce an evidence-linked blameless incident postmortem

## Objective

Take the incident records that were retained and turn them into a bounded, blameless postmortem, a corrective-action register, and a register of uncertainties and open questions.
The primary quality constraint is simple to state.
Observations, causal inferences, technical cause, contributing factors, organizational conditions, and proposed actions must remain distinct, and each must remain linked to evidence.

## When to use

Use this workflow after a material service or operational incident, once the incident is contained or stable.
Two more conditions apply: the incident commander has fixed the review boundary, and sufficient evidence remains available for learning and corrective action.
The audience can be internal or an approved external one, provided that impact, timeline, mitigation, recovery, and causal confidence can all be represented without inventing facts.

## When not to use

Do not start this work while it would distract from active mitigation, and do not start while the incident's stability is unconfirmed.
Do not use it when legal or security handling prohibits the intended distribution, or when the time and impact boundaries cannot be stated even as an uncertainty range.
It is not a substitute for immediate incident response, for a security disclosure procedure, or for an individual performance review.
That last exclusion is part of the blameless framing: a postmortem studies the system, not a person's performance.

## Required inputs

- **Incident boundary:** the incident identifier, the affected service, the severity basis (which policy applied and which level was assigned), the UTC start and stability conditions that define the review window, the evidence cutoff, the audience, and any exclusions.
  This boundary is what bounds the whole artifact.
  Its integrity requires confirmation by the incident commander.
- **Timestamped records:** each sanitized alert, telemetry record, change, response communication, mitigation, and recovery signal, carrying a UTC timestamp or a recorded conversion.
  These records establish the timeline.
  Their integrity requires provenance, retention status, and markers on any conflicts.
- **Impact measurements:** the numerator, the denominator, the affected interval and its duration, the symptom definition, the calculation method, and the uncertainty or any competing estimates.
  These establish the impact.
  Their integrity requires arithmetic that can be reproduced from retained measurements.
- **Mitigation and recovery evidence:** the approved actions, their completion signals, the service indicators, and the declared stability condition.
  This evidence is what separates response actions from observed recovery.
  Its integrity requires that timestamps and sources align.

## Optional inputs

- **Sanitized stakeholder observations:** attributed observations help explain what users experienced, as long as they stay separate from established telemetry facts.
- **Control and ownership records:** versioned review templates, monitoring policies, and service ownership maps help you identify organizational conditions and the roles responsible for them.
- **Counterevidence:** relevant unchanged deployments, load shifts, or comparative measurements let you test causal confidence instead of collecting only confirmation.

## Preconditions

- The incident commander confirms that the incident is contained or stable and approves the evidence cutoff.
- Every timeline source uses UTC or includes a documented conversion.
- The impact can be calculated, or at least bounded, from retained measurements.
- The intended distribution, the redaction requirements, and the handling of sensitive data are approved.
- Evidence gaps can be stated as gaps, without inventing timestamps, counts, causality, owners, or dates.

## Workflow

### Phase 1 - Fix the boundary and inventory the evidence

1. Freeze the review boundary by recording the incident ID, affected service, severity basis, UTC window, stability condition, audience, evidence cutoff, and exclusions.
   Advance only after the incident commander confirms the boundary.
   Stop if response work is still active or the boundary is unresolved.
2. Build the evidence ledger by inventorying each source with its provenance, timestamp convention, retention status, redaction status, and what it can establish.
   Advance when every retained source has a disposition and every conflict remains visible.
   Stop distribution if sensitive material cannot be removed safely.

### Phase 2 - Establish the facts

3. Calculate the impact by reproducing the numerator, denominator, affected duration, percentage or range, and uncertainty from the retained measurements.
   Advance only after a second reviewer verifies the arithmetic.
   Stop on a calculation that is irreconcilable or cannot be reproduced.
4. Construct the timeline from evidenced UTC events only, citing each entry and labeling estimates and conflicts.
   Reconcile the start, mitigation, recovery, and stability conditions against the boundary.
   Advance when every event is attributable or explicitly uncertain.
   Stop factual approval while a material timestamp conflict is unresolved.

### Phase 3 - Analyze causes without overreaching

5. Separate the analysis layers by recording the trigger, the observed failure mechanism, the best-supported technical-cause inference, contributing technical factors, organizational conditions, detection, response, mitigation, recovery, and counterevidence in distinct fields.
   Advance when each layer carries its evidence and a confidence status.
   Stop if observations and inferences remain conflated.
6. Challenge every causal claim by testing it against timing, rollback or comparative evidence, and plausible alternatives.
   Advance when every causal statement is either supported or retained as an open hypothesis.
   Stop on any definitive claim that lacks sufficient evidence.
7. Record the learning: which controls worked, which safeguards were absent or ineffective, and how system conditions shaped the outcome, all without attributing individual blame.
   Advance when every lesson maps to observed evidence.
   Stop if the language assigns individual blame or suppresses counterevidence.

### Phase 4 - Design actions and gather approvals

8. Design corrective actions by mapping each one to an evidenced risk and specifying its owner role, priority, dependency, exit criterion, verification signal, rollback or safe-stop condition, and proposed versus committed state.
   Advance when every field is present.
   Stop any incomplete action from being counted as committed.
9. Obtain factual, arithmetic, redaction, action-owner, distribution, and publication review from the responsible roles, working from the complete evidence-linked draft.
   Advance when every applicable review is recorded.
   Stop publication while a required review is pending or denied.

### Phase 5 - Deliver and reconcile

10. Publish only to the approved audience, providing the postmortem, the action register, the uncertainty and open-question register, the approvals, the assumptions, the limitations, and the traceability record.
    Complete only when every completion criterion maps to the artifact.
    Stop delivery if the audience, the approval state, or the evidence boundary has changed.

## Decision points

- If the incident is not contained or stable, stop postmortem work and return attention to incident response.
- If timeline sources conflict, preserve every supplied value, label its confidence, and request reconciliation from the source owner before final factual approval.
- If impact estimates conflict, report the methods and a bounded range, and withhold any single-value claim until an accountable owner reconciles them.
- If the evidence supports correlation but not causation, state the observation and an open hypothesis instead of declaring a technical cause.
- If an action lacks an owner role, a dependency, an objective exit criterion, or a verification signal, keep it proposed and do not count it as committed.
- If publication or wider distribution could expose security, privacy, legal, or customer-sensitive material, restrict the audience until the responsible owner approves the redaction and the distribution.

## Safety guardrails

- Never invent timestamps, impact counts, causal links, owners, due dates, approvals, or execution results.
- Never name individual blame, and never imply that one person's action is a sufficient explanation for system behavior.
- Never state causality without supporting evidence and an explicit confidence label.
- Never include secrets, customer-identifying data, private communications, or unredacted security details.
- Do not convert a proposed corrective action into a commitment without owner approval.
- Do not expose the artifact outside the approved audience, and do not suppress conflicting evidence to simplify the narrative.

## Human approval gates

- Before factual review closes, the incident commander must review the boundary, the severity basis, the impact method, the timeline, the uncertainty, and the mitigation, recovery, and stability evidence.
- Before assigning owners and dates, each responsible service owner must approve the risk linkage, feasibility, dependency, exit criterion, verification signal, and proposed schedule.
- Before distributing the postmortem outside the approved audience, the security, privacy, or other designated sensitive-data owner must approve the redacted content and its destination.
- Before publishing the postmortem, the incident commander or the designated postmortem owner must approve the complete artifact, the action states, the unresolved questions, the limitations, and the approval record.

## Expected output

Produce one blameless Markdown postmortem containing:

- the status and audience, the scope, and a factual executive summary;
- a reproducible impact calculation and an evidence-linked UTC timeline;
- the trigger, the technical-cause confidence, the contributing factors, and the organizational conditions;
- detection, response, mitigation, recovery, and what worked;
- a corrective-action register carrying owner roles, dependencies, exit criteria, and verification signals;
- an uncertainty and open-question register;
- assumptions, limitations, approvals, and traceability.

Each entry in the action register must record its risk evidence, owner role, priority, dependency, exit criterion, verification signal, safe-stop or rollback, and proposed or committed status.

## Completion criteria

- Every timestamp, impact value, triggering event, recovery statement, and causal claim either cites evidence or is labeled uncertain.
- The impact arithmetic can be reproduced from the stated numerator, denominator, duration, and method.
- Observations, inferences, open hypotheses, technical cause, contributing factors, and organizational conditions are kept distinct.
- The language is blameless, and the approved artifact contains no sensitive identifying data.
- Every action maps to an evidenced risk and records its owner role, priority, dependency, exit criterion, verification signal, safe-stop or rollback, and approval state.
- Proposed and committed actions are counted separately.
- The required factual, action-owner, distribution, and publication approvals are recorded, and any unresolved approval remains visible.

## Failure modes

- **F1:** Critical timeline evidence has expired or cannot be retrieved.
- **F2:** Impact sources produce conflicting estimates.
- **F3:** The evidence remains insufficient to distinguish correlation from causation.
- **F4:** A corrective action lacks ownership, a dependency, or objective validation.
- **F5:** Redaction cannot make the artifact safe for its intended audience.
- **F6:** A reviewer identifies blame, precision, or execution language that the evidence does not support.

## Recovery procedure

- **R1:** Record the unavailable source and the affected timeline interval, lower the confidence, add a retention-control action only when it is justified, and resume with the evidence gap left visible.
- **R2:** Preserve each calculation and its method, report a bounded range, assign reconciliation to the measurement owner, and rerun the arithmetic review before final approval.
- **R3:** Retain the causal statement as an open hypothesis, define the evidence needed to test it, and omit any definitive root-cause claim.
- **R4:** Keep the action proposed, return it to the responsible service owner, and resume action review only after the owner role, dependency, exit criterion, and verification signal are supplied.
- **R5:** Restrict distribution, create a separately reviewed public summary if appropriate, and do not release the unsafe artifact.
- **R6:** Remove or qualify the unsupported language, restore the distinction between evidence and stated confidence, and repeat the factual and blameless-language reviews.

## Example

The complete synthetic example works through `INC-204`, a queue-processing degradation, using retained metrics, deployment and rollback records, runtime logs, monitoring configuration, response records, and review controls.
It calculates the impact, labels the technical cause as a high-confidence inference rather than a certainty, separates the organizational conditions, and keeps every corrective action proposed because owner approvals are absent.
See the [synthetic input](examples/input.md) and the [expected output](examples/expected-output.md).
