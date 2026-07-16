# Build a bounded bug reproduction

## Objective

Transform an attributable behavior report into a sanitized repository-bound reproduction record, a failing regression test at a named path, and a repeatability record.
The primary quality constraint is that the test fails on the affected revision for the reported behavior before any product fix is introduced.

## When to use

- A user-visible defect must be confirmed on a specific released version or commit before diagnosis or implementation.
- A reliable report contains extra data or setup that must be minimized into a portable fixture.
- An intermittent symptom needs a bounded recurrence record and a reusable test boundary.

## When not to use

- Expected behavior is disputed and no product contract or authorized decision resolves it.
- The affected revision, dependency state, or triggering input cannot be obtained or reconstructed safely.
- Reproduction requires production credentials, unsanitized customer data, destructive production actions, or an unapproved external charge.
- The primary task is already to diagnose a captured failure, implement a fix, or triage an incident rather than establish reproducibility.

## Required inputs

- **Approved expected behavior and exact observed behavior:** Provide the relevant contract text or role-based approval, plus concrete status codes, values, errors, or visible states.
  This distinguishes a defect from an expectation mismatch.
  Validate that the source applies to the affected version and that ambiguous wording has an owner disposition.
- **Immutable affected environment:** Record the commit or release, operating system, runtime, dependency lock state, database engine, browser, and feature flags that can influence the behavior.
  This anchors every attempt.
  Validate that the revision resolves and that the environment can be reconstructed from retained configuration.
- **Sanitized trigger and setup protocol:** Supply the smallest known payload, fixture, state setup, exact invocation command, and reset procedure.
  This makes repetition safe and portable.
  Validate that secrets, personal data, and unrelated fields are absent while the relevant shape and failure remain.
- **Repeated boundary results:** Record expected and observed results for a predeclared number of clean attempts through the closest authorized user-facing boundary.
  This supports a bounded recurrence classification and an intermittent classification when results differ.
  Validate each attempt with its environment, reset confirmation, output, and exit or response status.

## Optional inputs

- An immutable known-good revision in a comparable environment can establish a regression range after the reproduction is stable.
- Sanitized logs and traces can guide minimization, but they do not establish root cause without a separate causal experiment.
- Screenshots or recordings can preserve presentation symptoms when textual output is insufficient.
- A minimization history shows which fields, steps, or services were removed while the failure remained.

## Preconditions

- Expected behavior has an attributable contract or explicit product-owner approval.
- The affected revision and every required dependency can be restored in an isolated environment.
- Triggering data contains no production credential, secret, or unsanitized personal information.
- Persistent state can be reset between attempts and the reset can be observed.
- No product fix or unrelated working-tree change is present during baseline reproduction.

## Workflow

### 1. State the disputed behavior

Translate the report into one observable condition with an exact input, expected result, and observed result.
Attach the contract or approval that establishes the expectation.
Advance when a reviewer can decide pass or fail without interpretation.
Stop if expected behavior remains disputed.

### 2. Freeze revision and environment

Resolve the affected release or commit and record runtime, operating system, dependency lock, flags, and persistent-service versions.
Create an isolated environment from that record and confirm that no uncommitted behavior change is present.
Advance when the environment identity is reproducible.
Stop if an uncontrolled version difference could explain the symptom.

### 3. Sanitize and minimize the trigger

Remove credentials, personal data, unrelated fields, external calls, and setup steps one at a time.
After every removal, reset state and rerun the same boundary action.
Produce a minimization ledger showing whether the failure remained.
Advance when no remaining field or setup step can be removed without losing the targeted behavior.
Stop if sanitization removes the failure and a safe structural substitute cannot be built.

### 4. Execute a bounded reproduction sample

Predeclare the number of attempts and run the minimal protocol from a clean state each time.
Record command, input, output, response or exit status, environment, and reset confirmation for every attempt.
Advance when the recurrence rate is calculated.
Report the observed recurrence for the predeclared sample and classify mixed identical attempts as intermittent.

### 5. Select the regression-test boundary

Choose the closest stable boundary that exercises the observed behavior, such as browser, HTTP, CLI, service, or pure API.
Record any end-to-end coverage lost by moving inward.
Advance when the test can control all required state without mocking the behavior under test.
Stop if the chosen seam bypasses the reported behavior.

### 6. Add and challenge the failing test

Create a named test with the minimal fixture and exact expected assertion, then run it on the affected revision.
Confirm that setup, import, fixture, and unrelated assertions pass before the intended behavior assertion fails.
Temporarily invert or remove the targeted assertion only to confirm its causal location, then restore it without changing product code.
Advance when the retained test fails for the expected reason.
Stop if the test fails earlier or passes on the affected behavior.

