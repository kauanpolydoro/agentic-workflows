# Changelog

All notable project changes will be documented here.

## Unreleased

No changes have been recorded yet.

## 0.3.0 - 2026-07-22

Read the complete [v0.3.0 release notes](release-notes/v0.3.0.md).

### Added

- Added the autonomous `resolve-github-issues` campaign recipe with finite intake, durable fenced checkpoints, isolated workers, fresh adversarial review, direct squash integration, post-merge smoke verification, manual issue closure, bounded stop behavior, and honest partial terminal states.
- Added execution-mode discovery through the CLI and web catalog.
- Added authoring guidance and an architecture decision for autonomous workflow design.

### Changed

- Migrated recipe metadata from schema version 3 to version 4 and made `execution_mode` required for every recipe.
- Autonomous recipes now require the strict `autonomy` contract and the `persistent-execution` capability, while the GitHub issue campaign also declares `distributed-coordination` and existing recipes declare `supervised` mode.
- Bumped every migrated recipe version so installations and verification records can distinguish the schema version 4 bundles from their prior content.
- Consumers authoring schema version 3 recipes must migrate to version 4 and choose an explicit execution mode.

### Breaking changes

- Recipe metadata using schema version 3 is no longer accepted by the current core and CLI.
- Every recipe must use schema version 4 and declare either `execution_mode: supervised` or `execution_mode: autonomous`.

### Publication gate

- The v0.3.0 candidate remains pending one cross-cutting human review of the schema version 4 migrations and a separate human domain review of `resolve-github-issues`.

## 0.2.2 - 2026-07-21

Read the complete [v0.2.2 release notes](release-notes/v0.2.2.md).

### Fixed

- Ensured each npm tarball contains exactly one root `README.md` so npm selects the same English landing page shown by GitHub.
- Added pre-publication tarball ambiguity checks and post-publication verification of npm's selected README filename.

## 0.2.1 - 2026-07-21

Read the complete [v0.2.1 release notes](release-notes/v0.2.1.md).

### Added

- Added the Brazilian Portuguese README and the complete linked onboarding documentation to the published CLI package.
- Added release-time public-link auditing, exact npm registry README verification, and semantic parity contracts for the English and Brazilian Portuguese landing pages.

### Changed

- Reworked the English and Brazilian Portuguese landing pages around a complete install-to-invocation journey, exact CLI contracts, and equivalent navigation.
- Updated public status documents to reflect npm trusted publishing and the current pre-1.0 security support policy.
- Aligned adapter research with the active evidence registry and added observable checkpoints plus exact CI version pinning to both landing pages.
- Aligned authoring and installation guides, clarified existing-project onboarding, and documented the complete contributor validation gate.

### Fixed

- Replaced browser-specific CLI wording with the cross-platform native document-handler contract.
- Removed archived pre-history-reset executions from active compatibility claims while retaining their historical context.

## 0.2.0 - 2026-07-21

Read the complete [v0.2.0 release notes](release-notes/v0.2.0.md).

### Added

- First-run help, package-root detection, actionable empty states, and workflow ID suggestions.
- Complete lifecycle dry runs with optional generated-content previews.
- Installation health reporting through `awf status` and consumer diagnostics through `awf doctor`.
- Bash, Zsh, Fish, and PowerShell completion through `awf completion <shell>`.
- Interactive `awf init` setup for agent and target selection while retaining deterministic flags.
- Versioned lifecycle plan, validation, diagnostic, and JSON error contracts.
- Stable machine-error metadata with command context, conservative retryability, reference links, and remediation.
- Filtered installation status with complete healthy, drifted, and invalid summary counts.
- Cross-command automation contract coverage on the Linux, Windows, and macOS CI matrix.
- Versioned `awf init --json` output with project-root discovery evidence.
- Non-mutating shell-profile setup guidance through `awf completion <shell> --install-instructions`.
- Explicit project-root preflight for humans and automation through `awf context`.
- Resumable npm and GitHub release synchronization with exact tarball integrity checks.
- Project-root provenance in every versioned installation status report.
- Cross-platform documentation-opener contracts without skipped Windows unit coverage.
- Strict executable schemas for CLI-owned JSON results through the public `output-contract` package export.
- Native command-specific completion smoke tests for Bash, Zsh, Fish, and PowerShell.
- Real PTY acceptance coverage for the interactive initialization wizard.

### Changed

- No-op updates identify and preserve unchanged managed files instead of rewriting them.
- Root fallback notices, documentation location output, and filtered doctor diagnostics make ambiguous environments easier to inspect.
- Unsupported configuration schemas now report a safe, explicit recreation path instead of a generic validation failure.
- Doctor reports now retain project-root provenance and structured lifecycle-lock recovery metadata without exposing ownership tokens.
- Doctor checks now expose a normalized per-check schema and equivalent top-level status, health, and exit-code verdicts.
- Package smoke tests now exercise local, package-runner, global-install, completion, status, and lifecycle paths while rejecting test artifacts.
- Acceptance coverage now verifies safe `SIGINT` and `SIGTERM` handling on supported POSIX runners.
- Lifecycle conflicts now provide sanitized PID and acquisition-time guidance in human output while preserving tokens and requiring manual verification.
- Windows CI now exercises compiled CLI automation from both the default shell and Git Bash.
- Completion now scopes every option and enum to its owning command and guards against drift from the Commander surface.
- SIGINT and SIGTERM now preserve JSON stream isolation through a versioned `INTERRUPTED` error.
- Branch coverage was restored above the enforced 85 percent release threshold without lowering the gate.
- The npm package README now uses the repository README as its canonical source so the npm and GitHub landing pages remain synchronized.

## 0.1.0

This section records the repository contents published to npm as version `0.1.0`.
A tagged GitHub release has not yet been created.

### Added

- Strict recipe and installation-manifest schemas.
- Twenty structured workflow recipes with examples and checklists.
- Safe local CLI for discovery, installation, updates, removal, validation, and diagnostics.
- Generic Markdown, Cursor, Gemini CLI, OpenCode, Claude Code, and Codex exporters with explicit status.
- Reproducible fixtures, automated tests, generated catalog, compatibility matrix, and VitePress documentation.
