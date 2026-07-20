---
title: "Triage a bounded repository issue queue"
description: "Turn a frozen snapshot of an issue queue into a policy-linked disposition for every issue, plus duplicate evidence, draft responses, and closure criteria."
---

# Triage a bounded repository issue queue

## Objective

Turn an immutable issue snapshot and an owner-approved triage policy into four artifacts: a disposition register, a duplicate evidence map, proposed responses, and closure criteria that name their owners.
A disposition is simply the outcome you propose for one issue, backed by evidence and a policy rule, so the register answers what should happen to each report and why.
The primary quality constraint is that facts, reporter claims, triager inferences, recommendations, approvals, and tracker mutations remain distinguishable.

## When to use

Use this workflow when you have a fixed issue range or a periodic queue snapshot in front of you, with its bodies, comments, labels, states, environment records, attachment inventory, and governing policy all available.
It fits the moment before anyone touches the tracker, when you want to propose consistent classification, duplicate relationships, information requests, owner roles, and next states for a maintainer to apply.

## When not to use

Do not use this workflow for a suspected vulnerability that has not yet entered the private security route.
It is also the wrong choice for an unbounded or still-changing queue, for issues whose classification depends on inaccessible attachments, or for a repository without an owner-approved triage policy.
And it is not a substitute for technical diagnosis; when the requested outcome is a root cause or a code fix, run that investigation instead.

## Required inputs

- **Issue snapshot:** provide a snapshot identifier and a bounded set of issues, where each issue carries its ID, title, body, comments, current labels, current state, environment, reproduction evidence, and attachment inventory.
  This snapshot is the factual boundary of the whole triage.
  Treat it as immutable; integrity requires that the set remain unchanged while you work.
- **Triage policy:** provide a versioned, owner-approved policy that defines types, impact levels, states, labels, the duplicate threshold, unsupported-environment handling, mutation authority, closure rules, and the private security escalation route.
  The policy is what makes classifications reproducible, so integrity requires a resolvable revision and a named owner.

## Optional inputs

- **Approved roadmap:** use it to explain owner-approved priority, dependencies, or sequencing, but never to infer a delivery date.
- **Versioned support matrix:** use it to classify environment support on its own merits, independently of whether the report is otherwise valid.
- **Component ownership map:** use it to propose responsible roles without inventing individual assignees.

## Preconditions

- Every issue in the bounded snapshot is readable and still carries the recorded body, comments, labels, and state.
- The policy defines types, impact levels, labels, states, duplicate confidence, closure authority, and the private security route.
- Sensitive attachments can be excluded or sanitized before any public analysis.
- An explicit authorization record states which responses and tracker mutations, if any, are permitted.

## Workflow

1. **Freeze the scope:** record the snapshot ID, issue IDs, policy revision, audience, current labels and states, evidence cutoff, and exclusions.
   Advance once the recorded issue count and states reconcile with the immutable snapshot.
   Stop if the snapshot changes under you.
2. **Screen for restricted material:** inventory the attachments and inspect report metadata for secrets, customer data, or plausible security impact.
   Advance once every record is public-safe or has an approved private route.
   Stop public handling of any restricted record.
3. **Build fact records:** for every issue, separate repository facts, reporter claims, triager inferences, and missing evidence.
   Advance once each extracted statement is validated against the snapshot.
   Stop a disposition when a material statement cannot be attributed.
4. **Compare duplicate candidates:** for each candidate pair, compare observed behavior, environment, version, reproduction command, and distinguishing evidence.
   Advance once each candidate meets the policy threshold or has a recorded evidence gap.
   Stop a duplicate disposition when the discriminating evidence is insufficient.
5. **Apply the policy:** assign type, impact, support status, and a proposed state, citing both the governing rule and the issue evidence.
   Advance once each assignment is derivable from both sources.
   Stop when the policy lacks a necessary class or two of its rules conflict.
6. **Design the next decision:** request only the smallest missing piece of information that enables a named classification, duplicate, support, or closure decision.
   Advance once every request maps to that named decision.
   Stop if a request gathers unrelated information or treats absence of information as invalidity.
