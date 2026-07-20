# CLI reference

The command-line tool is called `awf`.
It reads the bundled catalog and only ever writes files inside the project you point it at.

Exit codes are predictable: `0` means success, `1` means a validation or operational error, `2` means the command line itself was malformed, and `130` means you pressed Ctrl+C.

## `awf list`

Print the catalog.
Narrow the list with filters such as `--category`, `--agent`, `--tag`, `--adapter-status`, `--compatibility`, `--installation`, `--execution`, and `--outcome`, or get machine-readable output with `--json`.

Two filters look similar but answer different questions.
`--adapter-status` asks about an agent's exporter as a whole, while `--compatibility` asks whether one specific recipe can be exported for that agent.
Any filter that depends on an agent requires `--agent`, and combined filters narrow the list together rather than widening it.

Installation, execution, and outcome are independent evidence stages; filtering on one says nothing about the others.

## `awf show <workflow-id>`

Print everything about one workflow.
Use `--raw` for the original Markdown, `--json` for structured metadata, or `--open` to open the local documentation page with your operating system's default opener.

## `awf install <workflow-id>`

Copy a workflow into your project.
Useful flags: `--agent` picks the output format, `--target` picks the directory, `--dry-run` shows the plan without writing anything, `--force` allows overwriting, and `--json` switches the output format.

The install is transactional: the entrypoint, checklist, complete examples, recipe metadata, and any adapter policy file land together or not at all.
The CLI also writes a manifest with file hashes under `.agentic-workflows/installations/`, which is how later updates and removals know which files belong to them.
The target directory must stay inside the detected project root.
After installing, the CLI prints how to invoke the workflow with the chosen agent.

Remember that installing only copies files.
It says nothing about whether an agent has run the workflow or how well that went.

## `awf update <workflow-id>`

Rebuild an installed bundle using the adapter recorded at install time.
Files you have edited by hand are detected through their hashes and left alone unless you pass `--force`.

## `awf remove <workflow-id>`

Delete the files that belong to the installed bundle, and nothing else.
As with `update`, files you have modified are preserved unless you pass `--force`.

## `awf validate [path]`

Check a catalog, a single recipe, a manifest, or an installation target.
Add `--strict` to also run the editorial content checks on recipes and to verify installation file hashes.
Use `--json` for machine-readable results.

## `awf doctor`

Run a health check: Node compatibility, configuration, project root, write access, catalog integrity, installation integrity, and whether known agent commands are available on your machine.

Finding an agent command on your PATH does not mean any workflow has been tested with it.

## `awf init`

Create `.agentic-workflows/config.yml` with a default adapter and target so you do not have to repeat flags on every command.
An existing configuration is never overwritten unless you pass `--force`.

## `awf manifest <workflow-id>`

Inspect the validated manifest of an installed workflow, with optional `--target` and `--json`.

## Output behavior

Human-readable output contains no terminal control sequences and stays plain when `NO_COLOR` is set.
With `--json`, commands print exactly one JSON value and no decorative text.
