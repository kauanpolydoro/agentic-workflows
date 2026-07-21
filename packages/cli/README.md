# Agentic Workflows CLI

`awf` browses and safely installs evidence-oriented workflow bundles for coding agents.

Node.js 22 or newer is required.

## Install once

Install the public package globally to make the short `awf` command available in every project:

```bash
npm install --global @kauanpolydoro/agentic-workflows
```

Run `awf` without arguments for first-run help:

```bash
awf
```

Generate tab completion for Bash, Zsh, Fish, or PowerShell with `awf completion <shell>`.

The generated completion is command-specific and completes workflow IDs, agents, categories, tags, adapter status, compatibility, and verification states where they apply.

Run `awf completion <shell> --install-instructions` for persistent profile setup that does not modify the profile automatically.

Run bare `awf init` in an interactive terminal for a guided agent and target setup, or pass `--agent`, `--target`, or `--no-interactive` to keep automation non-interactive.

Add `--json` to initialization for a versioned machine result that also records how the project root was selected.

## Complete first workflow

Run these commands from the root of the project that should receive the workflow:

```bash
# Confirm which project root will be used.
awf context

# Save a default agent and target for this project.
awf init --agent codex

# Discover and inspect a workflow before installing it.
awf list
awf show review-pull-request

# Preview every generated file without changing the project.
awf install review-pull-request --dry-run

# Include the complete proposed content when a path needs closer review.
awf install review-pull-request --dry-run --show-content

# Apply the reviewed installation and verify its hashes.
awf install review-pull-request
awf validate . --strict
```

After installation, `awf` prints the generated entrypoint and the exact agent invocation when the selected adapter defines one.

Use the manifest-backed lifecycle commands to inspect, update, or remove the bundle later:

```bash
awf manifest review-pull-request
awf status
awf update review-pull-request --dry-run
awf remove review-pull-request --dry-run
```

`awf status` reports healthy installations, modified or missing managed files, and invalid manifests without changing the project.

Use `awf status --failures-only` to focus on drift while retaining complete summary counts.

Use `awf status --json` when automation must also verify the selected project root, its discovery source, and whether current-directory fallback occurred.

If the project configuration uses an unsupported schema, back it up and recreate reviewed values with `awf init --force --no-interactive --agent <agent> --target <directory>`.

Apply `update` or `remove` without `--dry-run` only after reviewing its complete file plan.

`--show-content` requires `--dry-run`, and `--force` never authorizes overwriting an unmanaged file.

## Run without a global installation

Use the full scoped package name with a package runner:

```bash
npx --yes @kauanpolydoro/agentic-workflows@latest list
bunx @kauanpolydoro/agentic-workflows list
```

The unscoped `agentic-workflows` package on npm is a different project.

For reproducible CI or team usage, install a pinned project dependency and invoke its short binary:

```bash
npm install --save-dev @kauanpolydoro/agentic-workflows
npx awf list
```

## Installation troubleshooting

Check the runtime, installed package, and global prefix when `awf` is unavailable after a global installation:

```bash
node --version
npm list --global --depth=0 @kauanpolydoro/agentic-workflows
npm prefix --global
```

Node.js 22 or newer is required.

npm links global executables into `<prefix>/bin` on Unix systems and directly into `<prefix>` on Windows, so restart the terminal and confirm that directory is present in `PATH`.

Do not use `sudo` to bypass an `EACCES` installation error.

Use a Node.js version manager, a user-owned npm prefix, or a one-off package environment instead:

```bash
npm exec --yes --package=@kauanpolydoro/agentic-workflows@latest -- awf doctor
```

The tarball produced by this source revision includes `docs/guide/installation.md`, `docs/guide/cli-reference.md`, `docs/guide/output-contracts.md`, and every `docs/catalog/<workflow-id>.md` page for version-matched offline reference.

Use `awf show <workflow-id> --location` to print the bundled page path or `awf show <workflow-id> --open` to open it locally.

## Safety boundary

The package includes the versioned recipe catalog used by `list`, `show`, `install`, `update`, `remove`, and strict validation.

Installation generates adapter files and a hash-bearing manifest only inside the selected project target.

The CLI works offline during normal use, does not execute workflow content, does not satisfy human approval gates, and does not claim that an external agent produced an approved outcome.

It never overwrites an unmanaged file, including when `--force` is present.

Run `awf doctor` for consumer health checks, or `awf doctor --maintainer` when developing the Agentic Workflows source repository.

Machine diagnostics expose the selected project-root source and structured remediation while keeping lifecycle-lock recovery manual and fail-closed.

Every error also prints an offline `awf <command> --help` path and retains the matching `details.help_command` in JSON output.

If a lifecycle lock blocks an operation, human output identifies the recorded PID and acquisition time without exposing the ownership token, then explains how to verify staleness before manual removal.

SIGINT and SIGTERM preserve the selected output mode after safe cancellation.

Human commands receive a coded recovery message, while commands using `--json` receive one versioned `INTERRUPTED` object on stderr and leave stdout empty.

Node.js automation can validate the published versioned records with the public subpath export:

```js
import { parseCliOutput } from "@kauanpolydoro/agentic-workflows/output-contract";

const status = JSON.parse(capturedStdout);
parseCliOutput("status", status);
```

The same registry validates `catalog_list`, `recipe`, and `manifest` records, so consumers do not need a second schema import for `list`, `show`, or lifecycle output.

See the [installation guide](https://kauanpolydoro.github.io/agentic-workflows/guide/installation.html), [CLI reference](https://kauanpolydoro.github.io/agentic-workflows/guide/cli-reference.html), and [output contracts](https://kauanpolydoro.github.io/agentic-workflows/guide/output-contracts.html) for the complete contract.
