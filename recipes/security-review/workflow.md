# Perform a defensive security review

## Objective

Start from an explicitly authorized evidence set and produce three artifacts: a defensive security assessment, a prioritized finding register, and a remediation and residual-risk plan.
One quality constraint governs the whole review: every security claim must identify the protected asset, the control evidence, the attacker preconditions, a confidence level, and a safe way to verify it, and it must not overstate exploitability.

## When to use

- An authorized local application needs its defensive controls reviewed.
- A release needs risk-ranked findings on authentication, authorization, input handling, or secrets.
- A security owner wants a bounded review of source, configuration, routes, and tests, all drawn from one immutable revision.

## When not to use

- No written authorization exists, or the system boundaries were never stated.
- You could not validate anything without sending traffic to a real system or touching production secrets.
- The request is really asking for persistence, evasion, credential theft, or exploitation.
- The requested conclusion depends on deployed behavior, but the evidence cannot tell the reviewed source revision apart from what actually runs in deployment.

## Required inputs

- **Written authorization, immutable review revision, and explicit exclusions:** Provide the approving security-owner role, the allowed paths and techniques, the prohibited targets, and an immutable commit or archive digest.
  This one record draws the boundary around every inspection and validation action.
  Confirm the authorization is current, covers the requested artifacts, and does not rest on any individual's implied consent.
- **Trust boundaries, protected assets, data classifications, and attacker capabilities:** Provide the actors, entry points, identity transitions, sensitive assets, the allowed attacker position, and the excluded capabilities.
  This model is what makes impact and reachability judgments possible.
  Validate each boundary against a route, a configuration, a deployment record, or an explicitly supplied assumption.
- **Complete security-relevant source, configuration, route, and test inventory:** Provide exact file paths and excerpts for the control under review, its middleware and deployment wiring, and its positive and negative tests.
  This evidence is what observations stand on, and it is also what exposes an omitted control.
  Confirm every artifact belongs to the immutable review revision, and state which surrounding files were checked for alternate controls.

## Optional inputs

- **Approved threat model and security control requirements:** Intended mitigations plus an organization-specific severity rubric.
- **Safe local validation commands and retained results:** These raise confidence only when the record identifies the immutable revision, the isolated environment, the command, and the result.
- **Sanitized dependency or infrastructure evidence:** This clarifies framework behavior and exposure without disclosing secrets or production identifiers.

## Preconditions

- The authorization explicitly covers the supplied artifacts, the review period, and the techniques.
- The immutable revision and the complete security-relevant file inventory are recorded.
- Protected assets and at least one relevant trust boundary are identified.
- Excluded systems, prohibited actions, and disclosure recipients are written down.
- Inspection, and any validation approved separately, can happen without production credentials and without unapproved network traffic.

## Workflow

1. **Verify authorization before you inspect anything sensitive.**
   Record the approving role, allowed paths, immutable revision, techniques, excluded targets, review period, and disclosure boundary.
   Compare the work you were asked to do against that record.
   Advance only when every planned action is covered; otherwise stop under F1.
2. **Map the assets and trust boundaries.**
   List the protected assets, their classifications, the actors, entry points, identity sources, authorization decisions, data stores, and external exits.
   Tie each boundary to supplied source or configuration evidence, and mark any unsupported deployment assumption as unknown.
   Advance once the paths relevant to the requested controls can be traced from entry point to asset.
3. **Inventory the security controls and attack surfaces.**
   For authentication, authorization, input handling, secrets, logging, and error disclosure, record where enforcement is expected and where it is actually implemented.
   Reconcile route registration, middleware order, environment configuration, and tests against the source inventory.
   Stop under F2 when missing artifacts make a defensible conclusion about a control impossible.
4. **Develop bounded abuse cases.**
   For each relevant boundary, state the attacker position, the input the attacker controls, the required preconditions, the control bypass being attempted, and the consequence for the asset.
   Leave out any capability the authorization excludes.
   Treat each abuse case as a hypothesis until exact control evidence supports or disproves it.
5. **Inspect and challenge candidate findings.**
   Trace every candidate to exact source or configuration evidence, then search the supplied surrounding inventory for compensating controls.
   Keep the observed control behavior separate from what you infer about reachability and impact.
   Remove claims the evidence does not support, or retain them only as explicitly unconfirmed hypotheses.
6. **Validate safely.**
   Prefer static proof built from complete control flow and from local tests that were already supplied.
   Before any new active validation, including running a local fixture, obtain the separate security-owner gate, use only the approved isolated target, define the expected traffic and cleanup, and stop the moment anything reaches an unexpected network destination.
   Record a command as executed only when retained results exist.
7. **Rate each finding and assign its disposition.**
   Apply the supplied severity rubric to the asset impact and the attacker prerequisites, then assign confidence from how complete the evidence is and whether validation took place.
   Record each item as blocking, open, accepted with an expiry, or closed by evidence.
   If no rubric exists, describe the impact plainly instead of inventing an organizational severity.
8. **Design remediation and its verification.**
   For each confirmed finding, specify the control change, the owner role, negative and positive tests, any deployment dependency, the rollback, and the objective exit evidence.
   Preserve existing security controls, and reject remediation that merely hides a symptom.
