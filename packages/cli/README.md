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

Run `awf completion <shell> --install-instructions` for persistent profile setup that does not modify the profile automatically.

Run bare `awf init` in an interactive terminal for a guided agent and target setup, or pass `--agent`, `--target`, or `--no-interactive` to keep automation non-interactive.

Add `--json` to initialization for a versioned machine result that also records how the project root was selected.

## Complete first workflow

Run these commands from the root of the project that should receive the workflow:

```bash
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

If the project configuration uses an unsupported schema, back it up and recreate reviewed values with `awf init --force --no-interactive --agent <agent> --target <directory>`.

Apply `update` or `remove` without `--dry-run` only after reviewing its complete file plan.

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

## Safety boundary

The package includes the versioned recipe catalog used by `list`, `show`, `install`, `update`, `remove`, and strict validation.

Installation generates adapter files and a hash-bearing manifest only inside the selected project target.

The CLI works offline during normal use, does not execute workflow content, does not satisfy human approval gates, and does not claim that an external agent produced an approved outcome.

It never overwrites an unmanaged file, including when `--force` is present.

Run `awf doctor` for consumer health checks, or `awf doctor --maintainer` when developing the Agentic Workflows source repository.

Machine diagnostics expose the selected project-root source and structured remediation while keeping lifecycle-lock recovery manual and fail-closed.

See the [installation guide](https://kauanpolydoro.github.io/agentic-workflows/guide/installation.html) and [CLI reference](https://kauanpolydoro.github.io/agentic-workflows/guide/cli-reference.html) for the complete contract.
