---
title: "Add behavior-focused regression tests"
description: "Write regression tests at observable boundaries for the highest-risk behaviors, then prove each test fails when its target behavior breaks, without coupling to private implementation."
---

# Add behavior-focused regression tests

## Objective

Take a behavior contract with attributable sources and a ranked set of regression risks, and turn them into three deliverables: implemented tests, a risk-to-test matrix, and a validation record.
One quality constraint governs everything here: each test must prove observable behavior and demonstrably fail when that behavior is broken, without coupling to private implementation details.

## When to use

- A documented public behavior or boundary condition has no regression test protecting it.
- A defect was fixed and its expected result approved, but no retained test targets that specific cause.
- Existing coverage reaches the lines without exercising the outcomes, errors, or state transitions that matter.
- A risky change needs deterministic tests at a stable public seam before it merges.

## When not to use

- You cannot establish the expected behavior from a contract, current callers, existing tests, or an authorized maintainer decision.
- The real task is reproducing or diagnosing an unknown failure whose correct outcome is still unsettled.
- The mutable state, time, randomness, network calls, or external effects involved cannot be isolated safely.
- The only assertion you can propose observes a private call sequence with no contractual value.

## Required inputs

- **Attributable behavior contract:** List the named inputs, outputs, invariants, boundary values, state transitions, and errors, each backed by a source such as an API specification, an accepted bug report, an existing test, or a maintainer approval.
  Without this, assumptions quietly harden into permanent behavior.
  Check that every source applies to the immutable target revision, and resolve any contradictions before you design a single test.
- **Target paths and public test seam:** Record the source and test paths, the exported API or user boundary, the framework, the fixture conventions, and the controllable deterministic dependencies such as clocks or storage.
  This is what determines the right test level.
  Confirm that each path and symbol exists at the target revision, and that the seam actually observes the named behavior.
- **Commands and immutable baseline:** Provide the exact focused and required project commands, the environment, the target commit, the exit codes, and the retained output from before any changes.
  This is how you separate pre-existing failures from regressions the new tests introduce.
  Validate the baseline in a clean checkout, or label the supplied results as not independently rerun.
- **Ranked regression risks and coverage inventory:** Describe the plausible behavior-breaking changes, the impact of each, and the existing cases that already cover them.
  This keeps duplicate tests and metric-only work out of the plan.
  Validate each risk against a contract boundary, a defect record, or an observed uncovered branch.

## Optional inputs

- A coverage report tied to the target commit can point out unexercised code, but a line percentage never establishes the value of a test.
- Incident and defect history can raise the priority of failure shapes that have occurred before.
- Mutation-test output can add a wider adequacy signal once the targeted manual challenges pass.
- A test runtime budget can constrain the fixture level and where the tests sit in the suite.

## Preconditions

- Every behavior you intend to encode has an attributable source or explicit approval from a repository maintainer.
- The focused test runner completes on the immutable target revision, and its baseline failures are recorded.
- The time, randomness, storage, network, and process state the target uses can be controlled or isolated.
- The target seam lets you observe outcomes without mocking the unit under test.
- The working tree carries no unrelated production change that would invalidate the baseline.

## Workflow

### 1. Build the behavior inventory

Turn each contract statement into an observable given-when-then row, and cite its source.
List invalid, boundary, state-transition, and recovery behaviors as separate rows.
Advance once every proposed expected value is attributable.
Stop when a disputed behavior lacks an owner decision.

### 2. Rank regression risks

For each behavior, name one plausible implementation defect, the user impact, the evidence for its likelihood, and what currently covers it.
Give priority to cases that cross a boundary, protect a previously fixed defect, or prevent irreversible state damage.
Advance once each selected case carries a distinct risk that existing tests do not already detect.
Stop if the only rationale on the table is raising a coverage percentage.

### 3. Choose the test level and seam

Pick unit, integration, contract, CLI, or end-to-end coverage based on the collaborators and state the risk involves.
Write down what the chosen seam exercises and what it deliberately leaves out.
Advance once the test reaches the public behavior with controllable dependencies.
Stop if it can only observe a private method or mocked behavior.

### 4. Design deterministic fixtures

Follow the repository's fixture conventions, and use explicit seams for clocks, randomness, files, databases, and network boundaries.
Define the setup, the cleanup, unique identifiers, and how long each resource is expected to live.
Advance once repeated runs can start from the same state without wall-clock waits or shared accounts.
Stop if a fixture could leak state, expose secrets, or contact production.

### 5. Implement one behavior case at a time

Add each case under a clear name at a named path, using arrange-act-assert structure or the repository's equivalent.
Assert on public outcomes, durable state, documented errors, or emitted contract events, rather than on private calls.
Run the focused file after each case, and keep any failures recorded separately from the baseline.
Advance once the case passes against the intended implementation.
Stop if production behavior would have to change just to satisfy an unsupported expectation.

### 6. Prove regression sensitivity

