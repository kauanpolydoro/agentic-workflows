# Diagnose and correct a failing CI job

## Objective

Start from one identified CI failure and work it into an evidence-backed diagnosis, a minimal causal patch at a named path, and a verification matrix.
The primary quality constraint is that the failed control, its assertions, and its security boundaries stay at least as strict as the recorded baseline, no matter what else the patch touches.

## When to use

- A named CI job fails on an immutable revision, and the complete evidence from its first failure is available.
- A command passes locally but fails in CI, so you need to test parity across the runner, dependency state, caches, and command order.
- A CI failure is intermittent, and you want a bounded recurrence experiment before proposing any code or timeout change.

## When not to use

- The run ID, commit SHA, first failing command, or complete relevant log cannot be obtained.
- The requested outcome is to skip, disable, or weaken a required quality control.
- The suspected failure sits in provider infrastructure you cannot access, and no authorized equivalent environment can preserve the failing contract.
- The job is able to mutate production data, deploy artifacts, or handle credentials, and the required owner has not approved an isolated diagnostic path.

## Required inputs

- **Immutable CI run identity:** Record the provider, run ID, attempt, job name, and full commit SHA, for example `run 700 / attempt 1 / typecheck / abc123...`.
  Every observation in the diagnosis is anchored to this one execution.
  Validate that the checkout line, the provider metadata, and the requested revision all resolve to the same SHA.
- **Complete sanitized first-failure log:** Keep the exact command, its stdout and stderr, its exit code, and enough of the preceding setup output to establish causal order.
  Without this, a downstream symptom can quietly be treated as the cause.
  Validate that the log is not truncated, and that secrets, tokens, and customer data are redacted without removing error context.
- **CI execution definition:** Provide the workflow file path and the relevant job excerpt, plus the runner image, runtime version, package-manager and lockfile policy, cache keys, environment inputs, and generated-artifact steps.
  Together these definitions describe what CI actually ran, as opposed to what you assume it ran.
  Validate the excerpt against the file at the failing commit, not against the current branch.
- **Clean reproduction and environment comparison:** Supply the exact clean-checkout command sequence, plus a table comparing local and CI runtime, operating system, dependency state, filesystem behavior, caches, and generated files.
  This is what tells you whether the failure depends on the code or on the environment.
  Validate each local result with an exit code and the commit SHA it ran against.

## Optional inputs

- An immutable last-passing run for the same job, in a comparable environment, narrows the regression range.
  Skip the comparison when the runner, runtime, lockfile, or command order materially differs.
- Inventories of generated artifacts and caches can reveal a missing producer, stale cache restoration, or a case-sensitive path difference.
- Provider status pages and incident records can support an infrastructure hypothesis, but they do not replace a repository-level experiment.

## Preconditions

- The run metadata and the checkout log resolve to the same immutable commit.
- The retained log includes the first failing command and its exit code.
- All diagnostic evidence is sanitized, yet still contains what you need to reproduce the failure.
- The clean environment cannot deploy, publish, rotate credentials, or mutate production state.
- The repository's required checks and assertions are identified before any patch is drafted.

## Workflow

### 1. Anchor the failure

From the run metadata and the sanitized log, record the run identity, commit, job, attempt, failing command, exit code, and first causal error.
Produce a failure header that another reviewer can match against the provider record.
Advance only when the commit in the checkout log matches the run metadata.
On a mismatch, stop: evidence gathered from different revisions cannot support one diagnosis.

### 2. Reconstruct command order

Read the workflow at the failing commit and list every setup or producer step that runs before the failed consumer.
Compare that list with the package scripts, the generated-file policy, cache restoration, and artifact download behavior.
Produce an ordered execution table with source paths and line excerpts.
Advance once the first failure sits after all relevant setup steps in that table.
Stop if the workflow excerpt or a package script is missing.

### 3. Establish environment parity

Build a parity table covering runner image, runtime, package manager, lockfile, environment inputs, filesystem case sensitivity, generated files, and cache state.
Mark each field as matched, different, or unknown, and cite its source.
Advance when every difference has either been controlled or turned into a falsifiable hypothesis.
Stop if an unknown field could explain the failure on its own and cannot be observed safely.

### 4. Reproduce from a clean state

Check out the failing commit in an isolated directory and run the CI commands in the same order, with caches disabled unless cache behavior is the hypothesis under test.
Retain the commands, environment, outputs, and exit codes.
Advance when the original failure reproduces, or when the local divergence is fully recorded.
Stop before editing any code if setup fails for an unrelated reason.

### 5. Build and test hypotheses

For each hypothesis, write down the predicted observation, the one variable you control, the exact experiment, and the condition that would falsify it.
Run the smallest safe experiment first, and keep negative results as evidence rather than discarding them.
Advance only when one hypothesis explains both the first causal error and the controlled result, and every plausible alternative has been rejected or bounded.
Stop using root-cause language when the available experiments support only correlation.

### 6. Apply the minimal causal patch

Change only the workflow, dependency, generated-artifact order, or source path that the supported hypothesis points to.
Record the target path and the diff, then verify that no assertion, compiler rule, security scan, or coverage threshold was removed or relaxed.
Advance when the patch addresses the producer or defect that caused the failure and carries no diagnostic-only changes.
Stop if the patch changes release behavior without repository-maintainer approval.

