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

The [complete synthetic input](examples/input.md) supplies an approved HTTP contract, an immutable environment, a minimized request, three clean attempts, and an executed failing regression test.
The [complete expected output](examples/expected-output.md) packages those facts into a repository-bound record without claiming a causal diagnosis or a fix.
