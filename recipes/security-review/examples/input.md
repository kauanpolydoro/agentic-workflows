# Example input

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
