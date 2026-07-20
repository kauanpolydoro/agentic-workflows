# Installation

The CLI is public on npm and requires Node.js 22 or newer.

## Recommended global installation

Install the package once to make `awf` available from any project:

```bash
npm install --global @kauanpolydoro/agentic-workflows
```

Confirm the installation and display first-run guidance:

```bash
awf --version
awf
```

Run the following journey from the root of a project that should receive a workflow:

```bash
awf init --agent codex
awf list
awf show review-pull-request
awf install review-pull-request --dry-run
awf install review-pull-request --dry-run --show-content
awf install review-pull-request
awf status
awf validate . --strict
```

`awf init` saves the default agent and target in `.agentic-workflows/config.yml` so later install commands do not need to repeat them.

In an interactive terminal, you can run bare `awf init` and choose the agent and project-relative target from a short wizard.

Passing `--agent`, `--target`, or `--no-interactive` skips the wizard, which keeps scripts and CI deterministic.

If a future or unsupported configuration schema is detected, the CLI reports the detected and supported versions instead of interpreting it loosely.

Back up the existing values, then recreate the configuration explicitly with reviewed values:

```bash
awf init --force --no-interactive --agent codex --target .
```

This command replaces the configuration and does not claim to migrate unknown fields.

The dry run generates the proposed bundle in memory and prints every planned file action without changing the target.

Add `--show-content` to inspect the complete generated content after the concise plan.

The applied installation prints the entrypoint, installed files, required inputs, declared approval gates, declared effects, validation command, and removal command.

## Enable shell completion

Generate completion from the exact catalog version installed on your machine.

For Bash:

```bash
source <(awf completion bash)
```

For Zsh after `compinit` is enabled:

```zsh
source <(awf completion zsh)
```

For Fish:

```fish
awf completion fish | source
```

For PowerShell:

```powershell
awf completion pwsh | Out-String | Invoke-Expression
```

Add the command for your shell to its profile to enable completion in future sessions.

Regenerate the completion after upgrading the CLI so newly bundled workflow IDs become available.

## Run without installing globally

Use the full package scope with `npx` or `bunx`:

```bash
npx --yes @kauanpolydoro/agentic-workflows@latest list
bunx @kauanpolydoro/agentic-workflows list
```

The unscoped `agentic-workflows` package on npm is unrelated, so keep `@kauanpolydoro/agentic-workflows` in package-runner commands.

Package runners are useful for an occasional trial or an explicitly selected release.

## Pin a project or CI version

Install the package as a development dependency when the repository or CI pipeline must control the exact CLI version:

```bash
npm install --save-dev @kauanpolydoro/agentic-workflows
npx awf list
```

Commit the resulting package manifest and lockfile according to your project's dependency policy.

## Lifecycle after installation

Inspect the retained manifest and preview an update before applying it:

```bash
awf manifest review-pull-request
awf status
awf update review-pull-request --dry-run
awf update review-pull-request
```

Validate installed hashes or remove the exact managed bundle:

```bash
awf validate . --strict
awf remove review-pull-request --dry-run
awf remove review-pull-request
```

`awf status` reports each installed workflow as healthy, drifted, or invalid.

Use `awf status --failures-only` to hide healthy rows while preserving complete summary counts.

Update and removal dry runs enumerate modified and missing managed files before any mutation.

The CLI detects modified managed files and refuses to update or remove them unless `--force` is explicit.

`--force` never permits overwriting an unmanaged file.

## Diagnose the environment

Run consumer checks after installation or when a lifecycle command fails:

```bash
awf doctor
```

Show only warnings and failures while retaining summary counts with:

```bash
awf doctor --failures-only
```

The write-access check creates a uniquely named probe in the configured target and removes it immediately.

Corepack and pnpm are optional for npm package consumers and appear only as warnings when absent.

Repository maintainers can require source-development tools with:

```bash
awf doctor --maintainer
```

## Develop from source

Use this path when contributing to the repository or validating unpublished changes:

```bash
git clone https://github.com/kauanpolydoro/agentic-workflows.git
cd agentic-workflows
corepack enable
pnpm install --frozen-lockfile
pnpm build
pnpm awf list
pnpm awf install review-pull-request --agent generic --dry-run
```

Use `git@github.com:kauanpolydoro/agentic-workflows.git` only when your GitHub SSH credentials are already configured.
