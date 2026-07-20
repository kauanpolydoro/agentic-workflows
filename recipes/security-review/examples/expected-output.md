# Defensive security review

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