For each new case, introduce one temporary local mutation that breaks only the behavior it targets.
Run the focused command, confirm the intended assertion fails, restore the implementation, and verify the working tree holds no leftover mutation.
Advance once every selected case detects its named mutation.
Stop if a test stays green, or if it fails for a different reason than the one intended.

### 7. Validate isolation and suite behavior

Repeat the focused tests, run the required project suite, and apply the repository's flake-detection convention whenever state or timing is involved.
Record the commands, environment, target revision, exit codes, counts, duration where relevant, and the paths to retained output.
Advance once new and existing checks pass with no uncontrolled time, randomness, network, or shared state.
Stop if the broader suite exposes a conflict the focused run had hidden.

### 8. Deliver the test record

Hand over the risk-to-test matrix, the named files with test excerpts, the baseline, the mutation results, the focused and project results, plus assumptions, exclusions, approvals, and evidence traceability.
Mark any command that was not executed as proposed.
The delivery is complete only when a reviewer can check each completion criterion directly from the record.

## Decision points

- If expected behavior is ambiguous or contradictory, stop and obtain a repository-maintainer decision before encoding it.
- If the risk is a pure invariant with no collaborator or persistent state, write a unit test at the exported seam.
- If the risk depends on orchestration across real collaborators, write an integration or contract test at their stable boundary.
- If only a browser, process, or network boundary exposes the user-visible failure, keep an end-to-end test and isolate its external state.
- If a proposed case duplicates an existing behavior and its mutation sensitivity, remove the duplicate and strengthen the existing case if necessary.
- If a test still passes after its targeted behavior is mutated, reject the assertion and redesign it around the observable outcome.
- If the project suite fails outside the changed test file, compare that failure with the immutable baseline before attributing it to the test change.

## Safety guardrails

- Never resort to **mocking the unit under test**, because it can make the test validate a substitute rather than the behavior.
- Never rely on **asserting private call order without contractual value**, and never expose production internals solely for a test.
- Never pad the numbers by **inflating coverage with duplicate cases** that protect no distinct behavior or risk.
- Do not use uncontrolled wall-clock waits, unseeded randomness, shared user accounts, production services, or state that persists across tests.
- Do not alter production behavior merely to make an unsupported assertion pass.
- Give files, databases, queues, and processes disposable fixtures and explicit cleanup.
- Stop if fixture output can disclose credentials, customer data, or sensitive production payloads.

## Human approval gates

- Before **encoding behavior not established by the supplied contract**, the repository maintainer approves the exact expected outcome, the affected public boundary, the source evidence, and the compatibility impact.
- Before **adding destructive or externally billed test setup**, the service owner approves the isolation, the maximum cost, the cleanup, the abort conditions, and proof that production cannot be reached.
- Before changing a public seam only to make testing possible, the API owner approves the public-contract impact and the migration evidence.

## Expected output

Produce one Markdown test delivery record that contains:

1. The immutable scope, the baseline, and the behavior sources.
2. The risk-to-test traceability matrix.
3. The test-level and fixture decisions, including exclusions.
4. The implemented test changes at named paths, with the relevant code or diff.
5. For each test, the mutation challenge, the intended failure, the restoration check, and the result.
6. The focused and required project command results, with exit codes.
7. Safety notes, approvals, assumptions, limitations, and residual risks.
8. Evidence traceability for every material claim about behavior or results.

Distinguish the supplied baseline, the work executed during the example, and any proposed future checks.
Do not present a plan as a completed test delivery.

## Completion criteria

- Every new test maps to one attributable behavior and one distinct, plausible regression.
- Every new test fails at its intended assertion under the recorded targeted mutation, and passes again after restoration.
- Tests observe public outcomes, and none depends on private call order or on a mock of the unit under test.
- Focused and required project checks pass on the changed revision, with commands and exit codes retained.
- Time, randomness, storage, network, and shared state are deterministic or explicitly isolated.
- The final working tree contains the intended test changes and no temporary mutation.
- Every material statement in the delivery maps to evidence.

## Failure modes

- **F1:** The behavior sources turn out to be incomplete, contradictory, or inapplicable to the target revision.
- **F2:** Some required state or external dependency cannot be isolated deterministically.
- **F3:** A new test stays green under its targeted behavior-breaking mutation, or fails at an unrelated point.
- **F4:** The focused tests pass, but the required project suite reveals a new conflict or a flake.

## Recovery procedure

- **R1:** List the conflicting expectations, obtain an attributable disposition from a repository maintainer, and restart the behavior inventory.
- **R2:** Introduce an approved public dependency seam or a disposable fixture, verify cleanup and production isolation, and restart fixture design.
- **R3:** Rewrite the assertion around the observable outcome, rerun the targeted mutation, and proceed only once the intended assertion detects it.
- **R4:** Compare the suite failure with the immutable baseline, isolate any order or shared-state dependence, correct the fixture, and rerun the focused and project checks.

## Example

The [complete synthetic input](#complete-example-input) supplies a rate-limiter contract, a deterministic clock seam, a baseline, implemented cases, mutation results, and suite results.
The [complete expected output](#complete-expected-output) is a finished test delivery, not an unexecuted proposal.

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
