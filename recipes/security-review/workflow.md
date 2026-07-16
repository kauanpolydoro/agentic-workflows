# Perform a defensive security review

## Objective

Transform an explicitly authorized evidence set into a defensive security assessment, prioritized finding register, and remediation and residual-risk plan.
The primary quality constraint is that each security claim must identify the protected asset, control evidence, attacker preconditions, confidence, and safe verification without overstating exploitability.

## When to use

- An authorized local application needs a defensive control review.
- A release needs risk-ranked findings for authentication, authorization, input handling, or secrets.
- A security owner needs a bounded review of source, configuration, routes, and tests at one immutable revision.

## When not to use

- Written authorization or system boundaries are absent.
- Validation would require traffic to a real system or access to production secrets.
- The request asks for persistence, evasion, credential theft, or exploitation.
- The evidence cannot distinguish the reviewed source revision from deployed behavior and the requested conclusion depends on that distinction.

## Required inputs

- **Written authorization, immutable review revision, and explicit exclusions:** Supply the approving security-owner role, allowed paths and techniques, prohibited targets, and an immutable commit or archive digest.
  This record bounds every inspection and validation action.
  Confirm the authorization is current, covers the requested artifacts, and does not rely on an individual's implied consent.
- **Trust boundaries, protected assets, data classifications, and attacker capabilities:** Supply actors, entry points, identity transitions, sensitive assets, allowed attacker position, and excluded capabilities.
  This model is required to evaluate impact and reachability.
  Validate each boundary against a route, configuration, deployment record, or explicitly supplied assumption.
- **Complete security-relevant source, configuration, route, and test inventory:** Supply exact file paths and excerpts for the control under review, its middleware and deployment wiring, and its positive and negative tests.
  This evidence supports observations and exposes omitted controls.
  Confirm every artifact belongs to the immutable review revision and state which surrounding files were checked for alternate controls.

## Optional inputs

- **Approved threat model and security control requirements:** Provide intended mitigations and an organization-specific severity rubric.
- **Safe local validation commands and retained results:** Increase confidence only when the record identifies the immutable revision, isolated environment, command, and result.
- **Sanitized dependency or infrastructure evidence:** Clarifies framework behavior and exposure without disclosing secrets or production identifiers.

## Preconditions

- Authorization explicitly covers the supplied artifacts, review period, and techniques.
- The immutable revision and complete security-relevant file inventory are recorded.
- Protected assets and at least one relevant trust boundary are identified.
- Excluded systems, prohibited actions, and disclosure recipients are recorded.
- Inspection and any separately approved validation can occur without production credentials or unapproved network traffic.

## Workflow

1. **Verify authorization before inspecting sensitive material.**
   Record the approving role, allowed paths, immutable revision, techniques, excluded targets, review period, and disclosure boundary.
   Compare the requested work with that record.
   Advance only when every planned action is covered; otherwise stop under F1.
2. **Create the asset and boundary map.**
   List protected assets, classifications, actors, entry points, identity sources, authorization decisions, data stores, and external exits.
   Tie each boundary to supplied source or configuration evidence and mark unsupported deployment assumptions as unknown.
   Advance when the paths relevant to the requested controls are traceable from entry point to asset.
3. **Inventory security controls and attack surfaces.**
   For authentication, authorization, input handling, secrets, logging, and error disclosure, record where enforcement is expected and where it is implemented.
   Reconcile route registration, middleware order, environment configuration, and tests with the source inventory.
   Stop under F2 when missing artifacts prevent a defensible control conclusion.
4. **Develop bounded abuse cases.**
   For each relevant boundary, state attacker position, controllable input, required preconditions, attempted control bypass, and asset consequence.
   Exclude capabilities outside authorization.
   Keep each abuse case as a hypothesis until exact control evidence supports or disproves it.
5. **Inspect and challenge candidate findings.**
   Trace every candidate to exact source or configuration evidence, then search the supplied surrounding inventory for compensating controls.
   Separate the observed control behavior from inferred reachability and impact.
   Remove unsupported claims or retain them as explicitly unconfirmed hypotheses.
6. **Validate safely.**
   Prefer static proof from complete control flow and local tests already supplied.
   Before any new active validation, including local fixture execution, obtain the separate security-owner gate, use only the approved isolated target, define expected traffic and cleanup, and stop on any unexpected network destination.
   Record commands as executed only when retained results exist.
7. **Rate and disposition findings.**
   Apply the supplied severity rubric to asset impact and attacker prerequisites, then assign confidence from evidence completeness and validation status.
   Record each item as blocking, open, accepted with expiry, or closed by evidence.
   If no rubric exists, describe impact without inventing an organizational severity.
8. **Design remediation and verification.**
   For each confirmed finding, specify the control change, owner role, negative and positive tests, deployment dependency, rollback, and objective exit evidence.
   Preserve existing security controls and avoid remediation that merely hides a symptom.
