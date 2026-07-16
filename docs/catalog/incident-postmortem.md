---
title: "Produce an evidence-linked blameless incident postmortem"
description: "Produce a bounded incident learning record with impact, timeline, causal confidence, organizational conditions, and verifiable corrective actions."
---

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

See [example input](#complete-example-input) and [expected output](#complete-expected-output).

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/incident-postmortem/1.0.0",
  "title": "Incident postmortem output contract",
  "description": "Validates the impact statement, UTC timeline, causal assessment, contributing conditions, corrective actions, uncertainty, approvals, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "incident-postmortem.md",
        "audience": "Engineering, operations, and incident stakeholders",
        "requires_title": true,
        "required_headings": [
          "Executive summary",
          "Scope and impact",
          "UTC timeline",
          "Trigger and technical-cause assessment",
          "Contributing factors",
          "Organizational conditions",
          "Detection, response, and recovery",
          "Proposed corrective actions",
          "Open questions and uncertainty",
          "Assumptions and limitations",
          "Approval record",
          "Traceability"
        ],
        "required_literals": [
          "| Boundary | Value | Evidence |",
          "| Time | Event | Evidence |",
          "| Action | Risk and evidence | Owner role | Priority | Dependency | Exit criterion | Verification signal | Safe-stop or rollback | Status |",
          "| Question | Evidence gap | Owner role | Required evidence | Disposition |",
          "| Review | Status | Evidence |",
          "| Artifact element | Evidence |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This synthetic scenario covers incident `INC-204`, queue-processing degradation in service `queue-consumer` on 2026-06-18 UTC.
The incident is stable, and the requested artifact is an internal engineering draft for learning and corrective-action review.
No individual names, customer identifiers, secrets, or production payloads are included.

## Scope and environment

- Incident boundary: deployment start at `14:02 UTC` through declared stability at `15:05 UTC`.
- Evidence cutoff: `15:30 UTC` on the incident date.
- Production shape: four `queue-consumer` containers with a 32-connection database pool per container.
- Audience: internal engineering reviewers only.
- Exclusions: individual customer count, individual performance assessment, final public publication, and action due dates.

## Evidence inventory

### E1 - Queue metrics export

The retained one-minute UTC metrics export for `queue-consumer` shows backlog crossing 5,000 jobs at `14:10`, peaking at 12,400 at `14:28`, falling below 5,000 at `14:51`, and returning to the normal range below 500 at `15:05`.
During `14:10-15:05`, 31,000 jobs were submitted and 8,200 completed more than ten minutes after submission.
The sanitized export contains aggregate job counts only and no customer identifiers.

### E2 - Deployment and change ledger

The retained UTC deployment record shows release `consumer-3.8.0` starting at `14:02` and completing at `14:08`.
The release replaced fixed worker concurrency `8` with a value derived from visible CPU count.
The change ledger records no other application deployment during the incident boundary, but it does not establish whether workload composition changed.

### E3 - Runtime configuration and log sample

From `14:09`, each of four production containers reported 64 visible CPUs and opened 64 consumers.
Each container retained a 32-connection database pool, and the sanitized logs repeatedly recorded pool-acquisition timeouts until `14:45`.
The log sample uses UTC and contains no payload, credential, customer identifier, or individual name.

### E4 - Rollback and recovery record

The incident commander approved rollback to `consumer-3.7.4` at `14:36`, and the deployment system recorded completion at `14:44`.
Pool-acquisition timeouts stopped at `14:45`, backlog fell below 5,000 at `14:51`, and it returned below 500 at `15:05`.

### E5 - Alert configuration snapshot

At the incident revision, the queue backlog alert paged after backlog remained above 5,000 jobs for five minutes.
No alert existed for database pool-acquisition timeouts or for the ratio of consumers to pool connections.
The snapshot came from the monitored production configuration and contains no notification recipient names.

### E6 - Change review and staging record

Release `consumer-3.8.0` passed unit tests and a 30-minute staging load test in containers that exposed 8 CPUs.
The change-review template did not require recording production CPU visibility, consumer count, database-pool capacity, or their ratio.
The review record identifies roles only and contains no individual names.

### E7 - Incident response record

The queue alert was acknowledged at `14:16`, responders correlated degradation with the deployment at `14:24`, and rollback was proposed at `14:31`.
The retained UTC response record uses role labels and contains no private chat content or individual names.

### E8 - Incident boundary and approval record

The incident commander classified `INC-204` on 2026-06-18 as `SEV-2` under the supplied policy rule for more than 20% of jobs delayed over ten minutes for longer than 30 minutes.
The incident commander confirmed stability at `15:05`, fixed the evidence cutoff at `15:30`, and approved an internal engineering draft.
The sensitive-data owner approved the sanitized evidence set for that internal audience only.
The approved draft excludes individual customer counts, individual performance assessment, public distribution, and action due dates.
The service owner, database owner, and repository maintainer have not approved the proposed corrective actions or any due dates.
Final publication and distribution outside internal engineering have not been approved.

### E9 - Isolated concurrency reproduction

After the incident, `pnpm test:load -- queue-concurrency` ran for 30 minutes in an isolated fixture that exposed 64 CPUs and replayed the retained aggregate workload shape.
With 64 consumers and a 32-connection pool, the fixture recorded repeated pool-acquisition timeouts and median throughput of 142 jobs per second.
With concurrency capped at 32 and the same pool and workload shape, it recorded zero pool-acquisition timeouts and median throughput of 506 jobs per second.
The command exited `0`; these fixture measurements support the failure-mechanism analysis but are not production measurements.

### E10 - Independent impact calculation review

A reliability reviewer reproduced `8,200 / 31,000 x 100 = 26.4516...%`, rounded to 26.45%, and confirmed that `14:10-15:05` is 55 minutes.
The review used only the aggregate values in E1.

### E11 - Draft action validation constraints

The incident commander approved the following constraints for drafting actions, not as committed work: test concurrency changes for 30 minutes with 64 visible CPUs; require zero pool-acquisition timeouts; page on pool-acquisition timeouts sustained for five minutes; and verify that the paging route receives a staging test.
For this draft, the incident commander proposes the service owner for the concurrency action, the database owner for the pool-timeout alert, and the repository maintainer for the review-template action.
The incident commander proposes High priority for the concurrency and alert actions and Medium priority for the template action because the first two address the observed contention and detection gaps, while the third addresses the contributing review-control condition.
Owner approval is still required before any threshold, action, or schedule becomes committed.

## Constraints and approvals

- Use UTC and cite every timestamp.
- Keep observation, inference, open hypothesis, technical cause, contributing factor, and organizational condition distinct.
- Use blameless language and roles rather than individual names.
- Do not invent customer counts, workload changes, owners, due dates, approvals, or production measurements.
- Keep every corrective action proposed until its owner approves it.
- Do not distribute the draft outside internal engineering.

## Complete expected output

> Synthetic postmortem example derived only from the supplied incident evidence.

Status: draft approved for internal engineering review only. [E8]

Severity: `SEV-2` under the supplied delayed-job policy. [E8, E10]

## Executive summary

Release `consumer-3.8.0` completed deployment at `14:08 UTC`, each of four containers opened 64 consumers against a 32-connection pool at `14:09 UTC`, and the queue backlog crossed 5,000 jobs at `14:10 UTC`. [E1, E2, E3]
During the 55-minute interval ending at declared stability, 8,200 of 31,000 submitted jobs completed more than ten minutes after submission, which is 26.45% when rounded to two decimal places. [E1, E8, E10]
The high-confidence technical-cause inference is that CPU-derived concurrency exceeded pool capacity and produced connection contention; it is not treated as exclusive proof because the retained change ledger does not establish whether workload composition changed. [E2, E3, E4, E9]
Rollback completed at `14:44 UTC`, pool-acquisition timeouts stopped at `14:45 UTC`, backlog fell below 5,000 at `14:51 UTC`, and the incident commander declared stability when backlog returned below 500 at `15:05 UTC`. [E1, E4, E8]
The corrective actions in this draft remain proposed, have no approved due dates, and require owner review before they become commitments. [E8, E11]

## Scope and impact

| Boundary | Value | Evidence |
|---|---|---|
| Service | `queue-consumer` | E1, E2 |
| Review window | `14:02-15:05 UTC` on 2026-06-18 | E1, E2, E8 |
| Evidence cutoff | `15:30 UTC` | E8 |
| Audience | Internal engineering reviewers | E8 |
| Excluded | Individual customer count, individual performance assessment, public distribution, action due dates | E8 |

Backlog remained above 5,000 jobs from `14:10` until `14:51 UTC` and returned below the normal-range boundary of 500 at `15:05 UTC`. [E1]
During the 55-minute interval from `14:10` through `15:05 UTC`, 8,200 of 31,000 submitted jobs completed more than ten minutes after submission. [E1, E10]
The calculated delayed-job share is `8,200 / 31,000 x 100 = 26.45%`, rounded to two decimal places. [E10]
No customer-count impact is stated because the evidence contains aggregate jobs only. [E1]

## UTC timeline

| Time | Event | Evidence |
|---|---|---|
| `14:02-14:08` | `consumer-3.8.0` deployed | E2 |
| `14:09` | Four containers reported 64 visible CPUs, opened 64 consumers each, and began recording pool-acquisition timeouts | E3 |
| `14:10` | Backlog crossed 5,000 jobs | E1 |
| `14:16` | Responders acknowledged the queue alert | E7 |
| `14:24` | Responders correlated degradation with the deployment | E7 |
| `14:28` | Backlog peaked at 12,400 jobs | E1 |
| `14:31` | Responders proposed rollback | E7 |
| `14:36` | Incident commander approved rollback | E4 |
| `14:44` | Rollback to `consumer-3.7.4` completed | E4 |
| `14:45` | Pool-acquisition timeouts stopped | E3, E4 |
| `14:51` | Backlog fell below 5,000 jobs | E1, E4 |
| `15:05` | Backlog returned below 500 and the incident commander declared stability | E1, E8 |

No conflicting timestamp is present in the supplied records. [E1, E2, E3, E4, E7, E8]

## Trigger and technical-cause assessment

Observed trigger: release `consumer-3.8.0` replaced fixed concurrency `8` with CPU-derived concurrency immediately before each production container opened 64 consumers. [E2, E3]

Observed failure mechanism: 64 consumers competed for a 32-connection pool in each container while pool-acquisition timeouts and queue backlog were present. [E1, E3]

High-confidence technical-cause inference: CPU-derived concurrency exceeded available database-pool capacity, producing connection contention that reduced queue processing throughput. [E1, E3, E4, E9]
Confidence is high because timeouts ended one minute after rollback completed and the isolated workload replay reproduced timeouts and lower throughput at 64 consumers while the 32-consumer case recorded no timeout and higher throughput. [E4, E9]
This remains an inference rather than proof that no other factor contributed because the change ledger does not establish whether workload composition changed. [E2]

## Contributing factors

- Staging exposed 8 CPUs, so its 30-minute load test did not exercise the 64-consumer production configuration. [E3, E6]
- Monitoring paged on queue backlog but had no pool-acquisition-timeout or consumer-to-pool signal. [E5]
- The production database pool remained at 32 connections per container while concurrency rose to 64. [E3]

## Organizational conditions

The change-review template did not require reviewers to record production CPU visibility, consumer count, database-pool capacity, or their ratio. [E6]
Inference: this control gap allowed staging and production capacity assumptions to remain implicit. [E6]
The condition is described as a system and review-control issue, not an individual failure. [E6]

## Detection, response, and recovery

The backlog alert surfaced the degradation and was acknowledged at `14:16 UTC`. [E1, E5, E7]
Responders correlated the release, proposed rollback, obtained incident commander approval, and completed rollback at `14:44 UTC`. [E4, E7]
Pool-acquisition timeouts stopped one minute later, backlog fell below the alert boundary seven minutes later, and backlog returned to the normal range at `15:05 UTC`. [E1, E4]

What worked:

- Aggregate queue monitoring exposed prolonged processing delay. [E1, E5]
- Role-based response records preserved acknowledgement, correlation, and rollback decisions without retaining individual names. [E7]
- Rollback was available and was followed by timeout cessation and backlog recovery. [E4]
- The isolated reproduction provided comparative evidence for the suspected failure mechanism. [E9]

## Proposed corrective actions

| Action | Risk and evidence | Owner role | Priority | Dependency | Exit criterion | Verification signal | Safe-stop or rollback | Status |
|---|---|---|---|---|---|---|---|---|
| Cap worker concurrency at 32 consumers per container until a higher value passes the approved validation | Consumer count exceeded pool capacity [E3, E9] | service owner, proposed by incident commander [E11] | high, proposed by incident commander [E11] | Owner approval and configurable concurrency cap | Every deployed container reports no more than 32 consumers | A 30-minute isolated run with 64 visible CPUs records zero pool-acquisition timeouts [E11] | Restore fixed concurrency `8` if the cap causes an unexpected regression [E2, E4] | proposed; approval pending [E8, E11] |
| Page on pool-acquisition timeouts sustained for five minutes | Existing monitoring omitted the timeout signal [E5] | database owner, proposed by incident commander [E11] | high, proposed by incident commander [E11] | Timeout metric and staging paging route | The monitored configuration contains the five-minute rule | A staging threshold test reaches the paging route [E11] | Disable the new paging rule if validation shows uncontrolled false paging while retaining the backlog alert | proposed; approval pending [E8, E11] |
| Require CPU visibility, consumer count, pool capacity, and their ratio in concurrency-change review | Review template omitted capacity alignment [E6] | repository maintainer, proposed by incident commander [E11] | medium, proposed by incident commander [E11] | Approved template change | The review template requires all four values before a concurrency change can be approved | A template validation fixture rejects a change record missing any required value | Keep the template change unmerged if the validation fixture fails | proposed; approval pending [E8, E11] |

No action is counted as committed, and no due date is assigned. [E8, E11]

## Open questions and uncertainty

| Question | Evidence gap | Owner role | Required evidence | Disposition |
|---|---|---|---|---|
| Did workload composition change during the incident boundary? | The change ledger covers deployments but not workload mix [E2] | service owner | Aggregate workload-composition comparison for the review window | open; does not lower the current technical-cause inference below high confidence |
| Can concurrency above 32 be safe for this pool and workload shape? | E9 compares only 64 and 32 consumers | service owner | Approved comparative load tests for each proposed higher value | open; retain the proposed cap until validated |
| When should actions be due? | Action owners have not approved schedules [E8] | each action owner role | Feasibility and dependency review | unresolved; no dates assigned |

## Assumptions and limitations

- The impact calculation uses the aggregate metrics exactly as supplied and does not infer individual customer impact. [E1, E10]
- The isolated reproduction supports the failure mechanism but is not a production measurement. [E9]
- The deployment ledger excludes another application deployment but does not exclude an unrecorded workload-composition change. [E2]
- Internal draft approval does not authorize public distribution, commit corrective actions, or approve due dates. [E8]

## Approval record

| Review | Status | Evidence |
|---|---|---|
| Incident stability and evidence cutoff | approved by incident commander | E8 |
| Aggregate impact arithmetic | independently reproduced | E10 |
| Sanitized evidence for internal engineering | approved by sensitive-data owner | E8 |
| Corrective-action ownership and dates | pending | E8 |
| Final publication or wider distribution | pending | E8 |

## Traceability

| Artifact element | Evidence |
|---|---|
| Impact, backlog recovery, and aggregate population | E1, E10 |
| Trigger and deployment boundary | E2 |
| Production consumer-to-pool configuration and timeouts | E3 |
| Rollback and recovery sequence | E4 |
| Detection coverage and gaps | E5 |
| Staging difference and review-control condition | E6 |
| Response decisions | E7 |
| Severity, scope, audience, and approvals | E8 |
| Comparative failure-mechanism reproduction | E9 |
| Draft action validation constraints | E11 |
