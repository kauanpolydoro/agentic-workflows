# Rate-limiter regression test delivery

## Status and scope

Status: implemented and validated for the supplied synthetic revision.

The retained change is limited to `test/rate-limiter.test.ts` on target revision `aa11000000000000000000000000000000000000` [E2, E8].
It protects the approved three-request limit and exact 60,000-millisecond reset boundary without changing production code [E1, E5, E8].

## Facts and risk analysis

The pre-change focused file had one happy-path case and did not exercise either boundary [E3].
The two selected risks are behaviorally distinct: an off-by-one limit can accept a fourth request, while a strict-greater-than reset can reject the first request at the exact boundary [E4].

| Behavior | Regression risk | Test level and seam | Existing coverage | Evidence |
| --- | --- | --- | --- | --- |
| Reject request four after three accepts | Limit off by one | Unit test through public `allow` | None | E1, E2, E4 |
| Accept at exactly 60,000 ms | Reset comparison off by one | Unit test through public `allow` with injected clock | None | E1, E2, E4 |

The unit seam is sufficient because both behaviors are pure in-memory outcomes and time is already an injected public dependency [E2].

## Implemented test change

Target: `test/rate-limiter.test.ts`.

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

This is the retained implementation recorded in E5.
It uses no mock of `RateLimiter`, wall-clock wait, private call assertion, or shared state [E2, E5, E8].

## Mutation experiments and results

| Test | Temporary mutation | Predicted failure | Observed result | Restoration |
| --- | --- | --- | --- | --- |
| Rejects request four | Make request four return `true` | Final `toBe(false)` assertion fails | Focused run exited `1` at that assertion | Restored |
| Resets at exact boundary | Change reset comparison from `>=` to `>` | Exact-boundary `toBe(true)` assertion fails | Focused run exited `1` at that assertion | Restored |

Both predictions were observed, and neither run failed during setup or an unrelated assertion [E7].
After restoration, the focused command exited `0` and the production-source diff was empty [E7].

## Validation record

| Command | State | Result | Evidence |
| --- | --- | --- | --- |
| `pnpm vitest run test/rate-limiter.test.ts` | Immutable pre-change baseline | Exit `0`, 1 test | E3 |
| `pnpm vitest run test/rate-limiter.test.ts` | Retained test change | Exit `0`, 3 tests | E6 |
| Same focused command, five repetitions | Retained test change | Five exit-0 runs | E6 |
| Focused command under mutation M1 | Temporary limit defect | Exit `1` at intended assertion | E7 |
| Focused command under mutation M2 | Temporary reset defect | Exit `1` at intended assertion | E7 |
| `pnpm test` | Restored implementation and retained tests | Exit `0`, 28 tests | E8 |

The final working tree contains only `test/rate-limiter.test.ts` and no temporary mutation [E8].

## Recommendation and approval record

Recommendation: merge the two test cases with the named test-file change because each maps to approved behavior, detects a distinct demonstrated mutation, and passes the focused and project suites.
The repository maintainer approved the E1 behavior boundary [E9].
No destructive or billed setup exists, so the service-owner gate is not applicable [E9].

## Assumptions, exclusions, and residual risk

The evidence does not define per-client isolation, concurrency, persistence, or performance behavior, so no assertion for those areas was added [E9].
Five repeated focused runs reduce but do not eliminate the possibility of future environment-specific flakiness [E6].
Targeted mutations establish sensitivity to the two named regressions, not to every possible limiter defect.

## Traceability

| Material claim or decision | Evidence |
| --- | --- |
| Approved limit and reset semantics | E1 |
| Stable public API and injected clock seam | E2 |
| Immutable test baseline | E3 |
| Distinct off-by-one risks | E4 |
| Exact retained test content | E5 |
| Focused pass and recurrence sample | E6 |
| Intended mutation failures and restoration | E7 |
| Project suite, final scope, and isolation | E8 |
| Approval boundary and excluded behaviors | E9 |
