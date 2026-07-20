# Changelog

All notable project changes will be documented here.

## Unreleased

### Added

- First-run help, package-root detection, actionable empty states, and workflow ID suggestions.
- Complete lifecycle dry runs with optional generated-content previews.
- Installation health reporting through `awf status` and consumer diagnostics through `awf doctor`.
- Bash, Zsh, Fish, and PowerShell completion through `awf completion <shell>`.
- Interactive `awf init` setup for agent and target selection while retaining deterministic flags.
- Versioned lifecycle plan, validation, diagnostic, and JSON error contracts.
- Resumable npm and GitHub release synchronization with exact tarball integrity checks.

### Changed

- No-op updates identify and preserve unchanged managed files instead of rewriting them.
- Root fallback notices, documentation location output, and filtered doctor diagnostics make ambiguous environments easier to inspect.
- Package smoke tests now exercise local, package-runner, global-install, completion, status, and lifecycle paths while rejecting test artifacts.
- Acceptance coverage now verifies safe `SIGINT` and `SIGTERM` handling on supported POSIX runners.

## 0.1.0

This section records the repository contents published to npm as version `0.1.0`.
A tagged GitHub release has not yet been created.

### Added

- Strict recipe and installation-manifest schemas.
- Twenty structured workflow recipes with examples and checklists.
- Safe local CLI for discovery, installation, updates, removal, validation, and diagnostics.
- Generic Markdown, Cursor, Gemini CLI, OpenCode, Claude Code, and Codex exporters with explicit status.
- Reproducible fixtures, automated tests, generated catalog, compatibility matrix, and VitePress documentation.
