# CLI output contracts

`awf` separates human output from machine output so scripts never need to parse presentation text.

Use `--json` whenever another process consumes a command result.

## Stream and exit-code rules

A JSON command that completes with a normal result writes exactly one JSON value to stdout and writes nothing to stderr.

`status --json` and `doctor --json` also write their versioned report to stdout when the completed inspection is unhealthy.

In that case, stderr remains empty and the process exits with code `1`, so consumers can parse the report and act on its health fields.

An operational, validation, or syntax failure represented by the error schema writes exactly one JSON object to stderr and leaves stdout empty.

Exit code `0` means normal completion, `1` means an unhealthy report or an operational or validation failure, and `2` means invalid command syntax.

An interrupted process uses `130` for `SIGINT` and `143` for `SIGTERM` after requesting safe cancellation of the active operation.

An interrupted JSON command writes one versioned `INTERRUPTED` object to stderr and leaves stdout empty.

Human output and errors are sanitized before they reach the terminal.

The complete command-by-command meanings are listed in the [CLI exit-code reference](./cli-reference.md#exit-codes).

## Schema ownership

The following table identifies the version field that owns each machine-readable result.

| Command or mode | Top-level JSON value | Version contract |
| --- | --- | --- |
| `context --json` | Project-context report | Top-level `schema_version: 1` |
| `list --json` | Array of generated catalog recipe records | Every recipe has `schema_version: 3` |
| `show --json` | Recipe record | Recipe `schema_version: 3` |
| `show --open --json` | Documentation opener result | Top-level `schema_version: 1` |
| Applied `install`, `update`, or `remove` | Installation manifest | Manifest `schema_version: 2` |
| Lifecycle `--dry-run --json` | Command result with nested `plan` | `plan.schema_version: 1` |
| `status --json` | Status report | Top-level `schema_version: 1` |
| `validate --json` | Validation report | Top-level `schema_version: 1` |
| `doctor --json` | Diagnostic report | Top-level `schema_version: 1` |
| `init --json` | Configuration result | Top-level `schema_version: 1` |
| `manifest --json` | Installation manifest | Manifest `schema_version: 2` |
| Any failed command with `--json` | Error object | Top-level `schema_version: 1` |

## Executable schemas

The CLI package exports strict Zod schemas for every machine-readable result through one public subpath.

The core package remains the canonical schema owner for recipe and manifest data, and the CLI contract registry exposes those same schema instances instead of maintaining duplicates.

Import the parser through the public package subpath:

```js
import { parseCliOutput } from "@kauanpolydoro/agentic-workflows/output-contract";

const report = JSON.parse(stdout);
parseCliOutput("status", report);
```

Available contracts are `catalog_list`, `recipe`, `manifest`, `context`, `lifecycle_plan`, `status`, `doctor`, `init`, `validation`, `documentation_open`, and `error`.

`parseCliOutput` returns the parsed, inferred record when validation succeeds and throws a Zod validation error when the value does not satisfy that contract.

Use `catalog_list` for `list --json`, `recipe` for `show --json`, and `manifest` for applied lifecycle results or `manifest --json`.

The package smoke test imports this public subpath from an installed tarball, and subprocess automation validates real list, show, lifecycle, status, validation, diagnostic, initialization, documentation, and failure results against the schemas.

## Automation examples

These shell examples assume a global installation.

Replace `awf` with `npx awf` when the CLI is pinned as a project dependency.

In Bash, retain command failure and parse only successful stdout:

```bash
context_json="$(awf context --json)" || exit $?
printf '%s\n' "$context_json" | jq -r '.project_root'
```

In PowerShell, capture the process status before interpreting the JSON:

```powershell
$contextJson = awf context --json
$awfExitCode = $LASTEXITCODE
if ($awfExitCode -ne 0) { exit $awfExitCode }

$context = $contextJson | ConvertFrom-Json
$context.project_root
```

For Node.js automation, pin the package locally, execute its JavaScript entrypoint without a shell, and validate the result with the public contract export:

```js
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseCliOutput } from "@kauanpolydoro/agentic-workflows/output-contract";

const cli = fileURLToPath(import.meta.resolve("@kauanpolydoro/agentic-workflows"));
const result = spawnSync(process.execPath, [cli, "status", "--json"], {
  cwd: process.cwd(),
  encoding: "utf8",
});

if (result.error) throw result.error;

if (result.status === 0 || (result.status === 1 && result.stdout.trim() !== "")) {
  const report = parseCliOutput("status", JSON.parse(result.stdout));

  if (result.status === 1) {
    console.error(
      `Unhealthy installations: ${report.summary.drifted + report.summary.invalid}`,
    );
    process.exitCode = 1;
  }
} else {
  const error = parseCliOutput("error", JSON.parse(result.stderr));
  throw new Error(`[${error.code}] ${error.message}\nNext: ${error.remediation}`);
}
```

This distinction lets automation consume a completed unhealthy report without confusing it with a command failure.

## Lifecycle plan version 1

Every lifecycle dry run exposes the same nested `plan` fields.

```json
{
  "schema_version": 1,
  "operation": "install",
  "dry_run": true,
  "requires_force": false,
  "changes": {},
  "proposed_files": []
}
```

`operation` is one of `install`, `update`, or `remove`.

`proposed_files` is present only when the command supports `--show-content` and that option was requested.

The `changes` object records applicable create, replace, unchanged, retire, remove, modified, and missing file sets.

An unchanged managed file is not rewritten during an update.

The surrounding command result retains its command-specific fields for compatibility, but new automation should read the versioned `plan` object.

## Filtered diagnostics

`doctor --failures-only --json` retains `summary` counts for every check while returning only warning and failure records in `checks`.

The diagnostic report retains `projectContext.root`, `projectContext.source`, and `projectContext.reason` so automation can audit how the root was selected.

Diagnostic checks may include structured `data` and an actionable `remediation` without requiring consumers to parse `detail`.

Every diagnostic check has schema version `1` and always retains `remediation` and `data`, using `null` when no value applies.

The top-level diagnostic `status` is `pass` or `fail`, `healthy` is its boolean equivalent, and `exit_code` predicts the process result.

`status --failures-only --json` retains `summary` counts for every installation while returning only drifted and invalid records in `installations`.

Every `status --json` result includes `project_context.project_root`, `project_context.selection_source`, `project_context.project_root_fallback`, and `project_context.reason` so automation can verify the root before interpreting installation records.

The status context uses snake-case field names to match `context --json`, while `doctor --json` retains its existing `projectContext` contract.

## Error schema version 1

Every JSON error includes `schema_version`, `error`, `message`, `code`, `command`, `retryable`, `help_url`, and `remediation`.

Known operational failures use a stable `code` such as `NOT_FOUND`, `CONFLICT`, `MODIFIED_FILE`, or `INVALID_PATH`.

Unexpected failures use `UNKNOWN_ERROR` instead of omitting the field.

Structured failures include `details` with fields such as remediation, suggestions, affected paths, or validation issues.

The `command` field identifies the command boundary that failed, and `help_url` points to its published reference section.

Current CLI errors retain a command-specific offline reference in `details.help_command`.

`details` is the existing extensible record in schema version `1`, so earlier parsers continue accepting this addition without weakening the strict top-level contract.

The `retryable` field is deliberately conservative and is `true` only when retrying later can be safe without changing the request.

The `remediation` field always contains a next action, while a more specific remediation retained in `details` takes precedence.

An active lifecycle-lock conflict is the only currently retryable failure.

When its record is valid, `details` contains the sanitized `pid` and `acquiredAt`, and remediation requires verifying that owner and timestamp before manual removal.

The lock ownership token is never included in output.

Interruption uses code `INTERRUPTED`, retains `details.signal`, and preserves the same stream-isolation rules as every other JSON failure.

For example, an unsafe install target produces one stderr object and leaves stdout empty:

```json
{
  "schema_version": 1,
  "error": "AwfError",
  "message": "Target must stay inside the project root.",
  "code": "INVALID_PATH",
  "command": "install",
  "retryable": false,
  "help_url": "https://kauanpolydoro.github.io/agentic-workflows/guide/cli-reference#awf-install-workflow-id",
  "remediation": "Choose a real, project-local path without symbolic-link or traversal boundaries.",
  "details": {
    "help_command": "awf install --help"
  }
}
```

Consumers should branch on `code`, not on the human-readable `message`.

New optional fields may be added within the same schema version.

Removing a field, changing its meaning, or changing its type requires a new schema version.
