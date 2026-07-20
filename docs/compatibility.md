# Adapter compatibility

This table answers one question per column, so a value in one column never implies anything about the others.

"Global support" describes only the exporter: `supported` means the official or project-owned format is confirmed, the serializer exists, and both the local generation contract and the temporary-directory installation contract pass.

It does not mean an external agent discovered or executed a recipe, that a specific agent version was tested, or that a reviewer approved an outcome.
Parsing by the consumer, external discovery, external execution, and human outcome review each have their own columns.

Dates for the local contracts appear as `not retained`: the repository has passing tests for them, but no dated attestation of those runs was kept.

| Agent | Global support | Export format | Format | Serializer | Generation contract | Last local serializer test | Installation contract | Last installation lifecycle test | Consumer parse | Current recipe installations | External executions | Reviewed outcomes | Tested agent version | Last external execution | Last human outcome review | Stale records | Superseded records | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | --- | --- | --- | ---: | ---: | --- |
| Generic Markdown | supported | plain-markdown-bundle | confirmed | implemented | passing | not retained | passing | not retained | not-applicable | 0/20 | 0/20 | 0/20 | untested | not retained | not retained | 0 | 0 | `packages/core/src/adapters.ts`, `packages/core/src/core.test.ts`, `packages/cli/src/install.integration.test.ts` |
| Claude Code | supported | skill-md-bundle | confirmed | implemented | passing | not retained | passing | not retained | passing | 0/20 | 0/20 | 0/20 | untested | not retained | not retained | 2 | 0 | `docs/research/adapter-sources.md`, `packages/core/src/adapters.ts`, `packages/core/src/core.test.ts`, `packages/cli/src/install.integration.test.ts`, `verification/review-pull-request/claude-code-20260715-final-execution.yml` |
| OpenAI Codex | supported | skill-md-bundle | confirmed | implemented | passing | not retained | passing | not retained | passing | 0/20 | 0/20 | 0/20 | untested | not retained | not retained | 4 | 0 | `docs/research/adapter-sources.md`, `packages/core/src/adapters.ts`, `packages/core/src/core.test.ts`, `packages/cli/src/install.integration.test.ts`, `verification/review-pull-request/codex-20260715-final-execution.yml` |
| Cursor | supported | skill-md-bundle | confirmed | implemented | passing | not retained | passing | not retained | untested | 0/20 | 0/20 | 0/20 | untested | not retained | not retained | 0 | 0 | `docs/research/adapter-sources.md`, `packages/core/src/adapters.ts`, `packages/core/src/core.test.ts`, `packages/cli/src/install.integration.test.ts` |
| Gemini CLI | supported | custom-command-toml-bundle | confirmed | implemented | passing | not retained | passing | not retained | untested | 0/20 | 0/20 | 0/20 | untested | not retained | not retained | 0 | 0 | `docs/research/adapter-sources.md`, `packages/core/src/adapters.ts`, `packages/core/src/core.test.ts`, `packages/cli/src/install.integration.test.ts` |
| OpenCode | supported | opencode-command-markdown-bundle | confirmed | implemented | passing | not retained | passing | not retained | untested | 0/20 | 0/20 | 0/20 | untested | not retained | not retained | 0 | 0 | `docs/research/adapter-sources.md`, `packages/core/src/adapters.ts`, `packages/core/src/core.test.ts`, `packages/cli/src/install.integration.test.ts` |

How to read the evidence columns:

A recipe record counts as current only while it matches the recipe version, the adapter version, the complete seven-file recipe hash, and a source commit that exists in this repository's history.
Stale records stay visible in their column but cannot promote a passing stage.
A current record can explicitly supersede an older one for the same recipe and agent, and conflicts between active records fail closed: failing beats passing, and passing beats untested.
At the recipe level, bundle compatibility describes whether one recipe can be serialized without losing meaning, while capability status describes its external execution requirements; neither is inferred from global exporter support.

See [the verification model](./guide/verification) and [adapter research](./research/adapter-sources) for the full rules.
