# Repository-bound reproduction record: empty display name returns an internal error

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
