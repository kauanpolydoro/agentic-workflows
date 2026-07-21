# Agentic Workflows

Install inspectable engineering workflows into Codex, Claude Code, Cursor, Gemini CLI, OpenCode, or any tool that can follow Markdown.

Agentic Workflows is a catalog of 20 evidence-oriented workflow bundles plus an offline CLI that installs them safely inside a project.
It gives coding agents explicit inputs, prerequisites, observable steps, decision points, approval gates, expected outputs, and completion criteria for work such as pull-request review, CI debugging, migrations, security review, testing, and documentation.

![Agentic Workflows terminal demonstration](https://raw.githubusercontent.com/kauanpolydoro/agentic-workflows/main/docs/public/terminal-demo.svg)

[Read in Brazilian Portuguese](https://github.com/kauanpolydoro/agentic-workflows/blob/main/README.pt-BR.md) | [Documentation](https://kauanpolydoro.github.io/agentic-workflows/) | [Workflow catalog](https://kauanpolydoro.github.io/agentic-workflows/catalog/) | [npm package](https://www.npmjs.com/package/@kauanpolydoro/agentic-workflows)

## Why use it

- Start from a complete, reviewable procedure instead of rebuilding a long prompt for every task.
- Preview the exact files and content before installing a workflow.
- Export the same canonical recipe to the project-local format expected by each supported agent.
- Update or remove managed bundles without silently discarding local edits.
- Keep structural validation, installation tests, external-agent execution, and human outcome review as separate evidence states.

A recipe is a seven-file data and documentation bundle, not an executable plugin.
The CLI serializes that bundle for a selected agent and writes it locally, but it never executes the recipe or grants permission for the effects described by it.

## Quick start

The public CLI package requires Node.js 22 or newer.
Install it globally once to make `awf` available from any project:

```bash
npm install --global @kauanpolydoro/agentic-workflows
```

The following Codex example goes from an empty project configuration to an installed and inspectable workflow:

```bash
cd your-project
awf context
awf init --agent codex
awf list
awf show review-pull-request
awf install review-pull-request --dry-run --show-content
awf install review-pull-request
awf status
```

`awf context` reports the selected project root without changing files.
`awf init --agent codex` writes the project defaults to `.agentic-workflows/config.yml`.
The dry run then shows every planned file and its complete generated content without changing the installation target.
The second install command writes the reviewed bundle and its hash-bearing manifest.

After installation, invoke the workflow explicitly in Codex:

```text
$review-pull-request Review pull request #123 against its stated acceptance criteria.
```

The successful install output always prints the exact entrypoint and invocation command for the selected adapter.
Installing the package itself does not start a wizard or modify a project.

Run bare `awf` for first-use help.
Run bare `awf init` in an interactive terminal to choose the default agent and target through a short wizard.
Use `awf init --wizard` to force those prompts when the host cannot report an interactive terminal.
Supplying `--agent`, `--target`, or `--no-interactive` skips the wizard for deterministic scripts and CI, and those options cannot be combined with `--wizard`.

## Choose an agent

Use the value in the second column with `awf init --agent <agent>` or `awf install <workflow-id> --agent <agent>`.

| Destination | Agent value | Installed entrypoint | Explicit invocation |
| --- | --- | --- | --- |
| Generic Markdown | `generic` | `.agentic-workflows/workflows/<workflow-id>/workflow.md` | Open and follow the installed document manually |
| Claude Code | `claude-code` | `.claude/skills/<workflow-id>/SKILL.md` | `/<workflow-id>` |
| OpenAI Codex | `codex` | `.agents/skills/<workflow-id>/SKILL.md` | `$<workflow-id>` |
| Cursor | `cursor` | `.cursor/skills/<workflow-id>/SKILL.md` | `/<workflow-id>` |
| Gemini CLI | `gemini-cli` | `.gemini/commands/<workflow-id>.toml` | `/<workflow-id>` |
| OpenCode | `opencode` | `.opencode/commands/<workflow-id>.md` | `/<workflow-id>` |

For example, a Claude Code, Cursor, Gemini CLI, or OpenCode installation of `review-pull-request` is invoked with:

```text
/review-pull-request Review pull request #123 against its stated acceptance criteria.
```

Supported means the format is confirmed, the exporter is implemented, and local generation plus installation contract tests pass.
It does not mean that an external agent executed the workflow or that a human reviewed its outcome.
See the [adapter source research](https://github.com/kauanpolydoro/agentic-workflows/blob/main/docs/research/adapter-sources.md) and [generated compatibility matrix](https://github.com/kauanpolydoro/agentic-workflows/blob/main/docs/compatibility.md) for the exact evidence behind each status.

## Try without a global installation

Use the complete package scope with either package runner:

```bash
npx --yes @kauanpolydoro/agentic-workflows@latest list
bunx @kauanpolydoro/agentic-workflows list
```

The unscoped `agentic-workflows` name belongs to a different package on npm.
Keep `@kauanpolydoro/agentic-workflows` in `npx` and `bunx` commands.

Pin the CLI in a project or CI environment when reproducibility matters:

```bash
npm install --save-dev @kauanpolydoro/agentic-workflows
npx awf context --json
npx awf list --json
```

If `awf` is unavailable after a global installation, use the [installation troubleshooting guide](https://github.com/kauanpolydoro/agentic-workflows/blob/main/docs/guide/installation.md#troubleshoot-installation) to check Node.js, npm's prefix, `PATH`, and permissions.

## Featured workflows

- [`review-pull-request`](https://kauanpolydoro.github.io/agentic-workflows/catalog/review-pull-request) reviews correctness, regressions, security, maintainability, and test evidence.
- [`debug-failing-ci`](https://kauanpolydoro.github.io/agentic-workflows/catalog/debug-failing-ci) moves from the first causal log through falsifiable hypotheses to a minimal fix.
- [`database-migration-review`](https://kauanpolydoro.github.io/agentic-workflows/catalog/database-migration-review) evaluates locks, data loss, mixed-version compatibility, and rollout recovery.
- [`security-review`](https://kauanpolydoro.github.io/agentic-workflows/catalog/security-review) stays strictly defensive and requires explicit authorized scope.

[Browse all 20 workflows](https://kauanpolydoro.github.io/agentic-workflows/catalog/) or filter them locally with `awf list --category <category>`, `--agent <agent>`, or `--tag <tag>`.

## See a complete result

The `write-release-notes` golden recipe includes a [self-contained synthetic input](https://github.com/kauanpolydoro/agentic-workflows/blob/main/recipes/write-release-notes/examples/input.md) and its [complete expected release-note artifact](https://github.com/kauanpolydoro/agentic-workflows/blob/main/recipes/write-release-notes/examples/expected-output.md).
Every material statement in that expected output maps to an evidence ID from the input.
The pair is an editorial reference maintained in the repository, not evidence that an external agent executed the recipe or that a real release outcome was approved.

The reproducible demonstration also checks maintained reference outputs for `debug-failing-ci`, `review-pull-request`, and `synchronize-documentation` against their output contracts.
See the [reference-evaluation record](https://github.com/kauanpolydoro/agentic-workflows/blob/main/docs/launch/reference-evaluations.md) for claim traces and the explicit verification boundary.

## How it works

1. Inspect the canonical Markdown and strict YAML metadata under `recipes/`.
2. Ask `awf` to serialize one recipe for a selected agent and preview the resulting lifecycle plan.
3. Install the reviewed bundle inside the selected project root.
4. Use the retained manifest and hashes for safe status checks, updates, or removal.
5. Record external-agent execution and human outcome evidence separately when those activities actually occur.

The repository keeps each responsibility explicit:

| Location | Responsibility |
| --- | --- |
| `recipes/` | Canonical YAML and Markdown recipe data |
| `packages/core/` | Schemas, parsing, path safety, hashes, manifests, filters, compatibility, and adapter serialization |
| `packages/cli/` | Terminal interaction and local filesystem lifecycle orchestration |
| `scripts/generate.ts` | JSON Schema, catalog JSON, workflow pages, and compatibility documentation generation |

## Safety and verification

The CLI operates offline during normal use, has no telemetry, and never executes recipe instructions.
It validates project containment, symlink parents, overwrite intent, and managed-file hashes under tested local filesystem conditions.
It refuses to overwrite unmanaged files or silently remove modified managed files.
These controls are not a security boundary against a privileged process racing filesystem changes.

The project reports four independent verification stages:

| Stage | What it proves |
| --- | --- |
| Structural validation | The recipe satisfies its schema and directory contract |
| Installation testing | The CLI lifecycle works in a disposable target |
| External-agent execution | A named agent version actually ran the workflow |
| Human outcome review | A reviewer evaluated the produced result against completion criteria |

No external-agent adapter currently has retained evidence that promotes external execution or human outcome review to passing.
Generic Markdown reports consumer parsing, external execution, and outcome review as `not-applicable` because it is documentation rather than an agent integration.
Historical Claude Code and Codex artifacts remain archived, but their source commit left the repository during the intentional history reset and they do not promote current status.
Passing repository tests do not substitute for an external-agent run.

## CLI reference

| Command | Purpose |
| --- | --- |
| `awf context` | Explain which project root was selected and why |
| `awf list` | Discover and filter bundled workflows |
| `awf show <workflow-id>` | Inspect metadata, raw Markdown, or version-matched local documentation |
| `awf install <workflow-id>` | Preview or install an agent-specific workflow bundle |
| `awf status [workflow-id]` | Report healthy, drifted, or invalid local installations |
| `awf update <workflow-id>` | Preview or apply an update while protecting local modifications |
| `awf remove <workflow-id>` | Preview or remove managed files while protecting local modifications |
| `awf validate [path]` | Validate a catalog, recipe, manifest, or installation target |
| `awf doctor` | Diagnose configuration, catalog, installation, and recovery state |
| `awf init` | Configure project defaults interactively or deterministically |
| `awf manifest <workflow-id>` | Print the exact installed manifest |
| `awf completion <shell>` | Generate Bash, Zsh, Fish, or PowerShell completion |

`awf show <workflow-id> --open` asks the operating system's native document handler to open the version-matched local page.
It does not promise that the handler is a web browser.

Human-readable output is the default.
Machine-readable commands use versioned JSON contracts, and automation should validate them through the public `@kauanpolydoro/agentic-workflows/output-contract` export.

| Exit code | Meaning |
| --- | --- |
| `0` | Success, including healthy or warning-only reports |
| `1` | Operational failure, validation failure, or unhealthy report |
| `2` | Invalid command syntax or incompatible options |
| `130` or `143` | POSIX interruption through `SIGINT` or `SIGTERM` |

Run `awf <command> --help` for command-specific options.
Read the [complete CLI reference](https://github.com/kauanpolydoro/agentic-workflows/blob/main/docs/guide/cli-reference.md) for filters, JSON streams, lifecycle semantics, and exit-code details.

Generate shell completion with `awf completion bash`, `awf completion zsh`, `awf completion fish`, or `awf completion pwsh`.
Add `--install-instructions` to print persistent setup guidance without modifying your shell profile.

## Develop and contribute

Clone the source repository over HTTPS and build it before invoking the local CLI:

```bash
git clone https://github.com/kauanpolydoro/agentic-workflows.git
cd agentic-workflows
corepack enable
pnpm install --frozen-lockfile
pnpm build
pnpm awf list
pnpm awf show review-pull-request
```

`pnpm awf` runs compiled output, so `pnpm build` is required after a fresh clone.
GitHub source archives also require dependency installation and a build.
The npm CLI archive is produced with `pnpm --filter @kauanpolydoro/agentic-workflows pack` and contains the compiled CLI, bundled catalog, and version-matched offline documentation.

Create a recipe scaffold with:

```bash
pnpm new:recipe my-workflow
```

Every complete recipe contains `recipe.yml`, `workflow.md`, `checklist.md`, `README.md`, `output.schema.json`, `examples/input.md`, and `examples/expected-output.md`.
Replace every scaffold marker, use original examples, declare support honestly, and follow the [recipe quality standard](https://github.com/kauanpolydoro/agentic-workflows/blob/main/docs/quality/recipe-quality-standard.md).
The [contribution guide](https://github.com/kauanpolydoro/agentic-workflows/blob/main/CONTRIBUTING.md) is the authoritative source for the complete validation suite required before handoff.

The root `README.md` is canonical for the CLI package.
The build copies it into the npm archive, which keeps the GitHub and npm landing pages synchronized for each published version.

## Documentation map

| Need | Resource |
| --- | --- |
| Install or troubleshoot the CLI | [Installation guide](https://github.com/kauanpolydoro/agentic-workflows/blob/main/docs/guide/installation.md) |
| Inspect every CLI flag and output | [CLI reference](https://github.com/kauanpolydoro/agentic-workflows/blob/main/docs/guide/cli-reference.md) |
| Validate JSON in automation | [Output contracts](https://github.com/kauanpolydoro/agentic-workflows/blob/main/docs/guide/output-contracts.md) |
| Understand evidence states | [Verification model](https://github.com/kauanpolydoro/agentic-workflows/blob/main/docs/guide/verification.md) |
| Author or review a recipe | [Authoring guide](https://github.com/kauanpolydoro/agentic-workflows/blob/main/docs/guide/authoring.md) |
| Compare agent support | [Compatibility matrix](https://github.com/kauanpolydoro/agentic-workflows/blob/main/docs/compatibility.md) |
| Contribute changes | [CONTRIBUTING.md](https://github.com/kauanpolydoro/agentic-workflows/blob/main/CONTRIBUTING.md) |
| Report a vulnerability privately | [SECURITY.md](https://github.com/kauanpolydoro/agentic-workflows/blob/main/SECURITY.md) |
| Review shipped and planned work | [CHANGELOG.md](https://github.com/kauanpolydoro/agentic-workflows/blob/main/CHANGELOG.md) and [ROADMAP.md](https://github.com/kauanpolydoro/agentic-workflows/blob/main/ROADMAP.md) |

## Project status

The CLI and shared core packages are public on npm.
Releases are tag-driven and use npm trusted publishing, provenance, package smoke tests, and integrity verification before GitHub release synchronization.
See the [changelog](https://github.com/kauanpolydoro/agentic-workflows/blob/main/CHANGELOG.md) and [release process](https://github.com/kauanpolydoro/agentic-workflows/blob/main/RELEASING.md) for the current version and delivery contract.

Recipes are untrusted data and documentation.
Review a recipe before asking an agent to follow it, and use the private process in [SECURITY.md](https://github.com/kauanpolydoro/agentic-workflows/blob/main/SECURITY.md) for vulnerabilities.

Released under the [MIT License](https://github.com/kauanpolydoro/agentic-workflows/blob/main/LICENSE).
