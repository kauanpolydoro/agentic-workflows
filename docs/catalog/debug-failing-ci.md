---
title: "Diagnose and correct a failing CI job"
description: "Produce an evidence-backed CI diagnosis, minimal causal patch, and verification matrix without weakening the failed control."
---

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

The [complete synthetic input](#complete-example-input) identifies a missing generated-file producer before type checking.
The [complete expected output](#complete-expected-output) records the supported diagnosis, named workflow patch, local verification, pending external CI state, and evidence traceability without claiming an external run.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/debug-failing-ci/1.0.0",
  "title": "CI debugging output contract",
  "description": "Validates the anchored CI diagnosis, causal experiments, minimal patch, verification matrix, rollback, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "ci-diagnosis.md",
        "audience": "Repository maintainers and CI owners",
        "requires_title": true,
        "required_headings": [
          "Status and run identity",
          "Facts",
          "Environment and command-order comparison",
          "Hypotheses and experiments",
          "Supported root cause",
          "Minimal causal patch",
          "Verification matrix",
          "Safety, approval, and rollback",
          "Residual uncertainty and next action",
          "Traceability"
        ],
        "required_literals": [
          "| Dimension | Failing CI | Controlled local experiment | Assessment |",
          "| Hypothesis | Prediction | Experiment | Result | Disposition |",
          "| Check | Revision or run | Result | Verification class | Evidence |",
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
No repository, provider page, or service outside this file is required to produce the expected output.

## Objective

Diagnose why the `typecheck` job fails, prepare the smallest supported workflow patch, and distinguish local validation from external CI verification.

## Scope and constraints

- The only authorized source change is `.github/workflows/ci.yml`.
- Generated files remain untracked by repository policy.
- Required checks and TypeScript compiler settings cannot be disabled or weakened.
- Commands may be described as executed only when an evidence item records an exit code.
- No deploy, publish, production credential, or external service is authorized.

## Evidence inventory

### E1 - Immutable CI run identity

- Provider: GitHub Actions.
- Run ID: `700`.
- Attempt: `1`.
- Job: `typecheck`.
- Runner image: `ubuntu-24.04`.
- Runtime: Node.js `22.11.0` and pnpm `10.1.0`.
- Checkout commit: `abc1230000000000000000000000000000000000`.
- The provider metadata and checkout line contain the same commit.
- Establishes the immutable failing execution and environment.

### E2 - Workflow at the failing commit

- Path: `.github/workflows/ci.yml`.
- The complete relevant command order is shown below.

```yaml
- uses: actions/checkout@v4
- uses: pnpm/action-setup@v4
  with:
    version: 10.1.0
- uses: actions/setup-node@v4
  with:
    node-version: 22.11.0
    cache: pnpm
- run: pnpm install --frozen-lockfile
- run: pnpm typecheck
```

- No artifact download or generation step appears in the job.
- Establishes the exact CI order and patch target.

### E3 - Complete sanitized first-failure log

```text
Run pnpm typecheck
> synthetic-project@1.4.0 typecheck
> tsc --noEmit
src/index.ts(2,29): error TS2307: Cannot find module './generated/types.js' or its corresponding type declarations.
ELIFECYCLE Command failed with exit code 2.
Process completed with exit code 2.
```

- The log is complete for the first failing command and contains no secret values.
- Establishes the first causal failure and exit code.

### E4 - Repository producer and generated-file policy

- `package.json` defines `"generate:types": "node scripts/generate-types.mjs"`.
- `scripts/generate-types.mjs` writes `src/generated/types.ts`.
- `.gitignore` includes `src/generated/`.
- `src/index.ts` imports `./generated/types.js`.
- Repository policy requires generation in clean environments and forbids committing `src/generated/`.
- Establishes that type checking consumes an intentionally untracked generated module.

### E5 - Clean reproduction and controlled experiment

- Environment: a clean checkout of `abc1230000000000000000000000000000000000`, Ubuntu 24.04, Node.js 22.11.0, pnpm 10.1.0, and no restored cache.
- `pnpm install --frozen-lockfile && pnpm typecheck` exited `2` with the same TS2307 error.
- `pnpm install --frozen-lockfile && pnpm generate:types && pnpm typecheck` exited `0`.
- Repeating the corrected sequence from a second clean checkout also exited `0`.
- Establishes reproduction, prediction, and repeatability for the missing-producer hypothesis.

### E6 - Candidate patch and local adjacent verification

- A disposable branch inserted `- run: pnpm generate:types` after frozen installation and before type checking in `.github/workflows/ci.yml`.
- On commit `abc1230000000000000000000000000000000000` plus only that uncommitted workflow patch, `pnpm generate:types && pnpm typecheck` exited `0`.
- In the same clean environment, `pnpm test` exited `0` with `14` tests passing.
- `git diff -- src/generated` showed no tracked generated-file change.
- Establishes the named patch and local verification results.

### E7 - Approval and external verification state

- The repository maintainer has not yet approved pushing the workflow patch.
- No external CI run contains the patch.
- The authorized next action is to submit E1 through E6, the one-line diff, and the rollback instruction to the repository maintainer.
- Establishes that external CI verification and push approval are pending.

### E8 - Rollback and rejected alternatives

- Rollback is removal of the single `pnpm generate:types` workflow step.
- Deleting the import, committing generated files, adding `skipLibCheck`, and allowing typecheck failure are outside scope because they do not restore the required producer.
- Establishes the reversible boundary and forbidden alternatives.

## Complete expected output

> Synthetic CI-diagnosis artifact derived only from the supplied run, source, and command records.

## Status and run identity

Status: locally verified patch, pending repository-maintainer approval and external CI confirmation.

The failed execution is GitHub Actions run `700`, attempt `1`, job `typecheck`, on commit `abc1230000000000000000000000000000000000` using `ubuntu-24.04`, Node.js 22.11.0, and pnpm 10.1.0 [E1].

## Facts

- The first failing command is `pnpm typecheck`, which exits `2` because `src/index.ts` cannot resolve `./generated/types.js` [E3].
- The CI job installs dependencies and immediately runs type checking, with no generation or artifact-download step [E2].
- `pnpm generate:types` is the declared producer for `src/generated/types.ts`, and repository policy intentionally excludes that directory from version control [E4].
- The clean failing sequence reproduces the same TS2307 error, while adding the declared producer before type checking makes two clean runs exit `0` [E5].

## Environment and command-order comparison

| Dimension | Failing CI | Controlled local experiment | Assessment |
| --- | --- | --- | --- |
| Revision | `abc123...` | `abc123...` | Matched |
| Operating system | Ubuntu 24.04 runner | Ubuntu 24.04 | Matched |
| Node.js | 22.11.0 | 22.11.0 | Matched |
| pnpm | 10.1.0 | 10.1.0 | Matched |
| Cache | pnpm cache configured | Cache disabled | Not needed to reproduce |
| Generated types before typecheck | Absent | Tested as absent and present | Controlled variable |

Sources: E1, E2, and E5.

## Hypotheses and experiments

| Hypothesis | Prediction | Experiment | Result | Disposition |
| --- | --- | --- | --- | --- |
| The clean job omits the generated-type producer. | Typecheck fails without generation and passes when the producer runs first. | Execute both sequences on the same clean revision and environment. | Exit `2` without generation and exit `0` twice with generation. | Supported [E5] |
| A stale restored cache causes the missing module. | The failure disappears when the cache is disabled. | Reproduce with no restored cache. | The failure still occurs. | Rejected as the necessary cause [E5] |
| The generated directory should be committed. | Repository policy identifies tracked generation as the required state. | Inspect the producer and ignore policy. | The directory is intentionally untracked and must be produced in clean environments. | Rejected [E4] |

## Supported root cause

The `typecheck` job consumes `src/generated/types.ts` without first running its declared producer.
This statement explains the earliest causal error, the workflow order, and both controlled outcomes [E2, E3, E4, E5].

## Minimal causal patch

Target: `.github/workflows/ci.yml`.

```diff
 - run: pnpm install --frozen-lockfile
+- run: pnpm generate:types
 - run: pnpm typecheck
```

The disposable-branch record confirms that this is the only source change in the candidate and that no generated file is added to version control [E6].
Compiler rules, assertions, and required checks remain unchanged.

## Verification matrix

| Check | Revision or run | Result | Verification class | Evidence |
| --- | --- | --- | --- | --- |
| Original clean install then typecheck | `abc123...` | Exit `2`, TS2307 | Reproduced baseline | E5 |
| Generate types then typecheck, run 1 | `abc123...` plus one-line patch | Exit `0` | Local candidate | E5, E6 |
| Generate types then typecheck, run 2 | `abc123...` plus one-line patch | Exit `0` | Local repeatability | E5 |
| Unit tests after generation | `abc123...` plus one-line patch | Exit `0`, 14 passing | Local adjacent check | E6 |
| Equivalent external CI job | Not run | Pending | External CI | E7 |

The local results support the causal patch but do not establish that the external CI workflow has passed.

## Safety, approval, and rollback

No check, compiler rule, assertion, or threshold is disabled.
The rejected alternatives include committing generated files, removing the import, enabling `skipLibCheck`, and tolerating typecheck failure [E8].

The repository maintainer must approve the diagnosis, one-line workflow diff, local verification, and rollback before the patch is pushed [E7].
Rollback removes only the added `pnpm generate:types` step [E8].

## Residual uncertainty and next action

The external runner has not executed the candidate workflow, so provider-specific behavior remains unverified [E7].
The next action is for the repository maintainer to review E1 through E8 and, if approved, push the patch and record the resulting CI run ID and outcome.
If that run fails, its first causal failure becomes a new evidence package rather than being folded into this root-cause claim.

## Traceability

| Material claim or decision | Evidence |
| --- | --- |
| Immutable run and environment | E1 |
| Missing generation step in CI order | E2 |
| First causal TS2307 failure and exit code | E3 |
| Producer, consumer, and untracked-output policy | E4 |
| Controlled reproduction and falsification results | E5 |
| Named-path patch and local adjacent checks | E6 |
| Pending push approval and external CI state | E7 |
| Rollback and rejected unsafe alternatives | E8 |
