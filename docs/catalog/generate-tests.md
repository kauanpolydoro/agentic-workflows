---
title: "Add behavior-focused regression tests"
description: "Implement risk-ranked tests at observable boundaries and prove that each test detects its intended regression without coupling to private implementation."
---

# Add behavior-focused regression tests

## Objective

Transform an attributable behavior contract and ranked regression risks into implemented tests, a risk-to-test matrix, and a validation record.
The primary quality constraint is that each test proves observable behavior and demonstrably fails when that behavior is broken, without coupling to private implementation details.

## When to use

- A documented public behavior or boundary condition lacks regression protection.
- A fixed defect has an approved expected result but no cause-specific retained test.
- Existing coverage reaches lines without exercising important outcomes, errors, or state transitions.
- A risky change needs deterministic tests at a stable public seam before merge.

## When not to use

- Expected behavior cannot be established from a contract, current callers, existing tests, or an authorized maintainer decision.
- The actual task is to reproduce or diagnose an unknown failure whose correct outcome remains unsettled.
- Required mutable state, time, randomness, network calls, or external effects cannot be isolated safely.
- The only proposed assertion observes a private call sequence with no contractual value.

## Required inputs

- **Attributable behavior contract:** List named inputs, outputs, invariants, boundary values, state transitions, and errors with a source such as an API specification, accepted bug report, existing test, or maintainer approval.
  This prevents assumptions from becoming permanent behavior.
  Validate that the source applies to the immutable target revision and resolve contradictions before design.
- **Target paths and public test seam:** Record source and test paths, exported API or user boundary, framework, fixture conventions, and controllable dependencies such as clocks or storage.
  This determines the appropriate test level.
  Validate that each path and symbol exists at the target revision and that the seam observes the named behavior.
- **Commands and immutable baseline:** Provide exact focused and required project commands, environment, target commit, exit codes, and retained output before changes.
  This distinguishes pre-existing failures from regressions introduced by the tests.
  Validate the baseline in a clean checkout or label supplied results as not independently rerun.
- **Ranked regression risks and coverage inventory:** Describe plausible behavior-breaking changes, their impact, and existing cases that already cover them.
  This prevents duplicate tests and metric-only work.
  Validate each risk against a contract boundary, defect record, or observed uncovered branch.

## Optional inputs

- A coverage report tied to the target commit can reveal unexercised code, but line percentage never establishes test value.
- Incident and defect history can raise priority for failure shapes that have occurred before.
- Mutation-test output can provide a wider adequacy signal after the targeted manual challenges pass.
- Test runtime budgets can constrain fixture level and suite placement.

## Preconditions

- Every behavior to be encoded has an attributable source or explicit repository-maintainer approval.
- The focused test runner completes on the immutable target revision and its baseline failures are recorded.
- Time, randomness, storage, network, and process state used by the target can be controlled or isolated.
- The target seam can observe outcomes without mocking the unit under test.
- The working tree has no unrelated production change that would invalidate the baseline.

## Workflow

### 1. Build the behavior inventory

Translate each contract statement into an observable given-when-then row and cite its source.
List invalid, boundary, state-transition, and recovery behavior separately.
Advance when every proposed expected value is attributable.
Stop when a disputed behavior lacks an owner decision.

### 2. Rank regression risks

For each behavior, identify one plausible implementation defect, user impact, likelihood evidence, and current coverage.
Prioritize cases that cross a boundary, protect a previous defect, or prevent irreversible state damage.
Advance when each selected case has a distinct risk that existing tests do not already detect.
Stop if the only rationale is increasing a coverage percentage.

### 3. Choose the test level and seam

Select unit, integration, contract, CLI, or end-to-end coverage according to the collaborators and state involved in the risk.
Record what the selected seam exercises and what it deliberately excludes.
Advance when the test reaches the public behavior with controllable dependencies.
Stop if it observes only a private method or mocked behavior.

### 4. Design deterministic fixtures

Use repository fixture conventions and explicit seams for clocks, randomness, files, databases, and network boundaries.
Define setup, cleanup, unique identifiers, and expected resource lifetime.
Advance when repeated tests can start from the same state without wall-clock waits or shared accounts.
Stop if a fixture can leak state, expose secrets, or contact production.

### 5. Implement one behavior case at a time

Add a clearly named case at a named path using arrange-act-assert structure or the repository equivalent.
Assert public outcomes, durable state, documented errors, or emitted contract events rather than private calls.
Run the focused file after each case and retain failures separately from the baseline.
Advance when the case passes against the intended implementation.
Stop if production behavior must change merely to satisfy an unsupported expectation.

### 6. Prove regression sensitivity

For each new case, introduce one temporary local mutation that breaks only the targeted behavior.
Run the focused command, confirm the intended assertion fails, restore the implementation, and verify the working tree contains no mutation.
Advance when every selected case detects its named mutation.
Stop if a test stays green or fails for a different reason.

### 7. Validate isolation and suite behavior

Repeat focused tests, run the required project suite, and use the repository's flake-detection convention when state or timing is involved.
Record commands, environment, target revision, exit codes, counts, duration where relevant, and retained output paths.
Advance when new and existing checks pass without uncontrolled time, randomness, network, or shared state.
Stop if the broader suite exposes a conflict that the focused run hid.

