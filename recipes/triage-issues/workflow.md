# Triage a bounded repository issue queue

## Objective

Transform an immutable issue snapshot and an owner-approved triage policy into a disposition register, duplicate evidence map, proposed responses, and owned closure criteria.
The primary quality constraint is that facts, reporter claims, triager inferences, recommendations, approvals, and tracker mutations remain distinguishable.

## When to use

Use this workflow for a fixed issue range or periodic queue snapshot whose bodies, comments, labels, states, environment records, attachment inventory, and governing policy are available.
Use it to propose consistent classification, duplicate relationships, information requests, owner roles, and next states before a maintainer mutates the tracker.

## When not to use

Do not use for a suspected vulnerability that has not entered the private security route, an unbounded or changing queue, inaccessible attachments required for classification, or a repository without an owner-approved triage policy.
Do not use it as a substitute for technical diagnosis when the requested outcome is a root cause or code fix.

## Required inputs

- **Issue snapshot:** provide a snapshot identifier and a bounded set containing each issue's ID, title, body, comments, current labels, current state, environment, reproduction evidence, and attachment inventory; this is the factual boundary, and integrity requires that the set remain unchanged during triage.
- **Triage policy:** provide a versioned, owner-approved policy defining types, impact levels, states, labels, duplicate threshold, unsupported-environment handling, mutation authority, closure rules, and private security escalation; this makes classifications reproducible, and integrity requires a resolvable revision and owner.

## Optional inputs

- **Approved roadmap:** use it to explain owner-approved priority, dependencies, or sequencing, but never infer a delivery date.
- **Versioned support matrix:** use it to classify environment support independently from report validity.
- **Component ownership map:** use it to propose responsible roles without inventing individual assignees.

## Preconditions

- Every issue in the bounded snapshot is readable and retains the recorded body, comments, labels, and state.
- The policy defines types, impact levels, labels, states, duplicate confidence, closure authority, and the private security route.
- Sensitive attachments can be excluded or sanitized before public analysis.
- The workflow has an explicit authorization record stating which responses and tracker mutations, if any, are permitted.

## Workflow

1. **Freeze scope:** record the snapshot ID, issue IDs, policy revision, audience, current labels and states, evidence cutoff, and exclusions; advance when the recorded issue count and states reconcile with the immutable snapshot, and stop if the snapshot changes.
2. **Screen for restricted material:** inventory attachments and inspect report metadata for secrets, customer data, or plausible security impact; advance when every record is public-safe or has an approved private route, and stop public handling of any restricted record.
3. **Build fact records:** separate repository facts, reporter claims, triager inferences, and missing evidence for every issue; advance when each extracted statement is validated against the snapshot, and stop a disposition when a material statement cannot be attributed.
4. **Compare duplicate candidates:** compare observed behavior, environment, version, reproduction command, and distinguishing evidence; advance when each candidate meets the policy threshold or has a recorded evidence gap, and stop a duplicate disposition when discriminating evidence is insufficient.
5. **Apply policy:** assign type, impact, support status, and proposed state by citing both the governing rule and issue evidence; advance when each assignment is derivable from both sources, and stop when the policy lacks a necessary class or two rules conflict.
6. **Design the next decision:** request only the smallest missing information that enables a named classification, duplicate, support, or closure decision; advance when every request maps to that named decision, and stop if a request collects unrelated information or treats absence as invalidity.
7. **Draft controlled actions:** propose labels, duplicate relationships, responses, owner roles, dependencies, next states, and closure criteria; advance when each action is marked proposed or completed with retained authorization and mutation evidence, and stop on ambiguous action status.
8. **Obtain approvals:** submit public responses, labels, assignments, closure, priority changes, and security routing to their responsible roles with the evidence and policy rule; advance when every applicable approval is recorded or explicitly non-applicable, and stop mutation while a required approval is pending or denied.
9. **Deliver and reconcile:** produce the per-issue register, duplicate map, response drafts, next-action table, approval state, assumptions, limitations, and evidence traceability; complete only when every issue and completion criterion maps to the artifact, and stop handoff if an issue is omitted or represented more than once.

