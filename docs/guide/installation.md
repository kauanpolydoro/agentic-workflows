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
awf context
awf init --agent codex
awf list
awf show review-pull-request
awf install review-pull-request --dry-run
awf install review-pull-request --dry-run --show-content
awf install review-pull-request
awf status
awf validate . --strict
```

Project-root detection prefers an explicit `--project-root`, then the nearest initialized AWF project or Git boundary, then a package root, and finally the invocation directory.

An AWF configuration nested inside a larger Git repository owns that nested project, and `awf context` shows the selected boundary before any write.

`awf init` saves the default agent and target in `.agentic-workflows/config.yml` so later install commands do not need to repeat them.

In an interactive terminal, you can run bare `awf init` and choose the agent and project-relative target from a short wizard.

Use `awf init --wizard` when input is redirected or the host cannot report an interactive terminal but a person still wants the guided prompts.

Passing `--agent`, `--target`, or `--no-interactive` skips the wizard, which keeps scripts and CI deterministic.

Those flags and `--json` cannot be combined with `--wizard`.

Use `--json` for deterministic initialization output in automation:

```bash
awf init --agent codex --target . --json
```

If a future or unsupported configuration schema is detected, the CLI reports the detected and supported versions instead of interpreting it loosely.

Back up the existing values, then recreate the configuration explicitly with reviewed values:

```bash
awf init --force --no-interactive --agent codex --target .
```

This command replaces the configuration and does not claim to migrate unknown fields.

The dry run generates the proposed bundle in memory and prints every planned file action without changing the target.

Add `--show-content` to inspect the complete generated content after the concise plan.

`--show-content` is accepted only with `--dry-run`, so content inspection cannot accidentally apply a plan.

After review, a normal install may create managed files, while `--force` may replace only previously managed files whose local changes were explicitly reviewed.

No form of `--force` allows overwriting an unmanaged file.

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

Ask the CLI for the exact persistent setup without letting it edit your profile:

```bash
awf completion zsh --install-instructions
```

Regenerate the completion after upgrading the CLI so newly bundled workflow IDs become available.

Completion options are specific to the active command, so `list` filters do not appear on `install`, and enum values are offered only after their matching option.

The repository CI loads all four generated scripts in Bash, Zsh, Fish, and PowerShell before accepting a release candidate.

## Run without installing globally

Use the full package scope with `npx` or `bunx`:

```bash
npx --yes @kauanpolydoro/agentic-workflows@latest list
bunx @kauanpolydoro/agentic-workflows list
```

The unscoped `agentic-workflows` name does not identify this project, so keep `@kauanpolydoro/agentic-workflows` in package-runner commands.

Package runners are useful for an occasional trial or an explicitly selected release.

The installed package bundles every version-matched workflow page, so `awf show <workflow-id> --location` returns a local Markdown file and `awf show <workflow-id> --open` does not depend on the documentation website.

A source checkout reads the tracked `docs/catalog` page directly, while `pnpm build` prepares the same pages for package consumers.

The npm package archive is the `.tgz` produced by `pnpm --filter @kauanpolydoro/agentic-workflows pack` and contains compiled runtime files.

GitHub source archives contain repository sources instead and require workspace dependency installation plus a build.

## Pin a project or CI version

Install an explicit package version as a development dependency when the repository or CI pipeline must control the exact CLI version:

```bash
npm install --save-dev --save-exact @kauanpolydoro/agentic-workflows@0.3.0
npx awf list
```

The pnpm equivalent is:

```bash
pnpm add --save-dev --save-exact @kauanpolydoro/agentic-workflows@0.3.0
pnpm exec awf list
```

Commit the resulting package manifest and lockfile.
The exact version in this guide is checked against the repository package version during release preparation.

## Upgrade an existing workflow bundle

The v0.3.0 CLI recognizes exact bundles installed by v0.2.2 for every historical recipe and all six adapters.
This retained compatibility keeps `status`, `manifest`, `update`, and `remove` available without treating arbitrary old manifests as trusted.

Inspect the current state and the complete proposed migration before applying it:

```bash
awf status
awf manifest <workflow-id> --json
awf update <workflow-id> --dry-run --show-content
awf update <workflow-id>
```

The update records migration provenance in the new installation manifest.
An exact historical bundle can also be removed directly with `awf remove <workflow-id>`.

Changes to manifest identity, adapter metadata, invocation, entrypoint, managed paths, roles, or retained hashes invalidate the historical fingerprint and fail closed.
Changes to managed file contents are reported as drift and require review before an explicit `--force` update or removal.

## Troubleshoot installation

Start by checking the active Node.js runtime, the installed package, and npm's global prefix:

```bash
node --version
npm list --global --depth=0 @kauanpolydoro/agentic-workflows
npm prefix --global
```

The Node.js major version must be `22` or newer.

If npm lists the package but the shell reports `awf: command not found` or an equivalent error, close and reopen the terminal before checking `PATH`.

npm links global executables into `<prefix>/bin` on Unix systems and directly into `<prefix>` on Windows.

Test the installed executable directly on Linux or macOS:

```bash
"$(npm prefix --global)/bin/awf" --version
```

Use the corresponding check in PowerShell on Windows:

```powershell
& "$(npm prefix --global)\awf.cmd" --version
```

If the direct command works, add that executable directory to the shell's `PATH`, restart the terminal, and run `awf --version` again.

If the executable is absent, repeat the global installation with the same `node` and `npm` executables that produced the inspected prefix.

Do not solve an `EACCES` global-installation error by adding `sudo` to the npm command.

The npm documentation recommends installing Node.js through a version manager or changing npm's prefix to a user-owned directory on Unix systems.

Follow npm's [official EACCES recovery guide](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally/) because the appropriate setup depends on the operating system and shell.

To separate a global `PATH` problem from a package problem, run the CLI through npm's temporary package environment:

```bash
npm exec --yes --package=@kauanpolydoro/agentic-workflows@latest -- awf doctor
```

If that command works, the package binary is usable and the remaining issue is the global installation or its `PATH` entry.

Use the full scoped package name with `npx` or `bunx` for one-off runs.

Use `npx awf` only after installing the package in the current project, and prefer an explicitly approved version plus a committed lockfile in CI.

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

Use `awf status --json` when scripts must retain the selected project root and its discovery source alongside those health records.

Update and removal dry runs enumerate modified and missing managed files before any mutation.

The CLI detects modified managed files and refuses to update or remove them unless `--force` is explicit.

`--force` never permits overwriting an unmanaged file.

## Diagnose the environment

Run consumer checks after installation or when a lifecycle command fails:

```bash
awf doctor
```

When a lifecycle lock blocks an operation, read the PID and acquisition time in the error, confirm that the process is inactive and the timestamp is stale, and run `awf doctor` before manually removing the lock.

The CLI never steals or removes a lifecycle lock automatically.

The `lifecycle-transactions` check reports staged transaction directories left by an abnormal process exit without deleting them.

Confirm that no lifecycle process owns the target, preserve any state needed for recovery, run `awf status` and `awf validate <target> --strict`, reconcile managed files, remove only the exact directories proven abandoned, and rerun `awf doctor`.

On POSIX systems, if a command using `--json` is interrupted, wait for exit code `130` or `143`, parse the single `INTERRUPTED` object from stderr, and run the returned remediation before retrying.

Windows forced termination has platform-defined process status, while the tested safety invariant is that terminating guided initialization before selection leaves no partial configuration.

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

GitHub's generated source archives follow the same source setup path and are not substitutes for the built npm `.tgz` artifact.
