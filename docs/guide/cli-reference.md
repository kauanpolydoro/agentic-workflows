# CLI reference

The command-line tool is called `awf`.

It reads the bundled catalog and writes only inside the detected or explicit project root.

Run `awf` without arguments for actionable help, or run `awf <command> --help` for every option accepted by one command.

Use the global `--project-root <directory>` option when auto-detection should not select the nearest Git repository, initialized AWF project, or package root.

Exit code `0` means success, `1` means a validation or operational error, `2` means the command line is malformed, `130` means interruption by `SIGINT`, and `143` means interruption by `SIGTERM`.

## `awf list`

Print the catalog.

Narrow the list with `--category`, `--agent`, `--tag`, `--adapter-status`, `--compatibility`, `--installation`, `--execution`, and `--outcome`.

Use `--json` for complete machine-readable catalog records.

An empty human result explains how to clear the filters, while an empty JSON result remains `[]`.

`--adapter-status` asks about an agent exporter as a whole, while `--compatibility` asks whether one recipe can be exported for that agent.

Any status filter that depends on an agent requires `--agent`.

Combined filters narrow the list together.

Installation, execution, and outcome are independent evidence stages, so filtering on one says nothing about the others.

## `awf show <workflow-id>`

Print the workflow identity, difficulty, duration, tags, inputs, outputs, approvals, effects, and agent compatibility in human mode.

Use `--agent` to focus compatibility details and limitations on one destination.

Use `--raw` for the canonical workflow Markdown or `--json` for complete structured recipe metadata.

Use `--location` to print the local documentation path or public catalog URL without launching another process.

Use `--open` to open a repository-local documentation page when available, or the public catalog page from the npm package.

The three output modes are mutually exclusive.

An unknown workflow ID reports nearby IDs when a reliable match exists.

## `awf install <workflow-id>`

Generate and copy a complete workflow bundle into a project.

`--agent` selects the destination format, and `--target` selects a directory inside the project root.

`--dry-run` prints create, replace, unchanged, retire, modified, and missing file sets without changing the target.

Add `--show-content` to an install dry run to print the complete proposed generated files.

The dry-run JSON result retains the installation manifest fields and adds a versioned `plan` object.

`--show-content` without `--dry-run` is rejected because content preview is not an installation mode.

`--json` prints the applied installation manifest instead of human guidance.

`--force` replaces an existing managed installation of the same workflow after integrity checks.

It never permits overwriting an unmanaged file.

The install is transactional, so the entrypoint, checklist, complete examples, metadata, output schema, policy file when required, and manifest land together or not at all.

The hash-bearing manifest under `.agentic-workflows/installations/` lets later updates and removals distinguish managed files from local edits.

After installation, the human output includes the invocation policy and exact command when the adapter defines one.

Installing files does not execute a workflow, approve its declared effects, or prove outcome quality.

## `awf update <workflow-id>`

Rebuild an installed bundle using the adapter recorded at installation time.

`--dry-run` prints create, replace, unchanged, retire, modified, and missing file sets without changing the target.

Files whose generated content and retained hash are identical appear under `unchanged` and are not rewritten.

Add `--show-content` to print the complete proposed generated files after the human plan or inside the JSON plan.

Files changed locally are preserved unless `--force` explicitly authorizes replacing managed files.

An unmanaged destination remains protected even with `--force`.

Use `--json` for the structured update plan or resulting manifest.

## `awf remove <workflow-id>`

Delete the files recorded in the installation manifest and then remove that manifest.

`--dry-run` lists every file that would be removed, including modified and missing managed files, without changing the target.

Locally modified managed files are preserved unless `--force` explicitly authorizes their removal.

Use `--json` to retain the removed manifest in machine-readable output.

## `awf status [workflow-id]`

Inspect all local installation manifests or one selected workflow without changing files.

Human output reports the agent, recipe version, file count, and a health state of `healthy`, `drifted`, or `invalid`.

Drift details identify each modified or missing managed file.

Use `--target` to inspect another project-local target.

Use `--json` for a report with `schema_version`, `target`, and `installations` fields.

The command exits with code `1` when any selected installation is drifted or invalid.

Selecting a workflow that is not installed returns `NOT_FOUND` with a preview command instead of an empty report.

## `awf validate [path]`

Check a catalog, one recipe, an installation manifest, or an installation target.

Add `--strict` to run editorial content checks for recipes and installed-file hash checks for targets.

Use `--json` for a structured success result or a structured error with issue codes, paths, and remediation.

## `awf doctor`

Run consumer health checks for Node compatibility, configuration, project root, target write access, catalog integrity, generated artifacts, installation integrity, lifecycle locks, and known agent commands.

The target write check creates a unique temporary probe and removes it immediately.

Missing Corepack or pnpm is a warning for npm package consumers.

Use `--maintainer` to treat those source-development tools as required.

Use `--failures-only` to retain the full pass, warning, and failure summary while omitting passing check records from human and JSON output.

Finding an agent command on `PATH` does not establish workflow execution or outcome evidence.

## `awf init`

Create `.agentic-workflows/config.yml` with a default agent and target.

Running bare `awf init` in an interactive terminal starts a short agent and target wizard.

Non-interactive execution keeps deterministic defaults of `generic` and `.`, and providing `--agent`, `--target`, or `--no-interactive` skips the wizard.

Use `--agent` and `--target` to choose those defaults.

An existing configuration is never replaced unless `--force` is explicit.

When no Git, AWF configuration, or package marker exists, human project commands report that the current directory was selected and suggest `--project-root`.

JSON commands stay machine-only and do not emit that notice.

## `awf manifest <workflow-id>`

Inspect and validate an installed workflow manifest.

Use `--target` to select another project-local target and `--json` to print JSON instead of YAML.

## `awf completion <shell>`

Generate deterministic tab completion for `bash`, `zsh`, `fish`, or PowerShell (`pwsh`).

The generated script includes commands, options, agents, shell names, and the workflow IDs bundled with the installed CLI version.

The command performs no network access and can be regenerated after upgrading the package.

## Output and error contract

Human-readable output contains no terminal control sequences and remains plain when `NO_COLOR` is set.

Human errors preserve the stable error code and include structured issue remediation when available.

With `--json`, successful commands print exactly one JSON value to stdout and no decorative text.

With `--json`, failures print exactly one object to stderr and leave stdout empty.

Every JSON error contains `error` and `message`, includes a stable `code` when available, and includes `details` for structured diagnostics.

See the [CLI output contracts](./output-contracts) for the schema owner and compatibility rules of every JSON mode.
