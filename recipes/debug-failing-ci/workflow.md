# Diagnose and correct a failing CI job

## Objective

Transform an identified CI failure into an evidence-backed diagnosis, a minimal causal patch at a named path, and a verification matrix.
The primary quality constraint is that the failed control, its assertions, and its security boundaries remain at least as strict as the recorded baseline.

## When to use

- A named CI job fails on an immutable revision and its complete first-failure evidence is available.
- A command passes locally but fails in CI, so runner, dependency, cache, or command-order parity must be tested.
- An intermittent CI failure needs a bounded recurrence experiment before code or timeout changes are proposed.

## When not to use

- The run ID, commit SHA, first failing command, or complete relevant log cannot be obtained.
- The requested outcome is to skip, disable, or weaken a required quality control.
- The suspected failure belongs to unavailable provider infrastructure and no authorized equivalent environment can preserve the failing contract.
- The job can mutate production data, deploy artifacts, or credentials and the required owner has not approved an isolated diagnostic path.

## Required inputs

- **Immutable CI run identity:** Record the provider, run ID, attempt, job name, and full commit SHA, such as `run 700 / attempt 1 / typecheck / abc123...`.
  This anchors every observation to one execution.
  Validate that the checkout line, provider metadata, and requested revision resolve to the same SHA.
- **Complete sanitized first-failure log:** Retain the exact command, stdout and stderr from that command, exit code, and enough preceding setup output to establish causal order.
  This prevents a downstream symptom from being treated as the cause.
  Validate that the log is not truncated and that secrets, tokens, and customer data are redacted without removing error context.
- **CI execution definition:** Provide the workflow path and relevant job excerpt, runner image, runtime version, package-manager and lockfile policy, cache keys, environment inputs, and generated-artifact steps.
  This defines what CI actually ran.
  Validate the excerpt against the file at the failing commit rather than against the current branch.
- **Clean reproduction and environment comparison:** Supply the exact clean-checkout command sequence and a table comparing local and CI runtime, operating system, dependency state, filesystem behavior, caches, and generated files.
  This tests whether the failure is code-dependent or environment-dependent.
  Validate each local result with an exit code and the commit SHA used.

## Optional inputs

- An immutable last-passing run with the same job and comparable environment narrows the regression range.
  Do not compare it when runner, runtime, lockfile, or command order materially differs.
- Generated-artifact and cache inventories can reveal missing producers, stale cache restoration, or case-sensitive path differences.
- Provider status and incident records can support an infrastructure hypothesis, but they do not replace a repository-level experiment.

## Preconditions

- The run metadata and checkout log resolve to the same immutable commit.
- The retained log includes the first failing command and its exit code.
- All diagnostic evidence is sanitized and still contains the information needed to reproduce the failure.
- The clean environment cannot deploy, publish, rotate credentials, or mutate production state.
- The repository's required checks and assertions are identified before any patch is drafted.

## Workflow

### 1. Anchor the failure

Record the run identity, commit, job, attempt, failing command, exit code, and first causal error from the run metadata and sanitized log.
Produce a failure header that another reviewer can match to the provider record.
Advance only when the commit in the checkout log matches the run metadata.
Stop on a mismatch because evidence from different revisions cannot support one diagnosis.

### 2. Reconstruct command order

Read the workflow at the failing commit and list every setup or producer step before the failed consumer.
Compare the list with package scripts, generated-file policy, cache restoration, and artifact download behavior.
Produce an ordered execution table with source paths and line excerpts.
Advance when the first failure is positioned after all relevant setup steps.
Stop if the workflow excerpt or package script is missing.

### 3. Establish environment parity

Build a parity table for runner image, runtime, package manager, lockfile, environment inputs, filesystem case sensitivity, generated files, and cache state.
Mark each field as matched, different, or unknown and cite its source.
Advance when every difference has either been controlled or converted into a falsifiable hypothesis.
Stop if an unknown field could independently explain the failure and cannot be observed safely.

### 4. Reproduce from a clean state

Check out the failing commit in an isolated directory and run the CI commands in the same order with caches disabled unless cache behavior is the hypothesis under test.
Retain commands, environment, outputs, and exit codes.
Advance when the original failure reproduces or the local divergence is fully recorded.
Stop before editing code if setup fails for an unrelated reason.

### 5. Build and test hypotheses

For each hypothesis, record the predicted observation, one controlled variable, the exact experiment, and a falsification condition.
Run the smallest safe experiment first and preserve negative results as evidence.
Advance only when one hypothesis explains the first causal error and the controlled result, while plausible alternatives are rejected or bounded.
Stop root-cause language when the available experiments support only correlation.

### 6. Apply the minimal causal patch

Change only the workflow, dependency, generated-artifact order, or source path established by the supported hypothesis.
Record the target path and diff, then verify that no assertion, compiler rule, security scan, or coverage threshold was removed or relaxed.
Advance when the patch addresses the producer or defect that caused the failure and contains no diagnostic-only changes.
Stop if the patch changes release behavior without repository-maintainer approval.

