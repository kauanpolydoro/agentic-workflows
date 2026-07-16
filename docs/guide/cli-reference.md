# CLI reference

`awf` reads the bundled catalog and writes only beneath the selected project target.
Commands return exit code `0` on success, `1` for validation or operational errors, `2` for command-line usage errors, and `130` after Ctrl+C.

## `awf list`

List recipes with optional `--category`, `--agent`, `--tag`, `--adapter-status`, `--compatibility`, `--installation`, `--execution`, `--outcome`, or `--json` filters.

`--adapter-status` describes the global exporter contract, while `--compatibility` describes the selected recipe's declaration.

Installation, execution, and outcome are independent evidence stages.

Every adapter-specific status filter requires `--agent`, and combined dimensions use AND against that same adapter.

## `awf show <workflow-id>`

Show metadata.
Use `--raw` for canonical Markdown, `--json` for structured metadata, or `--open` to launch the local documentation with the operating-system opener.

## `awf install <workflow-id>`

Install with `--agent`, `--target`, `--dry-run`, `--force`, or `--json`.
Targets must remain inside the detected project root.
The command installs the entrypoint, checklist, complete examples, recipe metadata, and any adapter policy file as one transaction.
It creates a hash-bearing manifest under `.agentic-workflows/installations/` and prints adapter-specific explicit invocation guidance.

Installation does not prove external agent execution or outcome quality.

## `awf update <workflow-id>`

Regenerate an installed bundle from its recorded adapter.
Every managed file is checked, and modified files are preserved unless `--force` is explicit.

## `awf remove <workflow-id>`

Remove only files that belong to the exact current adapter bundle and are registered in the manifest.
Modified files are preserved unless `--force` is explicit.

## `awf validate [path]`

Validate a catalog, recipe, manifest, or installation target.
`--strict` adds editorial content contracts for recipes and hash integrity checks for installations.
Use `--json` for machine-readable output.

## `awf doctor`

Report Node compatibility, configuration, project root, write access, catalog integrity, installation integrity, and local agent-command availability.

Detecting an agent command does not mark execution as tested.

## `awf init`

Create `.agentic-workflows/config.yml` with a default adapter and target.
The command does not overwrite an existing configuration unless `--force` is explicit.

## `awf manifest <workflow-id>`

Inspect a validated manifest with optional `--target` and `--json` controls.

Human output strips terminal control sequences and remains plain when `NO_COLOR` is set.
JSON mode writes one JSON value without decorative text.
