---
title: "Perform a defensive security review"
description: "Review authorized source, configuration, routes, and tests at one immutable revision, then deliver a defensive security assessment, a prioritized finding register, and a remediation and residual-risk plan."
---

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

The complete synthetic example lives in [#complete-example-input](#complete-example-input), and its complete artifact is in [#complete-expected-output](#complete-expected-output).
Together they demonstrate evidence traceability without relying on external sources.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/security-review/1.0.0",
  "title": "Security review output contract",
  "description": "Validates the authorized scope, threat summary, evidence-ranked findings, remediation order, safe verification plan, residual risk, disclosure approval, limitations, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "security-review.md",
        "audience": "Authorized security reviewers and system owners",
        "requires_title": true,
        "required_headings": [
          "Scope and threat summary",
          "Findings",
          "Remediation order",
          "Verification plan",
          "Executed",
          "Residual risk and disposition",
          "Assumptions and limitations",
          "Approval and disclosure",
          "Traceability"
        ],
        "required_literals": [
          "| Severity | Confidence | Finding | Evidence | Impact | Recommendation | Verification | Disposition |",
          "### Proposed",
          "| Material conclusion | Evidence |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This is a synthetic, self-contained scenario.
No external record should be consulted.

## Context

Synthetic Express API at immutable commit `5410000000000000000000000000000000000000`.
The scenario is authorized for static review only and contains no real customer data or deployable credentials.

## Request

Perform a static defensive review without executing the service.

## Constraints

- Use only the evidence below.
- Treat commands as executed only when their evidence explicitly records a result.
- State assumptions and limitations.
- Do not run the service, send network traffic, or construct an exploit payload.

## Evidence inventory

### E1 - Authorization

- Type: Written authorization record.
- Content: The security owner authorizes static review of `src/admin.ts`, `src/app.ts`, `config/routes.yml`, and `test/admin.test.ts` at commit `5410000000000000000000000000000000000000`.
- Content: The authorization is valid from `2026-01-10T09:00:00Z` through `2026-01-10T17:00:00Z` and covers only the synthetic review represented by this evidence package.
- Content: The synthetic review time is `2026-01-10T12:00:00Z`, which falls within the authorized period.
- Content: Runtime execution, network traffic, credential use, persistence, evasion, exploit payload development, and disclosure outside the security team are excluded.
- Integrity: The record identifies the approving role, immutable revision, review period, allowed files, and prohibited techniques.
- Establishes: Review scope, current authorization period, and mandatory stop conditions.

### E2 - Protected asset and trust boundary

- Type: Approved data-flow description.
- Content: `POST /admin/export` is reachable from the corporate user network through the application gateway.
- Content: Request bodies originate from callers and are untrusted.
- Content: A successful export contains customer email addresses classified as customer-confidential.
- Content: The intended control requires an authenticated employee identity with the server-side `admin-export` permission.
- Integrity: The security owner supplied this boundary for commit `5410000000000000000000000000000000000000`.
- Establishes: Entry point, caller capability, protected asset, data classification, and required authorization decision.

### E3 - Complete route code from `src/admin.ts`

- Type: Source excerpt.
- Content: The complete handler and route-local middleware are:

```ts
router.post("/admin/export", express.json(), async (req, res) => {
  if (req.body.role !== "admin") {
    return res.status(403).json({ code: "forbidden" });
  }

  const rows = await exportCustomerEmails();
  return res.json({ rows });
});
```

- Content: No authenticated principal or server-side permission is read elsewhere in this file.
- Integrity: The excerpt is complete for the route at commit `5410000000000000000000000000000000000000`.
- Establishes: The caller-controlled comparison and the export action.

### E4 - Application and route configuration

- Type: Source and configuration excerpts.
- Content: `src/app.ts` registers `app.use(router)` and does not register authentication middleware before or after the router.
- Content: `config/routes.yml` maps the application gateway path `/admin/export` to this service for the corporate user network and declares no gateway authorization policy.
- Content: The supplied inventory contains no other middleware or gateway policy for this path.
- Integrity: Both excerpts belong to commit `5410000000000000000000000000000000000000` and cover the complete supplied route wiring.
- Establishes: The absence of a supplied server-side identity source or compensating gateway authorization control.

### E5 - Test inventory

- Type: Complete test-file summary.
- Content: `test/admin.test.ts` contains one test that sends `{role: "admin"}` and expects status 200.
- Content: It has no unauthenticated, unauthorized-principal, caller-controlled-role, or permission-denial test.
- Integrity: The summary covers the complete test file at commit `5410000000000000000000000000000000000000`.
- Establishes: Existing positive-path coverage and missing negative authorization coverage.

### E6 - Severity and release policy

- Type: Supplied security and release policy.
- Content: A caller on an allowed network who can obtain customer-confidential data without an authenticated principal is High severity and blocks deployment.
- Content: A missing negative regression test for a sensitive authorization control is Medium severity while the control is unverified.
- Content: The repository maintainer owns code and test remediation, the security owner approves the control design and closure evidence, and the release manager owns the deployment gate.
- Establishes: Severity classification, dispositions, owner roles, and approval gates.

### E7 - Verification and disclosure state

- Type: Execution and approval record.
- Content: No command, server, request, or exploit was executed for this synthetic example.
- Content: The security owner has not approved active validation or disclosure outside the authorized security team.
- Content: The report may retain file paths and redacted code behavior but must not include real email addresses or reusable exploit payloads.
- Establishes: Static-only confidence, unexecuted checks, pending gates, and redaction requirements.

## Complete expected output

## Scope and threat summary

Static review covers `src/admin.ts`, `src/app.ts`, `config/routes.yml`, and `test/admin.test.ts` at commit `5410000000000000000000000000000000000000` [E1].
Authorization covers only the synthetic static-review window from `2026-01-10T09:00:00Z` through `2026-01-10T17:00:00Z` [E1].
The recorded review time is `2026-01-10T12:00:00Z`, within that window [E1].
Runtime execution, network traffic, credential use, exploit payload development, and external disclosure were prohibited [E1, E7].
The protected asset is an export of customer-confidential email addresses [E2].
The relevant attacker position is a caller on the corporate user network who controls the JSON request body [E2].
The intended trust transition is from that untrusted request to an authenticated employee principal with the server-side `admin-export` permission [E2].

## Findings

| Severity | Confidence | Finding | Evidence | Impact | Recommendation | Verification | Disposition |
|---|---|---|---|---|---|---|---|
| High | High | The export decision compares caller-controlled `req.body.role` with `admin`; the complete supplied route wiring contains no authenticated principal or compensating gateway authorization. | E2, E3, E4, E6, E7 | Observation: a corporate-network caller controls the value used by the handler. Inference: such a caller can satisfy the comparison and reach an export of customer-confidential email addresses. The supplied policy classifies this condition as High. | Require authentication before the router and authorize `admin-export` from a server-side principal. Ignore role claims in the request body. | Add isolated negative tests for no principal, a principal without permission, and a forged body role, plus a positive test for an authorized principal. No test was executed. | Blocking deployment under the supplied policy |
| Medium | High | The complete test file covers only a successful body role and contains no negative authorization case. | E5, E6 | The current suite would not detect the observed control design or a later authorization regression. | Replace the body-role success condition with principal-based fixtures and add the three negative cases. | Proposed tests remain unexecuted [E7]. | Open until test evidence accompanies the High-finding fix |

## Remediation order

| Finding | Control change | Owner role | Positive and negative tests | Deployment dependency | Objective exit evidence | Rollback or recovery |
|---|---|---|---|---|---|---|
| High caller-controlled authorization decision | Add authentication before `router`, authorize `admin-export` from the server-side principal, and ignore body role claims [E2, E3, E4] | Repository maintainer implements; security owner approves closure [E6] | Reject no principal, reject a principal without permission even with body role `admin`, accept an authorized principal, and prove the export function is not called on denial [E2, E5] | Security-owner approval of the control and sanitized isolated-test evidence; release manager keeps deployment blocked until closure [E6, E7] | The recorded route stack places authentication before the handler, all positive and negative tests pass at the reviewed revision, and body role does not affect authorization | Revert the proposed patch only in the isolated pre-deployment environment if it breaks unrelated route behavior, preserve the failing evidence, keep deployment blocked, and redesign without restoring the insecure route to service |
| Medium missing negative authorization coverage | Replace the body-role-only fixture with principal-based fixtures and retain all three negative cases [E5] | Repository maintainer implements; security owner reviews the protected-boundary coverage [E6] | Run the same positive and negative cases required for the High finding and retain exact results [E5, E7] | The server-side principal contract from the High remediation must be defined before the fixtures can be final | The complete test file contains the approved principal fixtures, every denial asserts no export call, and retained results identify commit `5410000000000000000000000000000000000000` or its approved remediation commit | If a fixture is invalid, revert only the test change, keep both findings open, correct the fixture contract, and rerun after security-owner approval |

The repository maintainer implements the High control before relying on the Medium coverage change.
The security owner reviews middleware order, authorization behavior, sanitized test output, and body-role independence before closure [E6].
The release manager keeps deployment blocked until the High finding is closed [E6].

## Verification plan

### Executed

No command, server, request, or exploit was executed [E7].

### Proposed

The following checks remain contingent on local-test approval.

- Assert that a request without a principal is rejected before `exportCustomerEmails` is called.
- Assert that a principal without `admin-export` is rejected even when the body says `admin`.
- Assert that an authorized principal can complete the route without relying on a body role.
- Inspect the recorded route stack to prove authentication precedes the export handler.

These checks require an isolated fixture and security-owner approval before any active validation [E1, E7].

## Residual risk and disposition

The static inventory supports the missing-control observation with High confidence [E3, E4].
Runtime deployment equivalence was not tested, so a deployed compensating control outside the supplied complete inventory remains unverified rather than assumed.
The High finding remains blocking, and the Medium finding remains open until the control and negative tests are reviewed [E6].

## Assumptions and limitations

The potential access outcome is an inference from the supplied trust boundary, route, and complete route wiring [E2, E3, E4].
No exploitability beyond a corporate-network caller is claimed.
No runtime result, production exposure, or real-data access is claimed [E1, E7].

## Approval and disclosure

The security owner must approve active local validation before any requests are created [E1, E7].
The security owner must approve the redacted report and recipients before disclosure outside the authorized security team [E7].
The release manager owns the deployment hold after the security owner confirms closure evidence [E6].

## Traceability

| Material conclusion | Evidence |
|---|---|
| Authorized static scope and prohibited actions | E1 |
| Protected asset, caller capability, and intended permission | E2 |
| Caller-controlled authorization comparison | E3 |
| No supplied authenticated identity or gateway control | E4 |
| Missing negative test coverage | E5 |
| Severity, owner roles, and deployment disposition | E6 |
| No executed validation and pending disclosure gate | E7 |
