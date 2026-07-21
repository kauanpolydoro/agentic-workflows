# Contributing

Thank you for improving portable, evidence-oriented workflow packs.
Contributions must preserve honest compatibility claims, offline CLI behavior, and the data-only recipe trust model.

## Development setup

Use Node.js 22 or newer, Corepack, and the pinned pnpm version:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

Before handoff, run the complete deterministic validation suite used by the primary CI quality job:

```bash
pnpm generate:check
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:coverage
pnpm build
pnpm test:completion
pnpm test:automation
pnpm test:integration
pnpm test:acceptance
pnpm test:package
pnpm validate:recipes
pnpm validate:content
pnpm audit:similarity
pnpm test:fixtures
pnpm docs:build
pnpm check:links
pnpm check:clean
```

Run the commands from a clean worktree after `pnpm install --frozen-lockfile`.
Do not skip a failing command or lower a threshold to make the suite pass.
`pnpm check:clean` is the final guard: it must see no stale generated artifact and no unintended tracked or untracked file.

`pnpm test:automation` validates the public JSON contract across command boundaries in real subprocesses.

Project-discovery fixtures must define their own discovery boundary instead of assuming the operating system's temporary directory has no Git or AWF marker.

The package smoke test deliberately creates a hostile ancestor `.git` marker and must pass without a `TMPDIR` override.

CI runs unit, automation, integration, acceptance, and packed-package smoke coverage on Linux, Windows, and macOS, with an additional Node.js 22 compatibility job.

The matrix loads generated Bash completion on Linux, Zsh completion on macOS, Fish completion on Linux, and PowerShell completion on Windows, then verifies command-specific candidates in each native shell.

The Windows matrix also runs the compiled automation contract from Git Bash so shell invocation, path handling, and non-interactive output are checked outside PowerShell.

## Add a recipe

1. Run `pnpm new:recipe my-workflow`.
2. Replace every scaffold marker with original, operational content.
3. Fill strict metadata and declare support from official sources only.
4. Add realistic input and expected-output examples.
5. Add human approval gates for destructive, external, or irreversible actions.
6. Add verification evidence only after the corresponding activity occurs.
7. Run the focused recipe checks while editing, then run the complete validation suite above before handoff.
8. Open a focused pull request using the repository template.

CI rejects incomplete markers such as placeholder replacement text.

## Add an adapter

Document the official source and consultation date in `docs/research/adapter-sources.md`.
Implement destination rules and serialization in the core package.
Add filesystem-safe integration coverage and update the compatibility documentation.
Do not infer execution support from successful file generation.

## Pull-request expectations

Keep changes focused and preserve public terminology.
Update tests and documentation with behavior changes.
Report commands run and any verification gaps.
Never include credentials, copied vendor documentation, fabricated metrics, or unreviewed external-agent claims.

By contributing, you agree to follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) and license your contribution under MIT.

## Dependency updates

Dependabot proposes weekly grouped development-tool updates.
Review official release notes, keep the lockfile deterministic, separate unrelated major upgrades, inspect license and transitive changes, and run the complete validation suite before merging.