### 8. Deliver the test record

Provide the risk-to-test matrix, named files and test excerpts, baseline, mutation results, focused and project results, assumptions, exclusions, approvals, and evidence traceability.
Mark any unexecuted command as proposed.
The delivery is complete only when each completion criterion can be reviewed directly from the record.

## Decision points

- If expected behavior is ambiguous or contradictory, stop and obtain a repository-maintainer decision before encoding it.
- If the risk is a pure invariant with no collaborator or persistent state, use a unit test at the exported seam.
- If the risk depends on orchestration across real collaborators, use an integration or contract test at their stable boundary.
- If only a browser, process, or network boundary exposes the user-visible failure, keep an end-to-end test and isolate its external state.
- If a proposed case duplicates an existing behavior and mutation sensitivity, remove the duplicate and strengthen the existing case if necessary.
- If a test passes after its targeted behavior is mutated, reject the assertion and redesign it around the observable outcome.
- If the project suite fails outside the changed test file, compare the failure with the immutable baseline before attributing it to the test change.

## Safety guardrails

- Never perform **mocking the unit under test** because it can make the test validate a substitute rather than behavior.
- Never perform **asserting private call order without contractual value** or expose production internals solely for a test.
- Never perform **inflating coverage with duplicate cases** that do not protect a distinct behavior or risk.
- Do not use uncontrolled wall-clock waits, unseeded randomness, shared user accounts, production services, or persistent cross-test state.
- Do not alter production behavior merely to make an unsupported assertion pass.
- Use disposable fixtures and explicit cleanup for files, databases, queues, and processes.
- Stop if fixture output can disclose credentials, customer data, or sensitive production payloads.

## Human approval gates

- Before **encoding behavior not established by the supplied contract**, the repository maintainer approves the exact expected outcome, affected public boundary, source evidence, and compatibility impact.
- Before **adding destructive or externally billed test setup**, the service owner approves isolation, maximum cost, cleanup, abort conditions, and proof that production cannot be reached.
- Before changing a public seam only to make testing possible, the API owner approves the public-contract impact and migration evidence.

## Expected output

Produce one Markdown test delivery record containing:

1. Immutable scope, baseline, and behavior sources.
2. Risk-to-test traceability matrix.
3. Test-level and fixture decisions with exclusions.
4. Implemented test changes at named paths, including relevant code or diff.
5. Per-test mutation challenge, intended failure, restoration check, and result.
6. Focused and required project command results with exit codes.
7. Safety, approvals, assumptions, limitations, and residual risks.
8. Evidence traceability for every material behavior and result claim.

Distinguish supplied baseline, work executed during the example, and proposed future checks.
Do not present a plan as a completed test delivery.

## Completion criteria

- Every new test maps to one attributable behavior and one distinct plausible regression.
- Every new test fails at its intended assertion under the recorded targeted mutation and passes after restoration.
- Tests observe public outcomes and do not depend on private call order or a mock of the unit under test.
- Focused and required project checks pass on the changed revision with commands and exit codes retained.
- Time, randomness, storage, network, and shared state are deterministic or explicitly isolated.
- The final working tree contains the intended test changes and no temporary mutation.
- Every material statement in the delivery maps to evidence.

## Failure modes

- **F1:** Behavior sources are incomplete, contradictory, or inapplicable to the target revision.
- **F2:** Required state or an external dependency cannot be isolated deterministically.
- **F3:** A new test stays green under its targeted behavior-breaking mutation or fails at an unrelated point.
- **F4:** Focused tests pass but the required project suite reveals a new conflict or flake.

## Recovery procedure

- **R1:** Enumerate the conflicting expectations, obtain an attributable repository-maintainer disposition, and restart the behavior inventory.
- **R2:** Introduce an approved public dependency seam or disposable fixture, verify cleanup and production isolation, and restart fixture design.
- **R3:** Rewrite the assertion around the observable outcome, rerun the targeted mutation, and proceed only when the intended assertion detects it.
- **R4:** Compare the suite failure with the immutable baseline, isolate order or shared-state dependence, correct the fixture, and rerun focused and project checks.

## Example

The [complete synthetic input](#complete-example-input) supplies a rate-limiter contract, deterministic clock seam, baseline, implemented cases, mutation results, and suite results.
The [complete expected output](#complete-expected-output) is a finished test delivery rather than an unexecuted proposal.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/generate-tests/1.0.0",
  "title": "Test generation output contract",
  "description": "Validates the implemented test change, risk mapping, mutation evidence, validation record, approval state, residual risk, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "test-delivery-record.md",
        "audience": "Repository maintainers and test reviewers",
        "requires_title": true,
        "required_headings": [
          "Status and scope",
          "Facts and risk analysis",
          "Implemented test change",
          "Mutation experiments and results",
          "Validation record",
          "Recommendation and approval record",
          "Assumptions, exclusions, and residual risk",
          "Traceability"
        ],
        "required_literals": [
          "| Behavior | Regression risk | Test level and seam | Existing coverage | Evidence |",
          "| Test | Temporary mutation | Predicted failure | Observed result | Restoration |",
          "| Command | State | Result | Evidence |",
          "| Material claim or decision | Evidence |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

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

## Complete expected output

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
