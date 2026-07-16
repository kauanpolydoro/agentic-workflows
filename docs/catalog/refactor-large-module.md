---
title: "Refactor a large module through reversible slices"
description: "Decompose one change-coupled module into cohesive boundaries while preserving its evidenced public contract at every independently reversible checkpoint."
---

# Refactor a large module through reversible slices

## Objective

Transform one evidenced, change-coupled module through staged source and test checkpoints and produce a contracted Markdown verification record whose cohesive boundaries can be reviewed and reverted independently.
Preserve every recorded public export, output, error, side effect, and compatibility constraint unless a repository maintainer explicitly approves a separately identified contract change.

## When to use

- Use this procedure when one module owns multiple responsibilities that have distinct reasons to change and repository evidence can identify their callers and effects.
- Use it when characterization tests can protect the public boundary while responsibilities move through small checkpoints.
- Use it when the team needs a traceable decomposition rather than a behavior change or a framework migration.

## When not to use

- Do not start when the immutable revision, exact module boundary, or public contract cannot be established.
- Do not use this workflow to combine feature work, defect correction, dependency upgrades, or public API redesign with an internal refactor.
- Do not proceed when hidden state makes characterization nondeterministic and no safe seam can be introduced first.
- Do not use it when the proposed work cannot be divided into checkpoints that can be validated and reverted independently.

## Required inputs

- **Immutable revision and exact approved and final path inventories with explicit exclusions:** provide a commit identifier, every permitted source and test path, the starting working-tree state, in-scope responsibilities, and excluded files or behaviors.
  The boundary prevents unrelated cleanup from entering the change.
  Validate the commit through the version-control system and reconcile every changed file against the recorded scope.
- **Public exports, callers, side effects, invariants, and compatibility constraints:** provide signatures, import locations, observable outputs, error contracts, state mutations, ordering rules, and behavior that consumers rely on.
  These records define what must remain stable.
  Validate them with repository-wide search, call-site inspection, contract documentation, and characterization tests.
- **Baseline and per-checkpoint characterization commands with recorded results:** provide exact commands, environment, exit status, test counts, relevant output, and the revision or checkpoint to which each result applies.
  Comparable results are required to detect semantic drift.
  Reject results whose command, environment, or associated revision is missing.
- **Proposed responsibility boundaries, dependency direction, approval state, and rollback units:** provide destination files, responsibility statements, allowed dependencies, checkpoint order, approver roles, and the exact unit reverted on failure.
  This makes cohesion, coupling, and reversibility reviewable before code moves.
  Validate that no checkpoint requires a later checkpoint to compile or roll back.

## Optional inputs

- Comparable latency, allocation, or throughput measurements add a performance guard when the module is sensitive to execution cost.
  Without them, report performance as unassessed rather than unchanged.
- Owner-approved architecture notes can clarify intended boundary ownership.
  Treat them as design intent and reconcile them with observed callers and dependencies before relying on them.

## Preconditions

- The scoped revision resolves to an immutable commit, and the starting working-tree state is recorded.
- Every public export and known in-repository caller appears in the inventory.
- Characterization tests pass, or each pre-existing failure has an owner and written disposition.
- Every proposed checkpoint compiles and can be reverted without a later checkpoint.
- Any requested public contract change has been separated from the refactor and submitted to the repository maintainer.

## Workflow

### Phase 1 - Freeze the protected boundary

1. Record the immutable revision, module path, allowed files, exclusions, runtime, and exact validation commands.
   Produce a scope record that another reviewer can reproduce.
   Advance only when the revision and scope reconcile with the working tree; stop on unrelated or unexplained changes.
2. Build a contract map of public exports, call sites, observable outputs, errors, side effects, state ownership, and ordering invariants.
   Use repository search, documentation, and tests as evidence, and label any uncertain consumer explicitly.
   Advance only when every known contract element has a verification method; stop when a material behavior has no observable check.