## Decision points

- If a report contains a plausible vulnerability, secret, customer data, or private reproduction detail, stop public handling and request security owner approval for the private route.
- If two issues meet the policy's duplicate evidence and confidence threshold, apply the policy's canonical-selection rule and preserve the other report's unique evidence in the canonical issue before proposing the duplicate relationship.
- If the policy defines no canonical-selection rule, keep the relationship proposed without choosing a canonical issue until the repository maintainer records that decision.
- If duplicate confidence is below the policy threshold, keep both issues separate and request the smallest discriminating evidence.
- If a reported environment is unsupported, record support status separately from validity and do not close solely because of support status.
- If required classification data is missing, propose a minimal information request and keep the disposition blocked rather than guessing.
- If a priority, delivery date, response, or tracker mutation lacks the required owner approval, keep it proposed and identify the approving role.

## Safety guardrails

- Never post secrets from reports, private attachments, customer data, or security reproduction details in the public artifact.
- Never promise dates without owner approval or present roadmap interest as a commitment.
- Never mass-close low-information reports or use missing data as proof that a report is invalid.
- Never mutate the issue tracker without approval and retained evidence of the applied action.
- Do not infer reporter intent or merge distinct evidence merely to reduce queue size.
- Keep repository facts, reporter claims, triager inferences, recommendations, approvals, and completed actions visibly separate.

## Human approval gates

- Before closing or publicly responding to issues, the repository maintainer must review the issue evidence, policy rule, proposed classification, closure criteria, and exact response text.
- Before applying a label, assignment, or duplicate relationship, the repository maintainer must review the current state, proposed mutation, evidence, and rollback or correction path.
- Before changing priority commitments, the product owner must review impact evidence, dependencies, roadmap effect, and the absence or presence of a delivery commitment.
- Before routing a suspected security report, the security owner must approve the private destination, retained public-safe metadata, and any public response.

## Expected output

Produce a Markdown package containing scope and policy revision, one evidence-linked disposition per issue, a duplicate evidence map, proposed response drafts, owned next actions with dependencies and closure criteria, approval and mutation status, assumptions, limitations, and traceability.
Every record must distinguish facts, reporter claims, triager inference, recommendation, and completed action status.

## Completion criteria

- Every issue has a policy-linked classification or a precise blocked reason and minimal information request.
- Every proposed duplicate cites shared evidence, distinguishing evidence, policy threshold, and confidence.
- Every proposed response requests only information needed for a named next decision.
- Every next action has an owner role, dependency, exit criterion, approval state, and mutation status.
- No public response or tracker mutation is represented as completed without retained approval and application evidence.
- Security-sensitive material is absent from the public artifact and any restricted report has an approved private disposition.
- Every issue ID in the frozen snapshot appears exactly once in the disposition register.

## Failure modes

- **F1:** The issue snapshot is incomplete or changes during triage.
- **F2:** A report or attachment exposes restricted information.
- **F3:** The policy lacks a required classification, state, or authority rule.
- **F4:** Duplicate evidence does not meet the policy threshold.
- **F5:** The responsible role does not approve a proposed response or tracker mutation.

## Recovery procedure

- **R1:** Capture a new bounded snapshot, verify its issue count and state, invalidate affected classifications, and restart those records from scope freezing.
- **R2:** Stop public processing, retain only safe metadata, obtain security owner routing approval, and resume public triage only if a sanitized record is authorized.
- **R3:** Mark the disposition blocked, request a policy decision from the repository maintainer, and resume classification after the policy revision is approved.
- **R4:** Keep the issues separate, record the missing discriminating evidence, request only that evidence, and reevaluate the duplicate after it arrives.
- **R5:** Leave the action proposed, record the rejection or requested changes, revise from the cited evidence, and do not mutate the tracker until approval is granted.

## Example

The complete synthetic example triages three CLI reports from immutable snapshot `S-204` under policy `T-8` without posting responses or mutating the tracker.
It demonstrates a high-confidence duplicate candidate, a blocked low-information report, explicit approval requirements, and closure criteria.

See [example input](examples/input.md) and [expected output](examples/expected-output.md).
