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
See the [example input](examples/input.md) and the [expected output](examples/expected-output.md).
