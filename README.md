# Agentic Workflows

Evidence-oriented workflow bundles and locally verified exporters for AI coding agents.

Use structured workflows for code review, CI debugging, migrations, security review, testing, documentation, and maintenance across multiple coding agents.

![Agentic Workflows terminal demonstration](docs/public/terminal-demo.svg)

Agentic Workflows is a structured catalog with an offline installer, not a loose prompt list.
Every recipe declares inputs, preconditions, observable steps, decision points, safety guardrails, human approvals, expected outputs, completion criteria, examples, adapter status, and independent verification stages.

[Read in Brazilian Portuguese](README.pt-BR.md)

## Quick start

The CLI is available as the public npm package [`@kauanpolydoro/agentic-workflows`](https://www.npmjs.com/package/@kauanpolydoro/agentic-workflows) and requires Node.js 22 or newer.
For regular use, install it globally once:

```bash
npm install --global @kauanpolydoro/agentic-workflows
```

You can then use the short `awf` command from any project:

```bash
awf --version
awf
awf list
awf show review-pull-request
```

From the root of a project, preview a workflow installation before writing any files:

```bash
awf init --agent codex
awf install review-pull-request --dry-run
awf install review-pull-request --dry-run --show-content
```

Run bare `awf init` in an interactive terminal when you prefer to choose the default agent and target through a short wizard.

Providing `--agent`, `--target`, or `--no-interactive` skips the wizard for deterministic scripts and CI.

The first preview lists every create, replace, unchanged, and retire action.
Add `--show-content` when you also want to inspect the complete generated files.
Remove `--dry-run` after reviewing the plan to install the workflow.
The package exposes both `awf` and `agentic-workflows` as command names, but this documentation uses the shorter `awf` form.
Run `awf completion bash`, `awf completion zsh`, `awf completion fish`, or `awf completion pwsh` to generate tab completion for your shell.
Add `--install-instructions` to print persistent setup without modifying your shell profile.

To try the latest release without installing it globally, use either package runner:

```bash
npx --yes @kauanpolydoro/agentic-workflows@latest list
bunx @kauanpolydoro/agentic-workflows list
```

Keep the full `@kauanpolydoro/agentic-workflows` scope when using `npx` or `bunx` without a local installation.
The unscoped `agentic-workflows` name resolves to a different package on npm.

To pin the CLI version for a project or CI environment instead:

```bash
npm install --save-dev @kauanpolydoro/agentic-workflows
npx awf list
```

The reusable [`@kauanpolydoro/agentic-workflows-core`](https://www.npmjs.com/package/@kauanpolydoro/agentic-workflows-core) package is also public on npm.

To develop from source, clone the repository over HTTPS and run the local CLI:

```bash
git clone https://github.com/kauanpolydoro/agentic-workflows.git
cd agentic-workflows
corepack enable
pnpm install --frozen-lockfile
pnpm build
pnpm validate
pnpm awf list
pnpm awf show review-pull-request
```

Use `git@github.com:kauanpolydoro/agentic-workflows.git` instead only when your SSH credentials are already configured.

Preview a local installation without writing files:

```bash
pnpm awf install review-pull-request --agent generic --dry-run
```

## Featured workflows

- `review-pull-request` reviews correctness, regression, security, maintainability, and test evidence.
- `debug-failing-ci` moves from the first causal log through falsifiable hypotheses to a minimal fix.
- `database-migration-review` evaluates locks, data loss, mixed-version compatibility, and rollout recovery.
- `security-review` stays strictly defensive and requires explicit authorized scope.

[Browse all 20 workflows on the documentation site](https://kauanpolydoro.github.io/agentic-workflows/catalog/), or inspect the [generated catalog source](docs/catalog/index.md).

## See a complete result

The `write-release-notes` golden recipe includes a [self-contained synthetic input](recipes/write-release-notes/examples/input.md) and its [complete expected release-note artifact](recipes/write-release-notes/examples/expected-output.md).
Every material statement in that expected output maps to an evidence ID from the input.
The pair is an editorial reference maintained in the repository, not evidence that an external agent executed the recipe or that a real release outcome was approved.

The reproducible demonstration also evaluates the maintained reference outputs for `debug-failing-ci`, `review-pull-request`, and `synchronize-documentation` against their output contracts.
See the [reference-evaluation record](docs/launch/reference-evaluations.md) for claim traces and the explicit verification boundary.

## Agent exports

| Agent | Current export status | Project destination |
| --- | --- | --- |
| Generic Markdown | Supported | `.agentic-workflows/workflows/` |
| Cursor | Supported | `.cursor/skills/` |
| Gemini CLI | Supported | `.gemini/commands/` |
| OpenCode | Supported | `.opencode/commands/` |
| Claude Code | Supported | `.claude/skills/` |
| OpenAI Codex | Supported | `.agents/skills/` |

Supported means the format is confirmed, the exporter is implemented, and local generation plus installation contract tests pass.
It does not mean that an external agent executed the workflow or that its outcome was reviewed.
See the [source research](docs/research/adapter-sources.md) and [generated compatibility matrix](docs/compatibility.md).

## How it works

1. Inspect canonical Markdown and strict YAML metadata under `recipes/`.
2. Ask `awf` to serialize the recipe for a selected agent and install it under the current project.
3. Use the hash-bearing manifest for safe update or removal, then record execution evidence separately.

The CLI operates offline during normal use, has no telemetry, and does not execute recipe instructions.
It validates containment, symlink parents, overwrite intent, and managed-file hashes in tested local filesystem conditions.
These controls are not a security boundary against a privileged process racing filesystem changes.

## Verification without inflated claims

The project separates four stages:

- Structural validation proves the recipe matches its schema and directory contract.
- Installation testing proves CLI lifecycle behavior in a disposable target.
- Agent execution testing records a real run with a named version.
- Outcome review records human evaluation against the recipe's completion criteria.

Structural status is derived from the repository validators and generated metadata.
Historical Claude Code and Codex execution artifacts are archived, but they no longer promote a current status because their source commit left the repository history during the intentional history reset.
Every human outcome-review stage remains `untested`.

## CLI

The `awf` binary supports:

- `list` with category, agent, tag, global support, recipe compatibility, and JSON filters;
- `show` with raw Markdown and JSON output;
- `install` with complete dry-run plans, optional generated content, target, adapter, overwrite, and JSON controls;
- `status` for local installation health and managed-file drift;
- `update` and `remove` with non-mutating plans and modified-file protection;
- `validate`, `doctor`, and `init` for catalog and project maintenance.

Read the [CLI reference](docs/guide/cli-reference.md) for flags and exit codes.

## Author a workflow

```bash
pnpm new:recipe my-workflow
```

Replace every scaffold marker, add realistic examples, declare adapter support honestly, and run:

```bash
pnpm validate:recipes
pnpm validate:content
pnpm test
pnpm docs:build
```

See [CONTRIBUTING.md](CONTRIBUTING.md) and the [authoring guide](docs/guide/authoring.md).

## Security and trust

Recipes are untrusted data and documentation, never executable plugins.
Review their content before asking any agent to follow it.
Use the private reporting process in [SECURITY.md](SECURITY.md) for vulnerabilities and never post secrets in public issues.

## Project status

The initial npm packages are public, and the project continues to expand workflow evidence, adapters, and release automation.
See [ROADMAP.md](ROADMAP.md), [CHANGELOG.md](CHANGELOG.md), and [LAUNCH_PLAN.md](LAUNCH_PLAN.md).

Released under the [MIT License](LICENSE).

Star the repository to bookmark new workflows.