7. **Draft controlled actions:** propose labels, duplicate relationships, responses, owner roles, dependencies, next states, and closure criteria.
   Advance once each action is marked proposed, or marked completed with retained authorization and mutation evidence.
   Stop on any ambiguous action status.
8. **Obtain approvals:** submit public responses, labels, assignments, closure, priority changes, and security routing to their responsible roles, together with the evidence and the policy rule.
   Advance once every applicable approval is recorded or explicitly non-applicable.
   Stop mutation while a required approval is pending or denied.
9. **Deliver and reconcile:** produce the per-issue register, duplicate map, response drafts, next-action table, approval state, assumptions, limitations, and evidence traceability.
   Complete only when every issue and every completion criterion maps to the artifact.
   Stop the handoff if an issue is omitted or represented more than once.

## Decision points

- If a report contains a plausible vulnerability, secret, customer data, or private reproduction detail, stop public handling and request security owner approval for the private route.
- If two issues meet the policy's duplicate evidence and confidence threshold, apply the policy's canonical-selection rule and preserve the other report's unique evidence in the canonical issue before proposing the duplicate relationship.
- If the policy defines no canonical-selection rule, keep the relationship proposed without choosing a canonical issue until the repository maintainer records that decision.
- If duplicate confidence falls below the policy threshold, keep both issues separate and request only the smallest piece of discriminating evidence.
- If a reported environment is unsupported, record support status separately from validity and do not close solely because of support status.
- If required classification data is missing, propose a minimal information request and keep the disposition blocked rather than guessing.
- If a priority, delivery date, response, or tracker mutation lacks the required owner approval, keep it proposed and name the approving role.

## Safety guardrails

- Never post secrets from reports, private attachments, customer data, or security reproduction details in the public artifact.
- Never promise dates without owner approval, and never present roadmap interest as a commitment.
- Never mass-close low-information reports, and never use missing data as proof that a report is invalid.
- Never mutate the issue tracker without approval and retained evidence of the applied action.
- Do not infer reporter intent, and do not merge distinct evidence merely to reduce the queue size.
- Keep repository facts, reporter claims, triager inferences, recommendations, approvals, and completed actions visibly separate.

## Human approval gates

- Before closing or publicly responding to issues, the repository maintainer must review the issue evidence, the policy rule, the proposed classification, the closure criteria, and the exact response text.
- Before applying a label, an assignment, or a duplicate relationship, the repository maintainer must review the current state, the proposed mutation, the evidence, and the rollback or correction path.
- Before changing priority commitments, the product owner must review the impact evidence, the dependencies, the roadmap effect, and the presence or absence of a delivery commitment.
- Before routing a suspected security report, the security owner must approve the private destination, the retained public-safe metadata, and any public response.

## Expected output

Produce a single Markdown package.
It opens with the scope and the policy revision, then carries the substance of the triage: a disposition register with one evidence-linked disposition per issue, a duplicate evidence map, proposed response drafts, and owned next actions with their dependencies and closure criteria.
It also records approval and mutation status, assumptions, limitations, and traceability.
Within every record, facts, reporter claims, triager inference, recommendation, and completed action status must stay distinguishable.

## Completion criteria

- Every issue has a policy-linked classification, or a precise blocked reason with a minimal information request.
- Every proposed duplicate cites the shared evidence, the distinguishing evidence, the policy threshold, and the confidence.
- Every proposed response requests only the information needed for a named next decision.
- Every next action has an owner role, a dependency, an exit criterion, an approval state, and a mutation status.
- No public response or tracker mutation is represented as completed without retained approval and application evidence.
- Security-sensitive material is absent from the public artifact, and any restricted report has an approved private disposition.
- Every issue ID in the frozen snapshot appears exactly once in the disposition register.

## Failure modes

- **F1:** The issue snapshot is incomplete, or it changes while triage is underway.
- **F2:** A report or attachment exposes restricted information.
- **F3:** The policy lacks a classification, state, or authority rule that the queue needs.
- **F4:** Duplicate evidence does not meet the policy threshold.
- **F5:** The responsible role does not approve a proposed response or tracker mutation.

## Recovery procedure