9. **Package, redact, and get disclosure approved.**
   Produce the scope and threat summary, the finding register, the remediation sequence, the residual uncertainty, and the traceability table.
   Remove raw secrets, personal data, and operationally reusable exploit material.
   Share outside the authorized team only after the security owner approves the redacted artifact and the recipients.

## Decision points

- If authorization or ownership is uncertain, stop inspecting sensitive material, stop all active validation, and request a complete written scope record.
- If source or configuration coverage cannot show whether a compensating control exists, classify reachability as unknown and request the missing artifact instead of confirming a vulnerability.
- If a finding lacks reachability evidence, label it a hypothesis and prescribe a safe validation step.
- If active validation would contact any unapproved destination, do not run it, and escalate the validation plan to the security owner.
- If evidence contains a secret, redact the value and notify the security owner through the approved channel.
- If a remediation would weaken authentication, authorization, auditability, or confidentiality elsewhere, reject it and design a control-preserving alternative.
- If a High or Critical finding remains unresolved under the supplied release policy, require the release manager to hold the deployment.

## Safety guardrails

- Never perform credential theft.
- Never use persistence or evasion techniques.
- Never attack real systems.
- Never target non-local systems or use production credentials.
- Never publish secrets, raw credentials, personal records, or reusable offensive payloads.
- Keep tests inside the authorized fixture, and stop at the first sign of unexpected network access.
- Do not bypass access controls, alter audit logs, disable monitoring, or create durable access in the name of validation.
- Use synthetic data and disposable local state for approved active checks.
- When source material contains sensitive values, record only redacted locations and evidence digests.
- Do not claim exploitability from pattern matching alone; a matched pattern is a lead, not proof.

## Human approval gates

- Before any active testing, including local fixtures, the security owner approves the isolated target, the immutable revision, the method, the expected traffic, the test data, the network boundary, the stop conditions, the cleanup, and the rollback evidence.
- Before disclosing findings outside the authorized team, the security owner approves the redacted report, the severity rationale, the recipient list, the channel, and the timing.
- Before a deployment ships with a temporarily accepted reachable vulnerability, the security owner and the release manager approve the compensating controls, the accountable owner, the expiry, and the revalidation date.

## Expected output

- **Authorized defensive security assessment:** A Markdown document covering the scope, the authorization boundary, protected assets, trust boundaries, the threat summary, assumptions, and limitations.
- **Prioritized security finding register with dispositions:** Each row carries the finding, its evidence, impact, severity, confidence, recommendation, verification, and disposition.
- **Remediation, verification, and residual-risk plan:** Ordered actions with owner roles, dependencies, exit evidence, rollback, approval gates, and any unresolved hypotheses.

The artifact must keep observations, inferences, recommendations, executed checks, proposed checks, assumptions, limitations, and next actions clearly separated.
Material claims must cite example evidence IDs.

## Completion criteria

- Authorization, scope, exclusions, and limitations are all explicit.
- Every finding maps to code or configuration evidence.
- Each impact statement separates observed behavior from inference and names the attacker prerequisites.
- Severity and confidence are independently justified by the supplied rubric and the validation state.
- Every remediation names an owner role, a verification method, a rollback or recovery path, and objective closure evidence.
- No secret, offensive payload, or unsupported exploit claim appears anywhere.
- Active-test and disclosure approvals are retained when those gates apply.

## Failure modes

- **F1:** Authorization cannot be confirmed.
- **F2:** The inventory of security-relevant source or configuration is incomplete.
- **F3:** A suspected issue cannot be validated safely.
- **F4:** Sensitive evidence turns up in the review material.
- **F5:** An approved local validation attempts unexpected network access or modifies state that was never approved.

## Recovery procedure

- **R1:** Stop inspecting sensitive material, stop all active work, and request a written authorization record from the security owner that identifies the approving role, the immutable revision, the allowed paths and environment, the allowed techniques, the review period, the excluded targets and actions, the active-test permission, the disclosure recipients, the stop conditions, the cleanup, and the rollback requirements.
  Verify the record's provenance through the organization's approved authorization channel, and retain its immutable identifier or digest.
  Compare every planned action against the granted scope, and restart at workflow step 1 only after all required fields and ownership are confirmed.
- **R2:** Request the exact missing route, middleware, deployment, or test artifact, keep the affected findings unconfirmed, and resume at workflow step 3 only after provenance is verified.
- **R3:** Retain the item as an unconfirmed hypothesis, design a bounded local validation plan, and either resume at workflow step 6 once it is approved or stop without making an exploitability claim.
- **R4:** Stop reading or copying the value, redact it, preserve only the location, the type, and a non-reversible digest when that is approved, notify the security owner, and resume only after handling instructions are recorded.
- **R5:** Terminate the validation, preserve sanitized logs, remove the approved disposable state, notify the security owner, and restart at workflow step 6 only with a corrected and newly approved isolation plan.

## Example

The complete synthetic example lives in [examples/input.md](examples/input.md), and its complete artifact is in [examples/expected-output.md](examples/expected-output.md).
Together they demonstrate evidence traceability without relying on external sources.
