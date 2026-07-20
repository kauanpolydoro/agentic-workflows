# Synthetic profile API defect evidence package

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
