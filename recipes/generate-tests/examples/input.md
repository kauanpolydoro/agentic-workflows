# Synthetic rate-limiter test evidence package

This example is synthetic and self-contained.
No external repository, service, or issue is required to produce the expected output.

## Objective

Add deterministic regression tests for the request limit and exact reset boundary, then prove that each test detects its named behavior-breaking mutation.

## Scope and constraints

- Target revision: `aa11000000000000000000000000000000000000`.
- Only `test/rate-limiter.test.ts` may remain changed.
- `src/rate-limiter.ts` may be mutated temporarily for sensitivity checks but must be restored.
- Wall-clock waits, unseeded randomness, shared state, and external network calls are forbidden.
- Concurrency, persistence, and per-client isolation are outside scope because no supplied contract defines them.

## Evidence inventory

### E1 - Approved public behavior contract

- API: `allow(clientId: string): boolean`.
- A limiter configured with limit `3` and window `60_000` milliseconds accepts calls one, two, and three in one window.
- Call four in the same window is rejected.
- At elapsed time exactly `60_000` milliseconds from the window start, the next call begins a new window and is accepted.
- The synthetic repository maintainer confirms these behaviors for the target revision.
- Establishes every expected assertion in scope.

### E2 - Public seam and deterministic dependency

- Source path: `src/rate-limiter.ts`.
- Test path: `test/rate-limiter.test.ts`.
- Constructor: `new RateLimiter(limit: number, windowMs: number, clock: Clock)`.
- Public method: `allow(clientId: string): boolean`.
- `Clock` exposes `now(): number` in integer milliseconds.
- The repository test style uses Vitest, direct construction, and `expect` without mocking the `RateLimiter` instance.
- Establishes the public seam, framework, and controllable time dependency.

### E3 - Immutable baseline

- Environment: Linux x64, Node.js 22.11.0, pnpm 10.1.0, frozen committed lockfile.
- `pnpm vitest run test/rate-limiter.test.ts` exited `0` with one existing happy-path test on `aa11000000000000000000000000000000000000`.
- `pnpm test` exited `0` with `26` tests on the same revision.
- The existing case accepts one request and does not exercise the limit or reset boundary.
- Establishes the pre-change suite and coverage gap.

### E4 - Ranked regression risks

| Risk | Plausible defect | Impact | Existing detection |
| --- | --- | --- | --- |
| Limit off by one | Use `count <= limit` when deciding an additional request | A fourth request is accepted | None |
| Reset boundary off by one | Use `elapsed > windowMs` instead of `elapsed >= windowMs` | A request at the exact boundary is rejected | None |

- A prior synthetic defect record identifies the strict-greater-than reset comparison as previously observed.
- Establishes why the two cases are distinct and prioritized.

### E5 - Implemented test change

- The following content was added to `test/rate-limiter.test.ts`.

```ts
class FakeClock {
  nowMs = 0;

  now(): number {
    return this.nowMs;
  }
}

it("accepts three requests and rejects the fourth in one window", () => {
  const clock = new FakeClock();
  const limiter = new RateLimiter(3, 60_000, clock);

  expect([1, 2, 3].map(() => limiter.allow("client-a"))).toEqual([
    true,
    true,
    true,
  ]);
  expect(limiter.allow("client-a")).toBe(false);
});

it("starts a new window at the exact reset boundary", () => {
  const clock = new FakeClock();
  const limiter = new RateLimiter(3, 60_000, clock);

  [1, 2, 3].forEach(() => limiter.allow("client-a"));
  clock.nowMs = 60_000;

  expect(limiter.allow("client-a")).toBe(true);
});
```

- The existing import already includes `RateLimiter` and Vitest's `expect` and `it`.
- Establishes the exact retained test implementation.

### E6 - Focused validation after implementation

- `pnpm vitest run test/rate-limiter.test.ts` was executed after E5 on Linux x64 with Node.js 22.11.0.
- Result: exit `0`, one existing case and two new cases passed.
- Repeating the same focused command five times produced five exit-0 runs.
- Establishes focused correctness and bounded recurrence without wall-clock waiting.

### E7 - Targeted mutation challenges

- Mutation M1 temporarily changed the request-limit decision so the fourth request returned `true`.
- The focused command exited `1` only at `expect(limiter.allow("client-a")).toBe(false)` in the first new case.
- Mutation M1 was restored.
- Mutation M2 temporarily changed the reset comparison from `>=` to `>`.
- The focused command exited `1` only at the exact-boundary `toBe(true)` assertion in the second new case.
- Mutation M2 was restored.
- After restoration, the focused command exited `0` and `git diff -- src/rate-limiter.ts` was empty.
- Establishes that each case detects its intended plausible regression and that no mutation remains.

### E8 - Project validation and final scope

- `pnpm test` was executed after mutation restoration and exited `0` with `28` tests.
- `git diff --name-only` listed only `test/rate-limiter.test.ts`.
- No network, filesystem, database, process, random, or real-time dependency appears in either new case.
- Establishes broader-suite success, final scope, and fixture isolation.

### E9 - Approval and excluded behavior

- The repository maintainer approved only the E1 behavior.
- Per-client isolation, concurrency, persistence, and performance remain unspecified and were not encoded.
- No destructive or externally billed setup was proposed, so that approval gate was not applicable.
- Establishes the approval boundary and intentional exclusions.
