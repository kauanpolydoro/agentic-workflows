# CLI output contracts

`awf` separates human output from machine output so scripts never need to parse presentation text.

Use `--json` whenever another process consumes a command result.

## Stream and exit-code rules

A successful JSON command writes exactly one JSON value to stdout and writes nothing to stderr.

A failed JSON command writes exactly one JSON object to stderr and leaves stdout empty.

Exit code `0` means success, `1` means an operational or validation failure, and `2` means invalid command syntax.

An interrupted process uses `130` for `SIGINT` and `143` for `SIGTERM` after requesting safe cancellation of the active operation.

Human output and errors are sanitized before they reach the terminal.

## Schema ownership

The following table identifies the version field that owns each machine-readable result.

| Command or mode | Top-level JSON value | Version contract |
| --- | --- | --- |
| `list --json` | Array of recipe records | Every recipe has `schema_version: 2` |
| `show --json` | Recipe record | Recipe `schema_version: 2` |
| Applied `install`, `update`, or `remove` | Installation manifest | Manifest `schema_version: 2` |
| Lifecycle `--dry-run --json` | Command result with nested `plan` | `plan.schema_version: 1` |
| `status --json` | Status report | Top-level `schema_version: 1` |
| `validate --json` | Validation report | Top-level `schema_version: 1` |
| `doctor --json` | Diagnostic report | Top-level `schema_version: 1` |
| `manifest --json` | Installation manifest | Manifest `schema_version: 2` |
| Any failed command with `--json` | Error object | Top-level `schema_version: 1` |

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

## Error schema version 1

Every JSON error includes `schema_version`, `error`, and `message`.

Known operational failures also include a stable `code` such as `NOT_FOUND`, `CONFLICT`, `MODIFIED_FILE`, or `INVALID_PATH`.

Structured failures include `details` with fields such as remediation, suggestions, affected paths, or validation issues.

Consumers should branch on `code`, not on the human-readable `message`.

New optional fields may be added within the same schema version.

Removing a field, changing its meaning, or changing its type requires a new schema version.