### Phase 2 - Establish the baseline and boundaries

3. Run the characterization and project checks in the declared environment.
   Attach the command, exit status, test count, and relevant result to the immutable revision.
   Advance when results are reproducible or every existing failure is dispositioned; stop when a new run cannot be compared with the record.
4. Group responsibilities by owned state, side effects, reasons to change, and allowed dependency direction.
   Produce a boundary table with destination path, stable seam, prohibited dependency, and responsible owner role.
   Advance only when each extraction reduces mixed ownership without merely adding forwarding parameters; otherwise keep that responsibility in the original module.
5. Order the work into the smallest independently compilable and revertible checkpoints.
   For each checkpoint, record every changed path exactly, protected behaviors, commands, expected result, and rollback unit.
   Stop if a checkpoint combines multiple responsibilities or depends on an unimplemented later slice.

### Phase 3 - Extract and verify

6. Implement one checkpoint without changing the public facade unless an approved contract change explicitly requires it.
   Keep the diff limited to its declared responsibility, tests, and compatibility seam.
   Stop before the next checkpoint if changed paths or behavior exceed the scope record.
7. Run the checkpoint's characterization, type, lint, and focused dependency-boundary checks.
   Compare outputs, errors, side effects, exports, and optional performance measurements with the baseline.
   Advance only when all protected behavior matches and new dependencies follow the boundary table; otherwise execute the checkpoint rollback.
8. Exercise the rollback unit in an isolated branch or disposable worktree, then reapply the verified checkpoint.
   Retain both restoration and reapplication results.
   Stop if rollback cannot return the module to the prior passing checkpoint.
9. Repeat steps 6 through 8 for the next checkpoint only after the current checkpoint has a complete evidence record.
   Do not collapse checkpoint histories after a failure because the sequence is part of the audit trail.

### Phase 4 - Reconcile and deliver

10. Compare the final export surface, caller inventory, outputs, errors, side effects, dependency direction, and optional performance measurements with the baseline.
    Produce the public behavior and dependency-boundary verification record.
    Stop delivery on any unapproved difference.
11. Retain each source and test checkpoint as an immutable version-control diff and deliver the contracted compatibility, rollback, approval, and residual-risk record.
    Identify untested consumers, unavailable measurements, temporary facades, and the owner and exit condition for every follow-up.
    Advance to merge review only when each completion criterion can be checked from retained evidence.

## Decision points

- If repository search finds an unclassified caller, add it to the contract map and characterize its behavior before moving the referenced responsibility.
- If an extraction only introduces parameter forwarding without establishing ownership or dependency direction, keep that code in the current boundary and redesign the slice.
- If a checkpoint changes a public export, output, error, or side effect, revert it and separate the semantic change unless the repository maintainer approves the explicit before-and-after contract.
- If comparable performance evidence exceeds an approved threshold, revert the checkpoint unless the service owner accepts the measured regression with documented impact.
- If rollback depends on a later checkpoint, reorder or divide the work before implementation continues.

## Safety guardrails

- Never perform a big-bang rewrite that cannot be verified or reverted by checkpoint.
- Never change public exports, outputs, errors, or side effects without explicit approval tied to a before-and-after contract.
- Never delete characterization tests because implementation code moved.
- Do not broaden scope to nearby cleanup, naming changes, dependency upgrades, or feature work.
- Do not remove a compatibility facade until repository-wide caller evidence shows that no protected consumer depends on it.
- Run rollback drills only in an isolated branch or disposable worktree, and never discard unrelated local changes.
- Stop when hidden state, nondeterminism, or unavailable dependencies prevent a reliable comparison with the baseline.

## Human approval gates

- Before changing any public contract, the repository maintainer must approve the exact before-and-after signature or behavior, affected caller inventory, migration action, test evidence, and rollback plan.
- Before accepting a measured performance regression, the service owner must approve comparable baseline and checkpoint measurements, user impact, threshold exception, and follow-up owner.
- Before merge, the repository maintainer reviews the final contract comparison, checkpoint results, rollback drill, changed-file inventory, and residual risks.