### 7. Verify locally and externally

On the patched revision, repeat the original clean command, the relevant adjacent checks, and any regression-specific command.
If approval permits, run the same CI job externally and record its run ID, attempt, revision, and result.
Produce a matrix that separates the supplied baseline, local execution, external CI execution, and follow-up work that has not been executed.
Advance when every required local check passes and any absent external confirmation is explicitly marked pending.
Stop if a new first failure appears, and return to step 1 with that evidence.

### 8. Deliver the diagnostic record

Report the facts, hypotheses, experiments, results, root cause, patch, validation, approvals, and residual uncertainty, each with evidence citations.
Confirm that every material claim maps to a retained source and that no secret appears in the artifact.
The deliverable is ready when the completion criteria can be reviewed directly from the record.

## Decision points

- If the raw log is truncated before the first failing command completes, stop the diagnosis and obtain a complete sanitized log.
- If the run metadata and the checkout revision differ, reject the evidence package and recollect it from one immutable run.
- If the clean local reproduction passes, test environment and command-order differences before modifying production source code.
- If identical clean runs alternate between pass and fail, classify the issue as potentially flaky and run a bounded recurrence sample before changing timeouts or retries.
- If a hypothesis predicts only a downstream symptom, reject it and continue from the earliest causal error.
- If the minimal patch changes publishing, deployment, or release behavior, pause before pushing and request repository-maintainer approval with the diagnosis, diff, and rollback evidence.
- If the patched local command passes but external CI has not run, label external verification as pending instead of claiming the CI failure is resolved.

## Safety guardrails

- Never make the job pass by **disabling required checks**.
- Never resort to **deleting valid assertions**, and never lower a compiler, linter, coverage, or security threshold.
- Never risk **exposing CI secrets** in logs, environment dumps, patches, or the diagnostic report.
- Use an isolated checkout with non-production credentials, and prohibit deploy, publish, migration, and destructive service commands during reproduction.
- Bound repeated provider runs with a recorded experiment count, a cost estimate, and repository-maintainer approval.
- Keep diagnostic instrumentation narrowly scoped, and remove it unless it is part of the reviewed causal fix.
- Stop immediately if a command could affect production state, or if redaction has removed information needed to interpret the failure.

## Human approval gates

- Before **pushing a CI workflow or release-behavior change**, the repository maintainer approves the supported hypothesis, the named-path diff, the local verification matrix, the impact, and the rollback procedure.
- Before **running repeated paid or resource-intensive CI experiments**, the repository maintainer approves the hypothesis list, the maximum run count, the expected cost, and the abort condition.
- Before any production-like deployment or load is used for diagnosis, the operations owner approves the isolated environment, credentials, monitoring, and cleanup evidence.

## Expected output

Produce one Markdown CI diagnosis record with these required sections:

1. Status and immutable run identity.
2. Facts and the first causal failure.
3. Environment and command-order comparison.
4. Hypothesis and experiment ledger, with predictions and results.
5. Supported root cause, or an explicit unresolved disposition.
6. Minimal patch at a named path.
7. Local and external CI verification matrix, with commands, revisions, exit codes, and run IDs where executed.
8. Safety and approval record.
9. Residual uncertainty, rollback, next action, and evidence traceability.

Label observations, inferences, recommendations, executed checks, and proposed checks separately, so a reader always knows which is which.
An unresolved diagnostic record is a valid failure handoff, but it is not a completed causal fix.

## Completion criteria

- The run ID, attempt, job, and commit in the artifact match the retained run evidence.
- The root-cause statement explains the earliest causal error and is supported by at least one falsifiable experiment.
- The patch changes only named causal paths and does not weaken any required control.
- The original clean command and every declared adjacent local check have recorded post-patch results on the patched revision.
- External CI is either linked by run ID and result, or explicitly marked pending with an owner and an approval state.
- Every material claim, version, path, command, and result maps to a cited evidence source.
- Residual uncertainty, rollback, and any unexecuted verification are stated explicitly.

## Failure modes

- **F1:** The first-failure log is incomplete, does not match the run, or has been redacted past the point of interpretation.
- **F2:** The CI environment cannot be reproduced or approximated without infrastructure that is unavailable.
- **F3:** Identical clean runs produce inconsistent results.
- **F4:** The proposed causal patch passes locally but fails the equivalent external CI job.

## Recovery procedure

- **R1:** Recollect one complete sanitized log and the run metadata for the same commit, validate that they match, and restart at failure anchoring.
- **R2:** Build the smallest authorized substitute that preserves the failing command and its contract, document every parity gap, and resume at reproduction only if the gap cannot explain the result.
- **R3:** Run a predeclared bounded sample, record pass and fail frequency together with environment correlations, and restart hypothesis testing under a flaky classification.
- **R4:** Treat the external result as a new failure, capture its first causal evidence, roll back the unconfirmed patch if necessary, and restart at step 1.

## Example

The [complete synthetic input](examples/input.md) describes a generated file whose producer step is missing before type checking runs.
The [complete expected output](examples/expected-output.md) records the supported diagnosis, the named workflow patch, the local verification, the pending external CI state, and the evidence traceability, without claiming an external run.
