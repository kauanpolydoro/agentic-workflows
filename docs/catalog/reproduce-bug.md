---
title: "Build a bounded bug reproduction"
description: "Turn a bug report into a sanitized repository-bound reproduction, a regression test that fails for the reported behavior, and a repeatability record, all without changing product behavior."
---

# Build a bounded bug reproduction

## Objective

Take a behavior report whose expectation can be attributed to a contract or an approval, and turn it into three artifacts: a sanitized repository-bound reproduction record, a failing regression test at a named path, and a repeatability record.
One quality constraint matters above all others: the test must fail on the affected revision, for the reported behavior, before any product fix is introduced.

## When to use

- You need to confirm a user-visible defect on a specific released version or commit before anyone diagnoses or fixes it.
- A reliable report arrived with extra data or setup, and you need to shrink it into a portable fixture.
- An intermittent symptom needs a bounded record of how often it recurs, plus a reusable test boundary.

## When not to use

- The expected behavior is disputed, and no product contract or authorized decision settles the dispute.
- You cannot obtain or safely reconstruct the affected revision, its dependency state, or the triggering input.
- Reproducing the bug would require production credentials, unsanitized customer data, destructive actions in production, or an unapproved external charge.
- Your actual task is to diagnose a captured failure, implement a fix, or triage an incident, rather than to establish reproducibility.

## Required inputs

- **Approved expected behavior and exact observed behavior:** Provide the contract text or role-based approval that backs the expectation, plus the concrete status codes, values, errors, or visible states you actually observed.
  This is what separates a real defect from a mismatch in expectations.
  Check that the source applies to the affected version and that any ambiguous wording has an owner disposition.
- **Immutable affected environment:** Record the commit or release, the operating-system and runtime versions, the dependency lock state, the database engine, the browser, and any feature flags that can influence the behavior.
  Every attempt is anchored to this record.
  Check that the revision resolves and that the environment can be rebuilt from the retained configuration.
- **Sanitized trigger and setup protocol:** Supply the smallest triggering input you know of, along with the fixture, the state setup, the exact invocation command, and the state-reset procedure.
  This is what makes repetition safe and portable.
  Check that secrets, personal data, and unrelated fields are gone while the relevant shape and the failure itself remain.
- **Repeated boundary results:** Record the expected and observed result for a predeclared number of clean reproduction attempts, taken through the closest authorized user boundary.
  These repeated results support a bounded recurrence classification, and an intermittent classification when the attempts disagree.
  Check that every attempt carries its environment, reset confirmation, output, and exit or response status.

## Optional inputs

- An immutable known-good revision in a comparable environment lets you establish a regression range once the reproduction is stable.
- Sanitized logs and traces can guide minimization, but they do not establish root cause; that takes a separate causal experiment.
- Screenshots or recordings preserve presentation symptoms when textual output is not enough.
- A minimization history shows which fields, steps, or services were already removed while the failure remained.

## Preconditions

- The expected behavior has an attributable contract or explicit product-owner approval.
- The affected revision and every required dependency can be restored in an isolated environment.
- The triggering data contains no production credential, secret, or unsanitized personal information.
- Persistent state can be reset between attempts, and the reset itself can be observed.
- No product fix or unrelated working-tree change is present during baseline reproduction.

## Workflow

### 1. Pin down the disputed behavior

Translate the report into one observable condition with an exact input, an expected result, and an observed result.
Attach the contract or approval that establishes the expectation.
Advance when a reviewer can decide pass or fail without interpretation.
Stop if the expected behavior remains disputed.

### 2. Freeze the revision and environment

Resolve the affected release or commit, then record the runtime, operating system, dependency lock, flags, and persistent-service versions.
Create an isolated environment from that record and confirm that no uncommitted behavior change is present.
Advance when the environment identity is reproducible.
Stop if an uncontrolled version difference could explain the symptom.

### 3. Sanitize and minimize the trigger

Remove credentials, personal data, unrelated fields, external calls, and setup steps, one at a time.
After every removal, reset the state and rerun the same boundary action.
Keep a minimization ledger that shows whether the failure remained after each removal.
Advance when nothing more can be removed without losing the targeted behavior.
Stop if sanitization removes the failure and no safe structural substitute can be built.