### 7. Package the reproduction

Deliver the required source revision and locked dependency prerequisites, environment setup, state reset, minimal fixture, exact command, per-attempt results, regression-test path and excerpt, boundary limitation, safety record, and evidence map.
Separate observations from hypotheses and state that causal diagnosis and remediation are outside this workflow.
Advance when a reviewer with access to the referenced source checkout can reproduce from the record without undocumented setup.

## Decision points

- If expected behavior is absent or disputed, stop before writing a test and obtain a product-owner decision with the applicable contract evidence.
- If sanitization removes the symptom, restore the last removed structural property with synthetic data and repeat the minimization check.
- If an end-to-end environment is unavailable, move one boundary inward only after recording the lost coverage and obtaining repository-maintainer approval.
- If identical clean attempts produce mixed outcomes, classify the reproduction as intermittent and report the measured recurrence.
- If the new test fails during setup, import, or fixture creation, correct that independent failure before attributing the result to the reported behavior.
- If the new test passes on the affected revision, reject it as a regression guard and redesign the assertion or boundary.

## Safety guardrails

- Never perform **using production credentials or unsanitized customer data** in a fixture, log, screenshot, trace, or environment.
- Never perform **changing product behavior before capturing the failure** and retaining the failing regression test.
- Never perform **accepting a regression test that fails for an unrelated reason**, including setup, import, timeout, or fixture errors.
- Use disposable local state and verify reset completion before each attempt.
- Do not call production services, send real notifications, charge accounts, or persist external side effects.
- Keep the reproduction patch separate from any proposed fix and stop if the working tree contains an unreviewed behavior change.

## Human approval gates

- Before **accepting clarified expected behavior before encoding a regression test**, the product owner approves the exact observable contract, affected version, and evidence source.
- Before moving from the reported user-facing boundary to a lower-level seam, the repository maintainer approves the recorded coverage loss and future end-to-end follow-up.
- Before any externally billed or destructive test dependency is introduced, the service owner approves the isolated substitute, cost bound, cleanup, and abort condition.

## Expected output

Produce one repository-bound Markdown reproduction record containing:

1. Reproduction status, immutable revision, and environment.
2. Approved expected behavior and exact observed behavior.
3. Minimal sanitized fixture and clean-state setup.
4. Exact command or interaction steps and per-attempt results.
5. Minimization experiment and recurrence classification.
6. A behavior-specific failing regression test at a named path, including relevant code, supported tool version, command, and intended assertion evidence.
7. A repeatability, boundary, and residual-uncertainty record with safety, assumptions, and limitations.
8. Handoff recommendation and evidence traceability.

Facts, trigger hypotheses, experiments, results, diagnostic exclusions, recommendations, and validation must be labeled separately.
Do not include a product fix in this artifact.

## Completion criteria

- A reviewer with access to the referenced source revision can recreate the affected environment and run the reproduction without undocumented prerequisites.
- The retained fixture is sanitized and every retained field or setup step is relevant to the targeted behavior.
- The recurrence classification is supported by a predeclared clean-state sample with per-attempt results.
- The regression test fails on the affected revision at the intended behavior assertion rather than at setup.
- The expected result cites an applicable contract or approved product decision.
- The artifact states its boundary, lost coverage, excluded causal diagnosis, safety record, and residual uncertainty.
- No behavior fix is present in the reproduction change.

## Failure modes

- **F1:** Expected behavior is undefined, contradictory, or inapplicable to the affected version.
- **F2:** The failure depends on sensitive or inaccessible data that cannot be represented safely.
- **F3:** Clean attempts produce inconsistent outcomes.
- **F4:** The regression test fails before reaching the targeted assertion or passes on the affected revision.

## Recovery procedure

- **R1:** Enumerate the conflicting expectations, obtain a product-owner disposition with applicable contract evidence, and restart at behavior definition.
- **R2:** Build a synthetic fixture that preserves only the required shape, validate the failure against it, and resume at minimization only if no sensitive value remains.
- **R3:** Increase to a predeclared bounded sample, record recurrence and environmental correlations, and deliver an intermittent reproduction with the observed rate.
- **R4:** Repair setup or choose a boundary that exercises the behavior, then rerun on the unchanged affected revision until the intended assertion is the failing point.

## Example

The [complete synthetic input](examples/input.md) supplies an approved HTTP contract, immutable environment, minimized request, three clean attempts, and an executed failing regression test.
The [complete expected output](examples/expected-output.md) packages those facts as a repository-bound record without claiming a causal diagnosis or fix.