- **R1:** Capture a new bounded snapshot, verify its issue count and state, invalidate the affected classifications, and restart those records from the scope freeze.
- **R2:** Stop public processing, retain only safe metadata, obtain routing approval from the security owner, and resume public triage only if a sanitized record is authorized.
- **R3:** Mark the disposition blocked, request a policy decision from the repository maintainer, and resume classification once the policy revision is approved.
- **R4:** Keep the issues separate, record the missing discriminating evidence, request only that evidence, and reevaluate the duplicate once it arrives.
- **R5:** Leave the action proposed, record the rejection or the requested changes, revise from the cited evidence, and do not mutate the tracker until approval is granted.

## Example

The complete example is synthetic: it triages three CLI reports from immutable snapshot `S-204` under policy `T-8`, without posting responses or mutating the tracker.
It shows a high-confidence duplicate candidate, a blocked low-information report, explicit approval requirements, and closure criteria.
See the [example input](#complete-example-input) and the [expected output](#complete-expected-output).

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/triage-issues/1.0.0",
  "title": "Issue triage output contract",
  "description": "Validates the policy-bound issue dispositions, duplicate evidence, proposed responses and actions, approval state, limitations, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "issue-triage-package.md",
        "audience": "Repository maintainers, product owners, and support triagers",
        "requires_title": true,
        "required_headings": [
          "Scope and policy",
          "Disposition register",
          "Duplicate evidence map",
          "Proposed responses",
          "Proposed next actions and closure criteria",
          "Approval and security state",
          "Assumptions and limitations",
          "Traceability"
        ],
        "required_literals": [
          "| Boundary | Value | Evidence |",
          "| Issue | Record facts | Reporter claim or expectation | Policy-linked classification | Proposed state and labels | Confidence | Owner role |",
          "| Candidate | Canonical issue | Shared evidence | Distinguishing evidence | Policy threshold | Confidence | Recommendation |",
          "| Issue | Proposed action | Owner role | Dependency | Exit or closure criterion | Approval and mutation status |",
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

This synthetic scenario triages issues `#12`, `#16`, and `#18` from read-only snapshot `S-204` under owner-approved policy revision `T-8`.
The audience is the repository maintainer who will decide whether to apply the proposals.
The objective is to classify the reports, evaluate a possible duplicate, and draft responses without posting, labeling, assigning, prioritizing, or closing any issue.

## Scope and environment

- Product: CLI `1.2.x`.
- Snapshot: `S-204`, containing exactly three open issues.
- Policy: `T-8`.
- Excluded work: source-code diagnosis, implementation, delivery planning, and tracker mutation.
- Attachment handling: only sanitized text inventories are available; no binary or private attachment is opened.

## Evidence inventory

### E1 - Owner-approved triage policy T-8

Allowed types are `bug`, `documentation`, and `question`.
Impact is high for reproducible data loss or inability to install on a supported platform, medium for another reproducible functional failure, and low for documentation gaps or questions without functional impact.
A duplicate requires the same observed behavior, environment, and reproduction command with at least high confidence.
When that threshold passes, the lower-numbered issue is canonical unless the repository maintainer records an evidence-backed exception.
Supported and unsupported environment status must be recorded separately from report validity.
Allowed proposed states are `accepted`, `needs-information`, `duplicate`, and `blocked`.
Available labels are `type:bug`, `type:documentation`, `type:question`, `impact:high`, `impact:medium`, `impact:low`, `state:accepted`, `state:needs-information`, `state:duplicate`, and `state:blocked`.
Public responses, labels, assignments, duplicate links, and closure require repository-maintainer approval.
Priority changes require product-owner approval, and policy forbids delivery-date promises without that approval.
Suspected vulnerabilities, secrets, customer data, and private reproduction details must be routed privately after security-owner approval.
A duplicate may close only after its unique evidence is preserved in the policy-selected canonical issue and the repository maintainer approves the relationship and response.
Low-information reports may not be mass-closed solely because required data is absent.

### E2 - Versioned support matrix

Support matrix revision `M-12` states that CLI `1.2.x` supports Windows 11 with Node 22.
It makes no claim about a root cause for path-related failures.

### E3 - Issue #12 record

Title: `Install rejects an existing target path with spaces`.
Current state: open with no labels and no comments.
Environment: CLI `1.2.1`, Windows 11, Node 22.
The sanitized transcript shows `Test-Path 'C:\Work Space'` returning `True`, followed by `awf install review-pull-request --target "C:\Work Space"` exiting `1` with `Target does not exist`.
The reporter expects installation into the existing target directory.
Attachment inventory: one sanitized text transcript and no binary attachment.

### E4 - Issue #16 record

Title: `Quoted target fails during install`.
Current state: open with no labels and one comment repeating the reproduction.
Environment: CLI `1.2.1`, Windows 11, Node 22.
The body and comment contain the same command, existing quoted target shape, and `Target does not exist` result as E3.
The reporter expects installation into the existing quoted target.
The reporter additionally records `awf list` exiting `0` in the same shell.
Attachment inventory: none.

### E5 - Issue #18 record

Title: `Install failed`.
Current state: open with no labels and no comments.
The body states only that installation failed.
CLI version, operating system, Node version, exact command, sanitized output, target-path shape, manifest state, and reproduction result are absent.
Attachment inventory: none.

### E6 - Snapshot integrity and authorization record

The read-only export identifies snapshot `S-204`, policy `T-8`, issue count `3`, issue IDs `#12`, `#16`, and `#18`, and the repository maintainer as the artifact audience.
It excludes source-code diagnosis, implementation, delivery planning, and tracker mutation.
The supplied records contain no suspected vulnerability, secret, customer data, or private attachment after sanitization review.
No public response, label, assignment, priority change, duplicate link, or closure is authorized or recorded as applied.

## Constraints

- Distinguish issue facts, reporter expectations, triager inference, and recommendations.
- Do not diagnose a technical root cause from the issue records.
- Do not post responses or mutate the tracker.
- Do not promise priority or delivery dates.
- Request only evidence needed for the next decision.

## Complete expected output

> Synthetic triage example derived only from the supplied issue snapshot and policy evidence.

Status: proposals only, with no tracker mutation authorized or applied. [E6]

## Scope and policy

| Boundary | Value | Evidence |
|---|---|---|
| Snapshot | `S-204` | E6 |
| Issues | `#12`, `#16`, `#18` | E6 |
| Policy revision | `T-8` | E1, E6 |
| Support matrix | `M-12` | E2 |
| Audience | Repository maintainer | E6 |
| Excluded work | Root-cause diagnosis, implementation, delivery planning, and tracker mutation | E6 |

Facts below come from the frozen records.
Reporter expectations are attributed separately.
Classifications, duplicate confidence, responses, and next actions are triage recommendations under E1.

## Disposition register

| Issue | Record facts | Reporter claim or expectation | Policy-linked classification | Proposed state and labels | Confidence | Owner role |
|---|---|---|---|---|---|---|
| `#12` | Supported CLI, OS, and Node versions; existing quoted-space target; install exits `1` with `Target does not exist` [E2, E3] | Installation should use the existing target directory [E3] | `bug`; impact is blocked because T-8 does not say whether one reproducible failing configuration on a supported platform is high-impact platform installation inability or another medium functional failure [E1, E2, E3] | `blocked`; `type:bug`, `state:blocked`; no impact label proposed | high for the report facts; impact unclassified pending policy clarification | repository maintainer |
| `#16` | Same version, environment, command shape, and error as `#12`; `awf list` exits `0` [E3, E4] | The quoted target should install successfully [E4] | `bug`; impact inherits the unresolved T-8 interpretation; high-confidence duplicate candidate of `#12` [E1, E2, E3, E4] | `duplicate`; `type:bug`, `state:duplicate`; no impact label proposed | high for duplicate evidence; impact unclassified | repository maintainer |
| `#18` | Install-failure statement lacks version, environment, command, output, target shape, manifest state, and reproduction [E5] | Installation failed | Type and impact remain unassigned because E1 cannot be applied to the missing facts | `needs-information`; `state:needs-information` | not applicable until evidence arrives | repository maintainer |

These are policy-based dispositions, not a diagnosis of why installation failed.

## Duplicate evidence map

| Candidate | Canonical issue | Shared evidence | Distinguishing evidence | Policy threshold | Confidence | Recommendation |
|---|---|---|---|---|---|---|
| `#16` | `#12` | CLI `1.2.1`, Windows 11, Node 22, quoted existing target shape, same install command, exit `1`, and same error [E3, E4] | `#16` adds a successful `awf list` result [E4] | Same behavior, environment, and reproduction command with at least high confidence; the lower-numbered issue is canonical [E1] | high | Preserve the successful-list observation in policy-selected canonical issue `#12`, then propose linking and closing `#16` after maintainer approval |

Issue `#18` is not a duplicate candidate because the supplied record lacks the behavior, environment, and command needed by the duplicate rule. [E1, E5]

## Proposed responses

### Issue #12

> Thank you for the sanitized reproduction.
> The supplied record shows an existing quoted target on a supported Windows and Node environment returning `Target does not exist`.
> We propose recording this as a bug and blocking its impact label until the maintainer clarifies whether policy T-8 treats this bounded supported-configuration failure as high or medium impact.

Evidence basis: E1, E2, E3.

### Issue #16

> Your environment, command, and observed error match issue #12.
> Your successful `awf list` result is additional evidence that should be preserved in #12.
> We propose linking this report as a duplicate only after maintainer review, without assigning an impact label while the canonical issue's policy interpretation remains unresolved.

Evidence basis: E1, E3, E4.

### Issue #18

> Please provide the CLI version, operating system, Node version, exact command, sanitized output, target-path shape, and whether an installation manifest was created.
> Do not include tokens, customer data, or private absolute paths.
> We will use those details to decide type, impact, support status, and whether this report matches an existing issue.

Evidence basis: E1, E5.

## Proposed next actions and closure criteria

| Issue | Proposed action | Owner role | Dependency | Exit or closure criterion | Approval and mutation status |
|---|---|---|---|---|---|
| `#12` | Record the bug type, retain the reproduction, and ask the repository maintainer to clarify T-8's high-versus-medium installation boundary or record an evidence-backed exception | repository maintainer | Review E1 through E3, the policy ambiguity, and the response draft | The policy interpretation is recorded, the corresponding impact and state labels are approved and applied, and the issue retains the sanitized reproduction | Approval and policy clarification pending; unapplied [E6] |
| `#16` | Copy the successful `awf list` observation to `#12`, link `#16` as a duplicate, and post the response without an impact label until the canonical disposition is resolved | repository maintainer | `#12` remains canonical, preserves E4's distinguishing evidence, and has a recorded T-8 impact interpretation | Unique evidence appears in `#12`, relationship and response are approved, the canonical impact is recorded, and the duplicate link is recorded before closure | Approval and canonical impact pending; unapplied [E6] |
| `#18` | Post the minimal information request and retriage after a complete reply | repository maintainer | Maintainer approves the response | Requested fields arrive and enable the next type, impact, support, and duplicate decision; absence alone is not a closure criterion | Approval pending; unapplied [E6] |

No priority or delivery date is proposed because no product-owner approval or roadmap evidence was supplied. [E1, E6]

## Approval and security state

The repository maintainer must approve every response, label, duplicate link, and closure before application. [E1]
No supplied issue requires the private security route after sanitization review. [E6]
No action has been applied. [E6]

## Assumptions and limitations

- Snapshot `S-204` is treated as the complete triage boundary because its integrity record lists exactly the three supplied issues. [E6]
- The issue records support classification and duplicate analysis but contain no source-code or experiment evidence for a technical root cause.
- Policy T-8 does not define whether a failure limited to one target-path shape on a supported platform meets its high-impact installation-inability rule, so no impact is assigned to `#12` or `#16`. [E1, E2, E3, E4]
- Confidence for `#18` is not assigned because the record cannot support the policy's type, impact, or duplicate rules. [E1, E5]
- This artifact does not assess issues outside `S-204` or apply any tracker mutation.

## Traceability

| Artifact element | Evidence |
|---|---|
| Classification, impact, labels, duplicate rule, approvals, and closure controls | E1 |
| Supported environment | E2 |
| Canonical reproduction for `#12` | E3 |
| Matching reproduction and unique evidence for `#16` | E4 |
| Missing information for `#18` | E5 |
| Snapshot boundary, sanitization result, authorization, and mutation status | E6 |