### 4. Run a bounded reproduction sample

Predeclare the number of attempts, then run the minimal protocol from a clean state each time.
For every attempt, record the command, input, output, response or exit status, environment, and reset confirmation.
Advance when the recurrence rate is calculated.
Report the observed recurrence for the predeclared sample, and classify mixed outcomes from identical attempts as intermittent.
If every attempt reproduces the failure, that demonstrates consistency within the bounded sample, not universal determinism.

### 5. Choose the regression-test boundary

Pick the closest stable boundary that exercises the observed behavior, whether that is the browser, HTTP, the CLI, a service, or a pure API.
Record any end-to-end coverage lost by moving inward.
Advance when the test can control all required state without mocking the behavior under test.
Stop if the chosen seam bypasses the reported behavior.

### 6. Write the failing test and challenge it

Create a named test with the minimal fixture and the exact expected assertion, then run it on the affected revision.
Confirm that setup, import, fixture, and unrelated assertions pass before the intended behavior assertion fails.
Temporarily invert or remove the targeted assertion, only to confirm its causal location, then restore it without changing product code.
Advance when the retained test fails for the expected reason.
Stop if the test fails earlier than the targeted assertion, or if it passes on the affected behavior.

### 7. Package the reproduction

Package everything a reviewer needs: the required source revision with its locked dependency prerequisites, the environment setup, the state reset, the minimal fixture, and the exact command.
Include the per-attempt results, the regression-test path and excerpt, the boundary limitation, the safety record, and the evidence map.
Keep observations separate from hypotheses, and state plainly that causal diagnosis and remediation sit outside this workflow.
Advance when a reviewer with access to the referenced source checkout can reproduce from the record without undocumented setup.

## Decision points

- If expected behavior is absent or disputed, stop before writing a test and obtain a product-owner decision backed by the applicable contract evidence.
- If sanitization removes the symptom, restore the last removed structural property with synthetic data and repeat the minimization check.
- If an end-to-end environment is unavailable, move one boundary inward only after recording the lost coverage and obtaining repository-maintainer approval.
- If identical clean attempts produce mixed outcomes, classify the reproduction as intermittent and report the measured recurrence.
- If the new test fails during setup, import, or fixture creation, correct that independent failure before you attribute the result to the reported behavior.
- If the new test passes on the affected revision, reject it as a regression guard and redesign the assertion or the boundary.

## Safety guardrails

- **Using production credentials or unsanitized customer data** is forbidden everywhere, including fixtures, logs, screenshots, traces, and environments.
- **Changing product behavior before capturing the failure** is forbidden; capture the failure and retain the failing regression test first.
- **Accepting a regression test that fails for an unrelated reason** is forbidden, and that includes setup, import, timeout, and fixture errors.
- Use disposable local state, and verify that the reset completed before each attempt.
- Do not call production services, send real notifications, charge accounts, or persist external side effects.
- Keep the reproduction patch separate from any proposed fix, and stop if the working tree contains an unreviewed behavior change.

## Human approval gates

- **Accepting clarified expected behavior before encoding a regression test** requires the product owner to approve the exact observable contract, the affected version, and the evidence source.
- Moving from the reported user-facing boundary to a lower-level seam requires the repository maintainer to approve the recorded coverage loss and the future end-to-end follow-up.
- Introducing any externally billed or destructive test dependency requires the service owner to approve the isolated substitute, the cost bound, the cleanup, and the abort condition.

## Expected output

Produce one repository-bound Markdown reproduction record containing:

1. The reproduction status, the immutable revision, and the environment, including explicit setup dependencies.
2. The approved expected behavior and the exact observed behavior.
3. The minimal sanitized fixture and the clean-state setup.
4. The exact command or interaction steps, with per-attempt results.
5. The minimization experiment and the recurrence classification.
6. A behavior-specific failing regression test at a named path, with the relevant code, the supported tool version, the command, and evidence of the intended assertion.
7. A repeatability, boundary, and residual-uncertainty record covering safety, assumptions, and limitations.
8. The handoff recommendation and evidence traceability.