## Expected output

Apply one cohesive source and test responsibility per reversible repository checkpoint.
The output contract covers one Markdown delivery record containing:

- scope, immutable starting revision, exclusions, and final changed-file inventory;
- the protected public contract and caller map;
- a boundary and dependency-direction table;
- checkpoint-level exact changed paths, implementation summaries, and command results;
- a public behavior and dependency-boundary verification record;
- rollback drill evidence for every checkpoint;
- compatibility decisions, approval state, assumptions, residual risks, and owned follow-up actions; and
- claim-to-evidence traceability for every material result.

Source and test files are repository effects rather than serialized output-contract artifacts.
The record must identify the immutable diff for every checkpoint and the exact retained path or archive identifier by which a reviewer can inspect it.
Code excerpts must identify their destination file and whether they are proposed or implemented.
Do not describe a checkpoint as passing unless its retained result identifies the exact checkpoint.

## Completion criteria

- Every final public export, output, error, side effect, and known caller matches the baseline or has explicit repository maintainer approval.
- Each changed source file has one stated responsibility and obeys the approved dependency direction.
- Every checkpoint has an exact changed-path list, immutable identifier for an independently retained implementation diff, passing characterization result, and successful rollback and reapplication record.
- No unrelated file or behavior appears in the final changed-file inventory.
- Every accepted performance difference has comparable measurements and service owner approval.
- Every residual risk or temporary compatibility seam has an owner role and measurable exit condition.
- The delivery record maps every material claim to evidence and identifies any unexecuted check.

## Failure modes

- **F1:** A protected behavior depends on hidden global state or nondeterministic ordering.
- **F2:** Repository search reveals a caller or side effect absent from the approved inventory.
- **F3:** A checkpoint changes protected behavior or violates the dependency direction.
- **F4:** The rollback drill cannot restore the preceding passing checkpoint.
- **F5:** Final reconciliation contains an unrelated change or an unsupported compatibility claim.

## Recovery procedure

- **R1:** Introduce the smallest injectable or observable seam without moving responsibility, characterize the hidden behavior, and restart baseline review before extraction.
- **R2:** Stop the current checkpoint, expand the contract map and tests, revise affected slices, and restart from the last verified checkpoint.
- **R3:** Revert the failing checkpoint, retain its diff and results, isolate the semantic or dependency violation, and redesign or seek the applicable approval before retrying.
- **R4:** Preserve the failure evidence, restore the last known-good revision through a reviewed manual path, correct checkpoint boundaries, and rerun rollback before any further extraction.
- **R5:** Remove the unrelated change or downgrade the unsupported claim, rerun final reconciliation, and return the record to merge review.

## Example

