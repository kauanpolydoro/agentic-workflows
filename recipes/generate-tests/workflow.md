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

The [complete synthetic input](examples/input.md) supplies a rate-limiter contract, a deterministic clock seam, a baseline, implemented cases, mutation results, and suite results.
The [complete expected output](examples/expected-output.md) is a finished test delivery, not an unexecuted proposal.