Label facts, trigger hypotheses, experiments, results, diagnostic exclusions, recommendations, and validation separately.
Do not include a product fix in this artifact.

## Completion criteria

- A reviewer with access to the referenced source revision can recreate the affected environment and run the reproduction without undocumented prerequisites.
- The retained fixture is sanitized, and every field or setup step still in it is relevant to the targeted behavior.
- The recurrence classification rests on a predeclared clean-state sample with per-attempt results.
- The regression test fails on the affected revision at the intended behavior assertion, not during setup.
- The expected result cites an applicable contract or an approved product decision.
- The artifact states its boundary, the lost coverage, the excluded causal diagnosis, the safety record, and the residual uncertainty.
- No behavior fix is present in the reproduction change.

## Failure modes

- **F1:** The expected behavior is undefined, contradictory, or does not apply to the affected version.
- **F2:** The failure depends on sensitive or inaccessible data that cannot be represented safely.
- **F3:** Clean attempts produce inconsistent outcomes.
- **F4:** The regression test fails before reaching the targeted assertion, or passes on the affected revision.

## Recovery procedure

- **R1:** List the conflicting expectations, obtain a product-owner disposition backed by the applicable contract evidence, and restart at behavior definition.
- **R2:** Build a synthetic fixture that preserves only the required shape, validate the failure against it, and resume at minimization only if no sensitive value remains.
- **R3:** Grow the sample to a larger predeclared bound, record the recurrence and any environmental correlations, and deliver an intermittent reproduction with the observed rate.
- **R4:** Repair the setup, or pick a boundary that actually exercises the behavior, then rerun on the unchanged affected revision until the intended assertion is the failing point.

## Example

