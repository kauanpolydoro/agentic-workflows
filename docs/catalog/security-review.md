---
title: "Perform a defensive security review"
description: "Produce an authorized defensive security assessment with evidence-ranked findings, remediation, and residual risk."
---

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

The complete synthetic example is in [#complete-example-input](#complete-example-input), with its complete artifact in [#complete-expected-output](#complete-expected-output).
It demonstrates evidence traceability without relying on external sources.

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