9. **Package, redact, and approve disclosure.**
   Produce the scope and threat summary, finding register, remediation sequence, residual uncertainty, and traceability table.
   Remove raw secrets, personal data, and operationally reusable exploit material.
   Share outside the authorized team only after the security owner approves the redacted artifact and recipients.

## Decision points

- If authorization or ownership is uncertain, stop inspection of sensitive material and all active validation, then request a complete written scope record.
- If source or configuration coverage cannot establish whether a compensating control exists, classify reachability as unknown and request the missing artifact instead of confirming a vulnerability.
- If a finding lacks reachability evidence, label it as a hypothesis and prescribe a safe validation step.
- If active validation would contact any unapproved destination, do not run it and escalate the validation plan to the security owner.
- If evidence contains a secret, redact the value and notify the security owner through the approved channel.
- If remediation weakens authentication, authorization, auditability, or confidentiality elsewhere, reject it and design a control-preserving alternative.
- If a High or Critical finding remains unresolved under the supplied release policy, require the release manager to hold deployment.

## Safety guardrails

- Never perform credential theft.
- Never use persistence or evasion.
- Never attack real systems.
- Never target non-local systems or use production credentials.
- Never publish secrets, raw credentials, personal records, or reusable offensive payloads.
- Keep tests inside the authorized fixture and stop on unexpected network access.
- Do not bypass access controls, alter audit logs, disable monitoring, or create durable access for validation.
- Use synthetic data and disposable local state for approved active checks.
- Record only redacted locations and evidence digests when source material contains sensitive values.
- Do not claim exploitability from pattern matching alone.

## Human approval gates

- Before any active testing, including local fixtures, the security owner approves the isolated target, immutable revision, method, expected traffic, test data, network boundary, stop conditions, cleanup, and rollback evidence.
- Before disclosing findings outside the authorized team, the security owner approves the redacted report, severity rationale, recipient list, channel, and timing.
- Before deployment with a temporarily accepted reachable vulnerability, the security owner and release manager approve compensating controls, accountable owner, expiry, and revalidation date.

## Expected output

- **Authorized defensive security assessment:** Markdown scope, authorization boundary, protected assets, trust boundaries, threat summary, assumptions, and limitations.
- **Prioritized security finding register with dispositions:** Each row contains finding, evidence, impact, severity, confidence, recommendation, verification, and disposition.
- **Remediation, verification, and residual-risk plan:** Ordered actions with owner roles, dependencies, exit evidence, rollback, approval gates, and unresolved hypotheses.

The artifact must distinguish observations, inferences, recommendations, executed checks, proposed checks, assumptions, limitations, and next actions.
Material claims must cite example evidence IDs.

## Completion criteria

- Authorization, scope, exclusions, and limitations are explicit.
- Every finding maps to code or configuration evidence.
- Each impact separates observed behavior from inference and states attacker prerequisites.
- Severity and confidence are independently justified by the supplied rubric and validation state.
- Every remediation has an owner role, verification method, rollback or recovery, and objective closure evidence.
- No secret, offensive payload, or unsupported exploit claim appears.
- Active-test and disclosure approvals are retained when those gates apply.

## Failure modes

- **F1:** Authorization cannot be confirmed.
- **F2:** The security-relevant source or configuration inventory is incomplete.
- **F3:** A suspected issue cannot be validated safely.
- **F4:** Sensitive evidence is discovered in the review material.
- **F5:** An approved local validation attempts unexpected network access or modifies unapproved state.

## Recovery procedure

- **R1:** Stop inspection of sensitive material and all active work, then request a written authorization record from the security owner that identifies the approving role, immutable revision, allowed paths and environment, allowed techniques, review period, excluded targets and actions, active-test permission, disclosure recipients, stop conditions, cleanup, and rollback requirements.
  Verify the record's provenance through the organization's approved authorization channel, retain its immutable identifier or digest, compare every planned action with the granted scope, and restart at workflow step 1 only after all required fields and ownership are confirmed.
- **R2:** Request the exact missing route, middleware, deployment, or test artifact, keep affected findings unconfirmed, and resume at workflow step 3 only after provenance is verified.
- **R3:** Retain the item as an unconfirmed hypothesis, design a bounded local validation plan, and either resume at workflow step 6 after approval or stop without an exploitability claim.
- **R4:** Stop reading or copying the value, redact it, preserve only location, type, and a non-reversible digest when approved, notify the security owner, and resume only after handling instructions are recorded.
- **R5:** Terminate the validation, preserve sanitized logs, remove approved disposable state, notify the security owner, and restart at workflow step 6 only with a corrected and newly approved isolation plan.

## Example

The complete synthetic example is in [examples/input.md](examples/input.md), with its complete artifact in [examples/expected-output.md](examples/expected-output.md).
It demonstrates evidence traceability without relying on external sources.
