# Adapter compatibility

Global support describes the exporter contract only.

`supported` means the official or project-owned format is confirmed, the serializer exists, and both the local generation contract and temporary-directory installation contract pass.

Consumer parsing, external discovery, external execution, and human outcome review are independent facts.

A supported exporter does not prove that an external agent discovered or executed a recipe, that a specific agent version was tested, or that a reviewer approved an outcome.

Local contract dates are shown as `not retained` because the repository has passing tests but no retained dated attestation for those runs.

| Agent | Global support | Export format | Format | Serializer | Generation contract | Last local serializer test | Installation contract | Last installation lifecycle test | Consumer parse | Current recipe installations | External executions | Reviewed outcomes | Tested agent version | Last external execution | Last human outcome review | Stale records | Superseded records | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- | --- | --- | ---: | ---: | --- |
| Generic Markdown | supported | plain-markdown-bundle | confirmed | implemented | passing | not retained | passing | not retained | not-applicable | 0/20 | 0/20 | 0/20 | untested | not retained | not retained | 0 | 0 | `packages/core/src/adapters.ts`, `packages/core/src/core.test.ts`, `packages/cli/src/install.integration.test.ts` |
| Claude Code | supported | skill-md-bundle | confirmed | implemented | passing | not retained | passing | not retained | passing | 1/20 | 1/20 | 0/20 | 2.1.209 (Claude Code) | 2026-07-15T20:59:04Z | not retained | 1 | 0 | `docs/research/adapter-sources.md`, `packages/core/src/adapters.ts`, `packages/core/src/core.test.ts`, `packages/cli/src/install.integration.test.ts`, `verification/review-pull-request/claude-code-20260715-final-execution.yml` |
| OpenAI Codex | supported | skill-md-bundle | confirmed | implemented | passing | not retained | passing | not retained | passing | 1/20 | 1/20 | 0/20 | codex-cli 0.144.4 | 2026-07-15T21:01:37Z | not retained | 3 | 0 | `docs/research/adapter-sources.md`, `packages/core/src/adapters.ts`, `packages/core/src/core.test.ts`, `packages/cli/src/install.integration.test.ts`, `verification/review-pull-request/codex-20260715-final-execution.yml` |
| Cursor | supported | skill-md-bundle | confirmed | implemented | passing | not retained | passing | not retained | untested | 0/20 | 0/20 | 0/20 | untested | not retained | not retained | 0 | 0 | `docs/research/adapter-sources.md`, `packages/core/src/adapters.ts`, `packages/core/src/core.test.ts`, `packages/cli/src/install.integration.test.ts` |
| Gemini CLI | supported | custom-command-toml-bundle | confirmed | implemented | passing | not retained | passing | not retained | untested | 0/20 | 0/20 | 0/20 | untested | not retained | not retained | 0 | 0 | `docs/research/adapter-sources.md`, `packages/core/src/adapters.ts`, `packages/core/src/core.test.ts`, `packages/cli/src/install.integration.test.ts` |
| OpenCode | supported | opencode-command-markdown-bundle | confirmed | implemented | passing | not retained | passing | not retained | untested | 0/20 | 0/20 | 0/20 | untested | not retained | not retained | 0 | 0 | `docs/research/adapter-sources.md`, `packages/core/src/adapters.ts`, `packages/core/src/core.test.ts`, `packages/cli/src/install.integration.test.ts` |

A current recipe record must match the recipe version, adapter version, complete seven-file recipe hash, and a cited source commit in the current repository history.
Stale records remain visible in the count but cannot promote a passing stage.
A current record can explicitly supersede an older current record for the same recipe and agent.
When active current records conflict, failing takes precedence over passing, and passing takes precedence over untested.
Recipe-level bundle compatibility describes serialization of one recipe and capability status describes its external execution requirements.
Neither field is inferred from global exporter support.
See [the verification model](./guide/verification) and [adapter research](./research/adapter-sources).
