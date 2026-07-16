# Produce an evidence-linked blameless incident postmortem

## Objective

Transform retained incident records into a bounded, blameless postmortem, corrective-action register, and uncertainty register.
The primary quality constraint is that observations, causal inferences, technical cause, contributing factors, organizational conditions, and proposed actions remain distinct and evidence-linked.

## When to use

Use this workflow after a material service or operational incident is contained or stable, the incident commander has fixed the review boundary, and sufficient evidence remains available for learning and corrective action.
Use it for an internal or approved external audience when impact, timeline, mitigation, recovery, and causal confidence can be represented without inventing facts.

## When not to use

Do not use while active mitigation would be distracted, when incident stability is unconfirmed, when legal or security handling prohibits the intended distribution, or when the time and impact boundaries cannot be stated even as an uncertainty range.
Do not use it as a substitute for immediate incident response, a security disclosure procedure, or an individual performance review.

## Required inputs

- **Incident boundary:** provide the incident ID, affected service, severity policy and applied level, UTC start and stability conditions, evidence cutoff, audience, and exclusions; this bounds the artifact, and integrity requires incident commander confirmation.
- **Timestamped records:** provide sanitized alerts, telemetry, changes, response communications, mitigations, and recovery signals with UTC timestamps or recorded conversions; these establish the timeline, and integrity requires provenance, retention status, and conflict markers.
- **Impact measurements:** provide numerator, denominator, affected interval, symptom definition, calculation method, and uncertainty or competing estimates; these establish impact, and integrity requires reproducible arithmetic from retained measurements.
- **Mitigation and recovery evidence:** provide approved actions, completion signals, service indicators, and the declared stability condition; these distinguish response actions from observed recovery, and integrity requires timestamp and source alignment.

## Optional inputs

- **Sanitized stakeholder observations:** use attributed observations to explain user experience, but keep them separate from established telemetry facts.
- **Control and ownership records:** use versioned review templates, monitoring policies, and service ownership maps to identify organizational conditions and responsible roles.
- **Counterevidence:** use relevant unchanged deployments, load shifts, or comparative measurements to test causal confidence instead of seeking only confirmation.

## Preconditions

- The incident commander confirms that the incident is contained or stable and approves the evidence cutoff.
- All timeline sources use UTC or include a documented conversion.
- Impact can be calculated or bounded from retained measurements.
- Intended distribution, redaction requirements, and sensitive-data handling are approved.
- Evidence gaps can be stated without inventing timestamps, counts, causality, owners, or dates.

## Workflow

1. **Freeze the review boundary:** record incident ID, affected service, severity basis, UTC window, stability condition, audience, evidence cutoff, and exclusions; advance only after incident commander confirmation, and stop if response is still active or the boundary is unresolved.
2. **Build the evidence ledger:** inventory each source with provenance, timestamp convention, retention status, redaction status, and what it can establish; advance when every retained source has a disposition and conflicts remain visible, and stop distribution if sensitive material cannot be removed safely.
3. **Calculate impact:** reproduce numerator, denominator, affected duration, percentage or range, and uncertainty from the retained measurements; advance only after a second reviewer verifies the arithmetic, and stop on an irreconcilable or non-reproducible calculation.
4. **Construct the timeline:** add only evidenced UTC events, cite each entry, label estimates and conflicts, and reconcile the start, mitigation, recovery, and stability conditions against the boundary; advance when every event is attributable or explicitly uncertain, and stop factual approval while a material timestamp conflict is unresolved.
5. **Separate analysis layers:** record trigger, observed failure mechanism, best-supported technical-cause inference, contributing technical factors, organizational conditions, detection, response, mitigation, recovery, and counterevidence in distinct fields; advance when each layer has evidence and confidence status, and stop if observations and inferences remain conflated.
6. **Challenge causal claims:** test each inference against timing, rollback or comparative evidence, and plausible alternatives; advance when every causal statement is supported or retained as an open hypothesis, and stop on a definitive claim that lacks sufficient evidence.
7. **Record learning:** identify what controls worked, which safeguards were absent or ineffective, and how system conditions shaped the outcome without attributing individual blame; advance when every lesson maps to observed evidence, and stop if the language assigns individual blame or suppresses counterevidence.
8. **Design corrective actions:** map each action to an evidenced risk and specify owner role, priority, dependency, exit criterion, verification signal, rollback or safe-stop condition, and proposed versus committed state; advance when every field is present, and stop an incomplete action from being counted as committed.
9. **Review and approve:** obtain factual, arithmetic, redaction, action-owner, distribution, and publication review from the responsible roles using the complete evidence-linked draft; advance when every applicable review is recorded, and stop publication while a required review is pending or denied.
10. **Deliver and reconcile:** publish only to the approved audience and provide the postmortem, action register, uncertainty and open-question register, approvals, assumptions, limitations, and traceability; complete only when every completion criterion maps to the artifact, and stop delivery if the audience, approval state, or evidence boundary has changed.