### 7. Verify locally and externally

Repeat the original clean command, relevant adjacent checks, and any regression-specific command on the patched revision.
If approval permits, run the same CI job externally and record its run ID, attempt, revision, and result.
Produce a matrix that distinguishes supplied baseline, local execution, external CI execution, and unexecuted follow-up work.
Advance when every required local check passes and any absent external confirmation is explicitly pending.
Stop if a new first failure appears, then return to step 1 with that evidence.

### 8. Deliver the diagnostic record

Report facts, hypotheses, experiments, results, root cause, patch, validation, approvals, and residual uncertainty with evidence citations.
Confirm that every material claim maps to a retained source and that no secret appears in the artifact.
The deliverable is ready when the completion criteria can be reviewed directly from the record.

## Decision points

- If the raw log is truncated before the first failing command completes, stop diagnosis and obtain a complete sanitized log.
- If the run metadata and checkout revision differ, reject the evidence package and recollect it from one immutable run.
- If clean local reproduction passes, test environment and command-order differences before modifying production source code.
- If identical clean runs alternate between pass and fail, classify the issue as potentially flaky and run a bounded recurrence sample before changing timeouts or retries.
- If a hypothesis predicts only a downstream symptom, reject it and continue from the earliest causal error.
- If the minimal patch changes publishing, deployment, or release behavior, pause before push and request repository-maintainer approval with the diagnosis, diff, and rollback evidence.
- If the patched local command passes but external CI has not run, label external verification as pending rather than claiming the CI failure is resolved.

## Safety guardrails

- Never perform **disabling required checks** to make the job pass.
- Never perform **deleting valid assertions** or lowering compiler, linter, coverage, or security thresholds.
- Never perform **exposing CI secrets** in logs, environment dumps, patches, or the diagnostic report.
- Use an isolated checkout and non-production credentials, and prohibit deploy, publish, migration, or destructive service commands during reproduction.
- Bound repeated provider runs by a recorded experiment count, cost estimate, and repository-maintainer approval.
- Keep diagnostic instrumentation scoped and remove it unless it is part of the reviewed causal fix.
- Stop immediately if a command can affect production state or if redaction removes information necessary to interpret the failure.

## Human approval gates

- Before **pushing a CI workflow or release-behavior change**, the repository maintainer approves the supported hypothesis, named-path diff, local verification matrix, impact, and rollback procedure.
- Before **running repeated paid or resource-intensive CI experiments**, the repository maintainer approves the hypothesis list, maximum run count, expected cost, and abort condition.
- Before any production-like deployment or load is used for diagnosis, the operations owner approves the isolated environment, credentials, monitoring, and cleanup evidence.

## Expected output

Produce one Markdown CI diagnosis record with these required sections:

1. Status and immutable run identity.
2. Facts and first causal failure.
3. Environment and command-order comparison.
4. Hypothesis and experiment ledger with predictions and results.
5. Supported root cause or an explicit unresolved disposition.
6. Minimal patch at a named path.
7. Local and external CI verification matrix with commands, revisions, exit codes, and run IDs where executed.
8. Safety and approval record.
9. Residual uncertainty, rollback, next action, and evidence traceability.

Label observations, inferences, recommendations, executed checks, and proposed checks separately.
An unresolved diagnostic record is a valid failure handoff, but it is not a completed causal fix.

## Completion criteria

- The run ID, attempt, job, and commit in the artifact match the retained run evidence.
- The root-cause statement explains the earliest causal error and is supported by at least one falsifiable experiment.
- The patch changes only named causal paths and does not weaken a required control.
- The original clean command and all declared adjacent local checks have recorded post-patch results on the patched revision.
- External CI is either linked by run ID and result or explicitly marked pending with an owner and approval state.
- Every material claim, version, path, command, and result maps to a cited evidence source.
- Residual uncertainty, rollback, and any unexecuted verification are explicit.

## Failure modes

- **F1:** The first-failure log is incomplete, mismatched to the run, or redacted beyond interpretation.
- **F2:** The CI environment cannot be reproduced or approximated without unavailable infrastructure.
- **F3:** Identical clean runs produce inconsistent results.
- **F4:** The proposed causal patch passes locally but fails the equivalent external CI job.

## Recovery procedure

- **R1:** Recollect one complete sanitized log and run metadata for the same commit, validate their match, and restart at failure anchoring.
- **R2:** Build the smallest authorized substitute that preserves the failing command and contract, document every parity gap, and resume at reproduction only if the gap cannot explain the result.
- **R3:** Run a predeclared bounded sample, record pass and fail frequency with environment correlations, and restart hypothesis testing with a flaky classification.
- **R4:** Treat the external result as a new failure, capture its first causal evidence, roll back the unconfirmed patch if necessary, and restart at step 1.

## Example

The [complete synthetic input](examples/input.md) identifies a missing generated-file producer before type checking.
The [complete expected output](examples/expected-output.md) records the supported diagnosis, named workflow patch, local verification, pending external CI state, and evidence traceability without claiming an external run.