The [complete synthetic input](#complete-example-input) supplies an approved HTTP contract, an immutable environment, a minimized request, three clean attempts, and an executed failing regression test.
The [complete expected output](#complete-expected-output) packages those facts into a repository-bound record without claiming a causal diagnosis or a fix.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/reproduce-bug/1.0.0",
  "title": "Bug reproduction output contract",
  "description": "Validates the disputed behavior, minimized trigger, clean-state protocol, retained regression test, diagnostic boundary, safety, uncertainty, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "bug-reproduction-record.md",
        "audience": "Repository maintainers and bug investigators",
        "requires_title": true,
        "required_headings": [
          "Reproduction status",
          "Facts",
          "Trigger hypothesis and minimization experiment",
          "Clean-state reproduction protocol",
          "Retained regression test",
          "Diagnostic boundary and recommendation",
          "Validation and safety",
          "Boundary and residual uncertainty",
          "Traceability"
        ],
        "required_literals": ["| Control | Result | Evidence |", "| Material claim | Evidence |"],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This example is synthetic and self-contained as an editorial evidence package.
No issue tracker, customer account, or external service is required to produce the expected output.
The resulting reproduction remains bound to the fictional project checkout and locked dependencies named below; it is not a standalone source distribution.

## Objective

Create a minimal reproduction and failing regression test for the empty-display-name response without diagnosing or changing the handler.

## Scope and constraints

- The reproduction may change only `test/profile.spec.ts`.
- The target boundary is the in-memory HTTP application used by existing API tests.
- No production credential, customer data, network service, or persistent database is permitted.
- Root-cause analysis and product code changes are outside scope.
- Results may be called executed only when an evidence item includes the command and observed status.

## Evidence inventory

### E1 - Approved behavior contract

- Contract version: Profile API `1.8`.
- For `POST /profile`, a JSON string field `displayName` must contain at least one non-whitespace character.
- An empty string returns HTTP `422` with JSON `{ "field": "displayName", "code": "required" }`.
- The synthetic product owner confirms that this contract applies to affected commit `f400000000000000000000000000000000000000`.
- Establishes the expected behavior and its approval.

### E2 - Immutable affected environment

- Commit: `f400000000000000000000000000000000000000`.
- Operating system: Linux x64.
- Runtime: Node.js `22.11.0`.
- Test runner: Vitest `2.1.9`, resolved by the committed lockfile.
- Dependency installation: `pnpm install --frozen-lockfile` from the committed lockfile.
- Database: disposable SQLite `3.46.1` file created empty for every attempt.
- Feature flags: none.
- Establishes the affected revision and reproducible environment.

### E3 - Test boundary and invocation

- Existing helper: `createTestApp({ databasePath })` starts the application in memory.
- Existing request seam: `app.request(path, options)` returns a standard `Response`.
- Reproduction command: `pnpm exec vitest run test/profile.spec.ts`.
- No browser, reverse proxy, network listener, or external service participates.
- Establishes the closest authorized controllable boundary and its limitation.

### E4 - Sanitized trigger and minimization experiment

- Original synthetic report payload: `{ "displayName": "", "timezone": "UTC" }`.
- Removing `timezone` preserves the HTTP `500` response.
- Minimal retained payload: `{ "displayName": "" }`.
- Changing the retained value to `{ "displayName": "Ada" }` returns HTTP `201`, so the empty value remains the trigger under test.
- The payload contains no credential, personal data, or unrelated field.
- Establishes the minimal sanitized trigger and the minimization result.

### E5 - Three clean reproduction attempts

| Attempt | State reset | Request | Observed response |
| --- | --- | --- | --- |
| 1 | New empty SQLite file | `POST /profile` with E4 payload | HTTP `500`, `{ "code": "internal_error" }` |
| 2 | New empty SQLite file | `POST /profile` with E4 payload | HTTP `500`, `{ "code": "internal_error" }` |
| 3 | New empty SQLite file | `POST /profile` with E4 payload | HTTP `500`, `{ "code": "internal_error" }` |

- The attempt count was fixed at three before execution.
- Establishes a 3-of-3 clean-state recurrence at the HTTP boundary.

### E6 - Failing regression test and execution

- Target path: `test/profile.spec.ts`.
- The following test was added without changing production code.

```ts
it("returns the required-field error for an empty display name", async () => {
  const databasePath = await createEmptyDatabase();
  const app = await createTestApp({ databasePath });

  const response = await app.request("/profile", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ displayName: "" }),
  });

  expect(response.status).toBe(422);
  await expect(response.json()).resolves.toEqual({
    field: "displayName",
    code: "required",
  });
});
```

- `pnpm exec vitest run test/profile.spec.ts` was executed with Vitest 2.1.9 on E2 after adding only this test.
- The setup completed, the request returned, and the test failed at `expect(response.status).toBe(422)` with received value `500`.
- No subsequent response-body assertion ran.
- Establishes the named failing test and its behavior-specific assertion failure.

### E7 - Working-tree and safety record

- `git diff --name-only` contains only `test/profile.spec.ts`.
- A new empty SQLite file is created for each run and deleted after the test process.
- No external request, production database, production credential, message, or notification is used.
- Establishes isolation, cleanup, and absence of a product fix.

### E8 - Known limits and unavailable evidence

- No browser, reverse proxy, deployed runtime, server log, stack trace, or handler-level experiment is provided.
- No known-good revision is provided.
- The evidence supports reproduction at the in-memory HTTP boundary but cannot establish a root cause, regression range, or deployed impact.
- Establishes the required residual uncertainty.

## Complete expected output

## Reproduction status

Status: consistently reproduced in the bounded sample at the supplied in-memory HTTP boundary.

The affected revision is `f400000000000000000000000000000000000000` on Linux x64 with Node.js 22.11.0, Vitest 2.1.9 from the committed pnpm lockfile, and disposable SQLite 3.46.1 state [E2].
The defect recurred in three of three predeclared clean attempts [E5].
This 3-of-3 result establishes the observed bounded recurrence only; it does not prove that every future attempt will reproduce the defect.

## Facts

- Profile API 1.8 requires an empty `displayName` to return HTTP 422 with field `displayName` and code `required` [E1].
- The minimal request `{ "displayName": "" }` returns HTTP 500 with `{ "code": "internal_error" }` in all three recorded attempts [E4, E5].
- The regression test reaches the HTTP response and fails at the status assertion with expected 422 and received 500 [E6].
- Only the test file changed, and each attempt uses a new disposable database without an external service [E7].

## Trigger hypothesis and minimization experiment

Hypothesis: the empty string value is sufficient to trigger the observed response at the supplied HTTP boundary.

The original synthetic payload included an unrelated `timezone` field.
Removing that field preserved the HTTP 500 response, while changing `displayName` from an empty string to `Ada` produced HTTP 201 [E4].

Result: `{ "displayName": "" }` is the smallest supplied payload that preserves the targeted empty-string condition.
This experiment identifies a trigger, not a technical root cause.

## Clean-state reproduction protocol

1. Check out `f400000000000000000000000000000000000000`.
2. Use Linux x64, Node.js 22.11.0, and `pnpm install --frozen-lockfile` [E2].
3. Create a new empty SQLite 3.46.1 file and pass its path to `createTestApp` [E2, E3].
4. Send `POST /profile` with JSON `{ "displayName": "" }` through `app.request` [E3, E4].
5. Record the response, delete the disposable database, and recreate it before the next attempt [E5, E7].

Expected result: HTTP 422 with `{ "field": "displayName", "code": "required" }` [E1].
Observed result: HTTP 500 with `{ "code": "internal_error" }` in attempts 1, 2, and 3 [E5].

## Retained regression test

Target: `test/profile.spec.ts`.

```ts
it("returns the required-field error for an empty display name", async () => {
  const databasePath = await createEmptyDatabase();
  const app = await createTestApp({ databasePath });

  const response = await app.request("/profile", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ displayName: "" }),
  });

  expect(response.status).toBe(422);
  await expect(response.json()).resolves.toEqual({
    field: "displayName",
    code: "required",
  });
});
```

Command: `pnpm exec vitest run test/profile.spec.ts` with Vitest 2.1.9 from the locked dependency tree [E2, E3].

Recorded result: failed at the status assertion with expected `422` and received `500`; setup and request execution completed before that assertion [E6].
The test contains the minimal fixture from E4 and no production-code change [E6, E7].

## Diagnostic boundary and recommendation

Causal diagnosis is outside this workflow and is not established by the retained trigger or failing assertion.
No stack trace, handler experiment, or source-level causal evidence is included [E8].

Recommendation: retain this failing test on a diagnostic branch and hand E1 through E8 to the bug-diagnosis workflow.
Any future fix should make this same test pass without weakening the Profile API 1.8 contract.

## Validation and safety

| Control | Result | Evidence |
| --- | --- | --- |
| Applicable expected behavior | Approved for the affected commit | E1 |
| Immutable environment | Identified to the supplied revision, architecture, runtime, test-runner, database, lockfile, and feature-flag boundary | E2 |
| Minimal sanitized payload | `displayName` only; no sensitive value | E4 |
| Clean repeatability | 3 failures in 3 attempts | E5 |
| Intended assertion reached | Status assertion failed after request completed | E6 |
| Product code unchanged | Only `test/profile.spec.ts` changed | E7 |
| Production isolation | No production data, credential, or external request | E7 |

## Boundary and residual uncertainty

The reproduction stops at the in-memory HTTP application.
It does not establish browser, reverse-proxy, network-listener, or deployed-runtime behavior [E3, E8].
The supplied environment record does not identify a Linux distribution, kernel, or pnpm version, so reproduction claims remain bounded to the recorded fields [E2].
It does not identify a known-good revision, regression range, technical cause, or deployed frequency [E8].
It also requires access to the fictional project checkout and locked dependency tree named in E2; the record does not embed those sources.

## Traceability

| Material claim | Evidence |
| --- | --- |
| Expected 422 contract and approval | E1 |
| Affected revision and environment | E2 |
| In-memory HTTP boundary and command | E3 |
| Minimal trigger and minimization result | E4 |
| Three clean observed responses | E5 |
| Failing test path, code, command, and assertion | E6 |
| Working-tree scope and isolation | E7 |
| Diagnostic and boundary limitations | E2, E8 |