## Decision points

- If the incident is not contained or stable, stop postmortem work and return attention to incident response.
- If timeline sources conflict, preserve every supplied value, label confidence, and request reconciliation from the source owner before final factual approval.
- If impact estimates conflict, report the methods and bounded range and withhold a single-value claim until an accountable owner reconciles them.
- If evidence supports correlation but not causation, state the observation and open hypothesis instead of declaring technical cause.
- If an action lacks an owner role, dependency, objective exit criterion, or verification signal, keep it proposed and do not count it as committed.
- If publication or wider distribution could expose security, privacy, legal, or customer-sensitive material, restrict the audience until the responsible owner approves redaction and distribution.

## Safety guardrails

- Never invent timestamps, impact counts, causal links, owners, due dates, approvals, or execution results.
- Never name individual blame or imply that one person's action is a sufficient explanation for system behavior.
- Never state causality without supporting evidence and an explicit confidence label.
- Never include secrets, customer-identifying data, private communications, or unredacted security details.
- Do not convert a proposed corrective action into a commitment without owner approval.
- Do not expose the artifact outside the approved audience or suppress conflicting evidence to simplify the narrative.

## Human approval gates

- Before factual review closes, the incident commander must review the boundary, severity basis, impact method, timeline, uncertainty, mitigation, recovery, and stability evidence.
- Before assigning owners and dates, each responsible service owner must approve the risk linkage, feasibility, dependency, exit criterion, verification signal, and proposed schedule.
- Before distributing the postmortem outside the approved audience, the security, privacy, or other designated sensitive-data owner must approve the redacted content and destination.
- Before publishing the postmortem, the incident commander or designated postmortem owner must approve the complete artifact, action states, unresolved questions, limitations, and approval record.

## Expected output

Produce a Markdown postmortem containing status and audience, scope, executive summary, reproducible impact calculation, evidence-linked UTC timeline, trigger, technical-cause confidence, contributing factors, organizational conditions, detection, response, mitigation, recovery, what worked, a corrective-action register, an uncertainty and open-question register, assumptions, limitations, approvals, and traceability.
The action register must include risk evidence, owner role, priority, dependency, exit criterion, verification signal, safe-stop or rollback, and proposed or committed status.

## Completion criteria

- Every timestamp, impact value, triggering event, recovery statement, and causal claim cites evidence or is labeled uncertain.
- The impact arithmetic can be reproduced from the stated numerator, denominator, duration, and method.
- Observations, inferences, open hypotheses, technical cause, contributing factors, and organizational conditions are distinct.
- Language is blameless and the approved artifact contains no sensitive identifying data.
- Every action maps to an evidenced risk and records owner role, priority, dependency, exit criterion, verification signal, safe-stop or rollback, and approval state.
- Proposed and committed actions are counted separately.
- Required factual, action-owner, distribution, and publication approvals are recorded, and unresolved approvals remain visible.

## Failure modes

- **F1:** Critical timeline evidence expired or cannot be retrieved.
- **F2:** Impact sources produce conflicting estimates.
- **F3:** Evidence remains insufficient to distinguish correlation from causation.
- **F4:** A corrective action lacks ownership, dependency, or objective validation.
- **F5:** Redaction cannot make the artifact safe for its intended audience.
- **F6:** A reviewer identifies unsupported blame, precision, or execution language.

## Recovery procedure

- **R1:** Record the unavailable source and affected timeline interval, lower confidence, add a retention-control action only when justified, and resume with the evidence gap visible.
- **R2:** Preserve each calculation and method, report a bounded range, assign reconciliation to the measurement owner, and rerun arithmetic review before final approval.
- **R3:** Retain the causal statement as an open hypothesis, define the evidence needed to test it, and omit a definitive root-cause claim.
- **R4:** Keep the action proposed, return it to the responsible service owner, and resume action review only after owner role, dependency, exit criterion, and verification signal are supplied.
- **R5:** Restrict distribution, create a separately reviewed public summary if appropriate, and do not release the unsafe artifact.
- **R6:** Remove or qualify the unsupported language, restore the evidence and confidence distinction, and repeat factual and blameless-language review.

## Example

The complete synthetic example analyzes `INC-204`, a queue-processing degradation, from retained metrics, deployment and rollback records, runtime logs, monitoring configuration, response records, and review controls.
It calculates impact, labels the technical cause as a high-confidence inference, separates organizational conditions, and keeps corrective actions proposed because owner approvals are absent.

See [example input](examples/input.md) and [expected output](examples/expected-output.md).