The [synthetic input](#complete-example-input) supplies an immutable scope, contract map, implementation slices, checkpoint results, and rollback evidence for a reporting module.
The [complete expected output](#complete-expected-output) is a finished refactor delivery record derived only from those supplied evidence items.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/refactor-large-module/1.0.0",
  "title": "Large-module refactor output contract",
  "description": "Validates the Markdown delivery record for protected contracts, immutable retained-diff identities, implemented boundaries, reversible checkpoints, changed files, verification, rollback, residual risk, and traceability; source and test files remain repository effects outside this serialized artifact.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "refactor-delivery-record.md",
        "audience": "Repository maintainers and refactor reviewers",
        "requires_title": true,
        "required_headings": [
          "Status and scope",
          "Protected contract",
          "Implemented boundary map",
          "Checkpoint record",
          "Final changed-file inventory",
          "Behavior and performance verification",
          "Compatibility, approvals, and rollback",
          "Residual risks and follow-up",
          "Traceability summary"
        ],
        "required_literals": [
          "| File | Owned responsibility | Dependency result | Evidence |",
          "| Checkpoint | Exact changed paths | Cohesive change | Validation result | Rollback result | Evidence |",
          "| Risk or limitation | Impact | Owner role | Exit condition | Evidence |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This example is entirely synthetic.
It contains all source, command, approval, and rollback facts used by the expected output.

## Scenario

At immutable commit `4c1e72a000000000000000000000000000000000`, `src/reporting.ts` is a 640-line TypeScript module that validates a request, loads report rows, formats CSV, and writes the result to disk.

The authorized change is an internal decomposition of that module and its tests.
New features, dependency changes, storage-schema changes, CSV-format changes, public API changes, and edits outside the listed paths are excluded.

The starting working tree was clean.
The runtime is Node.js 22.11.0 with pnpm 9.15.4 on Linux x64.

## Objective and approvals

The repository maintainer approved internal extraction only when every checkpoint preserves the recorded contract and passes its characterization checks.
No public contract change is approved.

The service owner set a CSV formatting performance guard of no more than 10 percent regression for the supplied fixture.
No regression exception has been approved.

## Evidence inventory

### E1 - Immutable scope record

- Starting commit: `4c1e72a000000000000000000000000000000000`.
- Starting working tree: clean.
- Allowed source paths: `src/reporting.ts`, `src/reporting/validate-report-request.ts`, `src/reporting/format-report-csv.ts`, `src/reporting/load-report-rows.ts`, `src/reporting/write-report-file.ts`, and `src/reporting/generate-report.ts`.
- Allowed test paths: `test/reporting.characterization.test.ts`, `test/reporting/validate-report-request.test.ts`, `test/reporting/format-report-csv.test.ts`, `test/reporting/load-report-rows.test.ts`, and `test/reporting/write-report-file.test.ts`.
- Excluded work: feature changes, dependency changes, storage-schema changes, CSV-format changes, and edits to callers.
- Integrity check: `git rev-parse HEAD` returned `4c1e72a000000000000000000000000000000000`, and `git status --short` returned no entries.

### E2 - Public contract

The only public export from `src/reporting.ts` is:

```ts
export async function generateReport(
  request: ReportRequest,
  destination: string,
): Promise<ReportSummary>;
```

`ReportSummary` contains `rowCount` and `destination`.
The generated CSV header is exactly `id,name,total`.
Empty input produces only that header and a trailing newline.
Storage failures preserve error code `REPORT_READ_FAILED`.
File-write failures preserve error code `REPORT_WRITE_FAILED`.

### E3 - Caller inventory

`rg --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!dist/**' --glob '!coverage/**' 'generateReport|reporting(?:\\.js)?' .` searched the complete repository checkout and found these production callers and no others:

- `src/cli/report.ts` imports `generateReport` from `./reporting.js`.
- `src/jobs/nightly-report.ts` imports `generateReport` from `../reporting.js`.

Both callers use only the exported function and returned `ReportSummary` fields.
Inspection of every `package.json` export map, TypeScript path alias, barrel file, generated source directory, build script, test directory, and workspace package found no additional re-export or in-repository caller.
Consumers outside the repository remain outside this search and are handled separately in E11.

### E4 - Side effects and invariants

`generateReport` performs one `ReportStore.list(request.filters)` call before opening the destination file.
It writes the destination once after all rows have been formatted.
Rows retain store order.
CSV fields containing commas, quotes, or newlines use doubled-quote escaping.
The destination directory is not created implicitly.

### E5 - Baseline results

At `4c1e72a000000000000000000000000000000000` in the declared environment:

- `pnpm vitest run test/reporting.characterization.test.ts` exited `0` with 12 tests passing.
- `pnpm typecheck` exited `0`.
- `pnpm lint src/reporting.ts test/reporting.characterization.test.ts` exited `0`.
- Formatting 10,000 supplied rows took a median of 41.0 ms across five warm runs.

The characterization cases cover the signature, summary fields, header, empty rows, store order, CSV escaping, storage errors, write errors, and the single-write invariant.

### E6 - Approved boundary design

The repository maintainer approved these internal boundaries:

| Destination | Responsibility | Allowed dependencies | Prohibited dependencies |
| --- | --- | --- | --- |
| `src/reporting/validate-report-request.ts` | Validate and normalize `ReportRequest` | domain types | store and filesystem |
| `src/reporting/format-report-csv.ts` | Convert ordered rows to CSV bytes | CSV escape helper and domain types | store and filesystem |
| `src/reporting/load-report-rows.ts` | Translate `ReportStore` results and failures | `ReportStore` and domain types | filesystem |
| `src/reporting/write-report-file.ts` | Write bytes and translate write failures | `node:fs/promises` | `ReportStore` |
| `src/reporting/generate-report.ts` | Orchestrate the four collaborators | the four boundaries above | direct filesystem or store access |

`src/reporting.ts` must remain a compatibility facade at the existing import path.

### E7 - Implemented checkpoints

The synthetic repository history contains five independently recorded checkpoints.
Each `rf-*` identifier below is an immutable synthetic archive identifier for the complete source-and-test diff from its immediate predecessor, and each retained diff contains only the listed paths.

| Checkpoint | Identifier | Changed paths | Implemented result |
| --- | --- | --- | --- |
| C1 | `rf-101` | `src/reporting.ts`; `src/reporting/validate-report-request.ts`; `test/reporting/validate-report-request.test.ts` | request validation moved without changing accepted or rejected inputs |
| C2 | `rf-102` | `src/reporting.ts`; `src/reporting/format-report-csv.ts`; `test/reporting/format-report-csv.test.ts` | CSV formatting moved with byte-identical fixtures |
| C3 | `rf-103` | `src/reporting.ts`; `src/reporting/load-report-rows.ts`; `test/reporting/load-report-rows.test.ts` | store access and `REPORT_READ_FAILED` translation moved |
| C4 | `rf-104` | `src/reporting.ts`; `src/reporting/write-report-file.ts`; `test/reporting/write-report-file.test.ts` | one-write behavior and `REPORT_WRITE_FAILED` translation moved |
| C5 | `rf-105` | `src/reporting.ts`; `src/reporting/generate-report.ts` | facade delegates to the composed internal orchestrator |

The final changed-file inventory is the exact union of the checkpoint paths:

- `src/reporting.ts`;
- `src/reporting/validate-report-request.ts`;
- `src/reporting/format-report-csv.ts`;
- `src/reporting/load-report-rows.ts`;
- `src/reporting/write-report-file.ts`;
- `src/reporting/generate-report.ts`;
- `test/reporting/validate-report-request.test.ts`;
- `test/reporting/format-report-csv.test.ts`;
- `test/reporting/load-report-rows.test.ts`; and
- `test/reporting/write-report-file.test.ts`.

`test/reporting.characterization.test.ts` remained unchanged and is a validation input, not a member of the final diff.

After C5, `src/reporting.ts` contains:

```ts
export { generateReport } from "./reporting/generate-report.js";
```

The internal orchestrator retains the exact public signature from E2.

### E8 - Checkpoint verification results

For C1 through C5, the 12-test characterization command, typecheck, and scoped lint command each exited `0` at the corresponding checkpoint identifier.
At each checkpoint, the scoped lint command included the exact changed paths listed in E7 and `test/reporting.characterization.test.ts`.

At C2, every CSV fixture was byte-identical to the E5 baseline.
At C3, the storage call count and `REPORT_READ_FAILED` cases matched E4 and E2.
At C4, the file-write call count and `REPORT_WRITE_FAILED` cases matched E4 and E2.
At C5, the complete repository-wide `rg --hidden --glob '!.git/**' --glob '!node_modules/**' --glob '!dist/**' --glob '!coverage/**' 'generateReport|reporting(?:\\.js)?' .` search plus export-map, path-alias, barrel, generated-source, build-script, test, and workspace inspection returned the same two production callers and unchanged import paths from E3.

Formatting the same 10,000-row fixture after C5 took a median of 42.2 ms across five warm runs.
The measured regression is approximately 2.9 percent, which is within the 10 percent guard.

### E9 - Dependency-boundary verification

The supplied import report shows no store or filesystem import in the validator or formatter.
The row loader does not import filesystem modules.
The writer does not import `ReportStore`.
The orchestrator imports the four approved collaborators and has no direct store or filesystem import.

### E10 - Rollback and reapplication record

Each exact checkpoint path set in E7 was reverted alone in a disposable worktree based on its immediate predecessor.
After each revert, that predecessor's characterization, typecheck, and scoped lint commands exited `0`.
Each checkpoint was then reapplied, and its own three commands exited `0` again.
No unrelated working-tree changes were present during the drills.

### E11 - Approval and residual-risk record

The repository maintainer reviewed E1 through E10 and approved the internal refactor for merge review.
No public contract exception or performance exception was requested.

Consumers outside the supplied repository cannot be discovered by the repository search.
The compatibility facade must remain until the repository maintainer separately approves its removal after downstream-consumer review.

## Complete expected output

> Synthetic refactor-delivery example derived only from the supplied source and verification records.

## Status and scope

Status: ready for merge review as an internal refactor.

The change set starts at immutable commit `4c1e72a000000000000000000000000000000000` and is limited to the ten exact final paths recorded below (E1, E7).
It does not include features, dependency changes, storage-schema changes, CSV-format changes, caller edits, or public API changes (E1, E11).

## Protected contract

The public entry point remains `generateReport(request, destination): Promise<ReportSummary>` at `src/reporting.ts` (E2, E7).
`ReportSummary`, the `id,name,total` column order, empty-output newline, store ordering, CSV escaping, `REPORT_READ_FAILED`, `REPORT_WRITE_FAILED`, and the single-write behavior remain protected (E2, E4).

The complete in-repository caller set remains `src/cli/report.ts` and `src/jobs/nightly-report.ts`, and both retain their existing import paths after repository-wide search and export, alias, barrel, generated-source, build-script, test, and workspace inspection (E3, E8).
External consumers are not claimed absent (E11).

## Implemented boundary map

| File | Owned responsibility | Dependency result | Evidence |
| --- | --- | --- | --- |
| `src/reporting/validate-report-request.ts` | Request validation and normalization | Domain types only | E6, E9 |
| `src/reporting/format-report-csv.ts` | Ordered CSV byte generation | CSV helper and domain types only | E6, E8, E9 |
| `src/reporting/load-report-rows.ts` | Store access and read-error translation | Store and domain types, no filesystem | E6, E8, E9 |
| `src/reporting/write-report-file.ts` | One file write and write-error translation | Filesystem only, no store | E6, E8, E9 |
| `src/reporting/generate-report.ts` | Collaboration orchestration | Four approved internal collaborators | E6, E7, E9 |
| `src/reporting.ts` | Stable compatibility facade | Re-export of the internal orchestrator | E2, E6, E7 |

The implemented facade at `src/reporting.ts` is:

```ts
export { generateReport } from "./reporting/generate-report.js";
```

This excerpt is part of checkpoint C5, not a proposed future change (E7).

## Checkpoint record

| Checkpoint | Exact changed paths | Cohesive change | Validation result | Rollback result | Evidence |
| --- | --- | --- | --- | --- | --- |
| C1 `rf-101` | `src/reporting.ts`; `src/reporting/validate-report-request.ts`; `test/reporting/validate-report-request.test.ts` | Request validator extraction | 12 characterization tests, typecheck, and scoped lint passed | predecessor restored and C1 reapplied successfully | E7, E8, E10 |
| C2 `rf-102` | `src/reporting.ts`; `src/reporting/format-report-csv.ts`; `test/reporting/format-report-csv.test.ts` | CSV formatter extraction | required commands passed and fixtures remained byte-identical | predecessor restored and C2 reapplied successfully | E7, E8, E10 |
| C3 `rf-103` | `src/reporting.ts`; `src/reporting/load-report-rows.ts`; `test/reporting/load-report-rows.test.ts` | Store loader extraction | required commands, call count, and read-error cases passed | predecessor restored and C3 reapplied successfully | E7, E8, E10 |
| C4 `rf-104` | `src/reporting.ts`; `src/reporting/write-report-file.ts`; `test/reporting/write-report-file.test.ts` | File writer extraction | required commands, single-write check, and write-error cases passed | predecessor restored and C4 reapplied successfully | E7, E8, E10 |
| C5 `rf-105` | `src/reporting.ts`; `src/reporting/generate-report.ts` | Internal orchestration and public facade | required commands and caller reconciliation passed | predecessor restored and C5 reapplied successfully | E7, E8, E10 |

No checkpoint depends on a later checkpoint for rollback, and all drills ran without unrelated working-tree changes (E10).
Each `rf-*` checkpoint is also the immutable archive identifier for its complete independently retained source-and-test diff from the immediate predecessor (E7).

## Final changed-file inventory

- `src/reporting.ts`;
- `src/reporting/validate-report-request.ts`;
- `src/reporting/format-report-csv.ts`;
- `src/reporting/load-report-rows.ts`;
- `src/reporting/write-report-file.ts`;
- `src/reporting/generate-report.ts`;
- `test/reporting/validate-report-request.test.ts`;
- `test/reporting/format-report-csv.test.ts`;
- `test/reporting/load-report-rows.test.ts`; and
- `test/reporting/write-report-file.test.ts` [E7].

`test/reporting.characterization.test.ts` is an unchanged validation input and is not part of the final diff [E1, E7].

## Behavior and performance verification

The pre-change baseline contained 12 passing characterization tests plus passing typecheck and scoped lint at `4c1e72a000000000000000000000000000000000` (E5).
The same command set passed at every checkpoint C1 through C5 (E8).
Targeted checkpoint checks confirm byte-identical CSV, preserved storage and write call counts, unchanged translated error codes, and unchanged callers (E8).

The 10,000-row formatter median changed from 41.0 ms to 42.2 ms across the same five-warm-run method (E5, E8).
The approximately 2.9 percent regression remains below the approved 10 percent guard, so no service-owner exception is required (E8).

## Compatibility, approvals, and rollback

No public contract change is included or approved (E2, E11).
The repository maintainer reviewed the scope, boundaries, checkpoint evidence, dependency report, and rollback results and approved the internal refactor for merge review (E11).

If a merge-review check reveals drift, revert C5 through the earliest implicated checkpoint in reverse order.
After restoration, run the characterization, typecheck, and scoped lint commands and require the E5 result before retrying (E5, E10).

The compatibility facade must remain because downstream consumers outside the supplied repository have not been inventoried (E11).

## Residual risks and follow-up

| Risk or limitation | Impact | Owner role | Exit condition | Evidence |
| --- | --- | --- | --- | --- |
| Consumers outside the repository are unknown | Removing the facade could break an unobserved consumer | repository maintainer | downstream-consumer review explicitly approves facade removal | E11 |
| Performance evidence covers only one supplied fixture | Other workload shapes could behave differently | service owner | representative production-safe fixtures are measured with the same method | E5, E8 |

No public behavior, compatibility, or performance exception remains unresolved for the current internal change set (E8, E11).

## Traceability summary

- Approved scope, exact checkpoint paths, and final inventory: E1 and E7.
- Public contract and callers: E2 through E4.
- Baseline: E5.
- Approved design and implementation: E6 and E7.
- Checkpoint behavior and performance: E8.
- Dependency direction: E9.
- Rollback and reapplication: E10.
- Approval and remaining limitation: E11.
