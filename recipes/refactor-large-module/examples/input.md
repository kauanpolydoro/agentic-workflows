# Synthetic reporting module refactor evidence

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
