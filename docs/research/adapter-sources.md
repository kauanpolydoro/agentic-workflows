# Adapter source research

This page is a research record: it captures what each vendor's documentation said on the consultation date and the format decisions derived from it.

The vendor sources below were consulted on 2026-07-15.
The repository comparison uses baseline commit `cbe8c9dd7c48f945711f2cd52b9ef01748fccb1e`.
Only vendor-maintained documentation was used for vendor contracts.

## Evidence boundaries

Official format confirmation means that a vendor source documents the path, syntax, metadata, and invocation behavior recorded here.
Local parsing means that the generated artifact was accepted by a real parser for its format.
Installation means that the generated bundle passed the repository filesystem lifecycle in a temporary project.
External discovery means that the vendor application recognized the installed artifact.
Execution means that the external agent actually ran the workflow.
Outcome review means that a retained run was reviewed against objective recipe criteria.

These stages are independent.
A vendor URL does not prove local serialization, parsing, installation, discovery, execution, or outcome quality.
This documentation research alone establishes no external discovery, agent execution, outcome review, or tested agent version.
Separate retained records now establish explicit discovery, parsing, and execution for `review-pull-request` on Claude Code 2.1.209 and Codex CLI 0.144.4 only.

## Official format matrix

| Adapter | Official source | Confirmed project path and format | Metadata and assets | Invocation control | Decision and limitation |
| --- | --- | --- | --- | --- | --- |
| Generic Markdown | Project-defined, with no external vendor contract | `.agentic-workflows/workflows/<recipe-id>/workflow.md` in a Markdown bundle | Bundle-owned Markdown files follow the project contract. | No agent invocation behavior exists. | Treat it as documentation and report invocation as not applicable. |
| Claude Code | [Skills](https://code.claude.com/docs/en/skills) | `.claude/skills/<recipe-id>/SKILL.md` | Claude accepts skill-directory support files; `name` is optional and `description` is recommended. | Skills are model-invocable by default; `disable-model-invocation: true` preserves explicit `/skill-name` invocation only. | Emit the field for sensitive recipes; do not add `allowed-tools` as a safety control because it grants pre-approval rather than restricting tools. |
| OpenAI Codex | [Build skills](https://learn.chatgpt.com/docs/build-skills) | `.agents/skills/<recipe-id>/SKILL.md` | `name` and `description` are required; scripts, references, assets, and `agents/openai.yaml` are supported. | Implicit invocation defaults to true; `policy.allow_implicit_invocation: false` in `agents/openai.yaml` retains explicit `$skill` invocation. | Include the policy file in sensitive bundles; [plugins](https://learn.chatgpt.com/docs/build-plugins) are a distribution alternative, not execution evidence. |
| Cursor | [Agent Skills](https://cursor.com/docs/skills), [Rules](https://cursor.com/docs/rules), and [Cursor 2.4](https://cursor.com/changelog/2-4) | Prefer `.cursor/skills/<recipe-id>/SKILL.md`; `.agents/skills/` is also recognized. | `name` and `description` are required; scripts, references, and assets are supported. | Skills are automatic by default; `disable-model-invocation: true` requires explicit `/skill-name` invocation. | Migrate from the baseline agent-requested MDC rule; an MDC rule with a description and `alwaysApply: false` is not manual-only. |
| Gemini CLI | [Custom commands](https://geminicli.com/docs/cli/custom-commands/) | `<project-root>/.gemini/commands/<recipe-id>.toml` using TOML v1 | `prompt` is required and `description` is optional; `{{args}}` receives arguments and `@{path}` can inject workspace content. | Custom commands are explicitly invoked as `/command`; no implicit-invocation field is documented. | Do not invent a policy field or emit `!{...}` shell interpolation; command-local asset resolution is not documented. |
| OpenCode | [Commands](https://opencode.ai/docs/commands/) | `.opencode/commands/<recipe-id>.md` | YAML frontmatter supports `description`, `agent`, `subtask`, and `model`; `$ARGUMENTS` receives arguments and `@path` can include project files. | Custom commands are explicitly invoked as `/command`; no implicit-invocation field is documented. | Emit only needed fields, do not emit shell-output interpolation, and do not assume a command-local asset root. |

## AWF-006 manual-invocation decision

A recipe is sensitive when it has high or critical risk, any mutable effect, an approval gate, or an operation involving publication, migration, removal, or traffic change.

| Adapter | Required sensitive-recipe behavior | Failure disposition |
| --- | --- | --- |
| Generic Markdown | No invocation policy is available. | Present the export as documentation only. |
| Claude Code | Add `disable-model-invocation: true` to `SKILL.md`. | The export is policy-incomplete without the field. |
| OpenAI Codex | Add `agents/openai.yaml` with `policy.allow_implicit_invocation: false`. | The bundle is policy-incomplete without the metadata file. |
| Cursor | Export an Agent Skill with `disable-model-invocation: true`. | An automatic skill or agent-requested MDC rule is policy-incomplete. |
| Gemini CLI | Retain the documented explicit slash-command surface. | Do not invent an unsupported field. |
| OpenCode | Retain the documented explicit slash-command surface. | Do not invent an unsupported field. |

Installation output must state whether invocation is manual-only, model-invocable, or not applicable.
The status must be derived from generated metadata rather than inferred from Markdown readability.

## AWF-018 contract implications

| Adapter | Required local format contract | External contract when the consumer is available |
| --- | --- | --- |
| Generic Markdown | Verify the entrypoint, complete assets, header, and all relative links. | Not applicable until a consumer is selected. |
| Claude Code | Parse YAML frontmatter, validate documented fields, require the sensitive policy when applicable, and resolve bundle assets. | Confirm discovery and explicit-only behavior, then retain the exact CLI version. |
| OpenAI Codex | Parse both `SKILL.md` and `agents/openai.yaml`, validate required fields and the boolean policy, and resolve assets. | Confirm discovery and explicit-only behavior in a fresh session, then retain the exact version. |
| Cursor | Parse Agent Skill frontmatter, require folder and name equality, validate the sensitive policy, and resolve assets. | Confirm discovery and verify that a sensitive skill is not selected implicitly. |
| Gemini CLI | Use a real TOML parser, require `prompt`, validate `description` and `{{args}}`, and reject unintended shell interpolation. | Confirm discovery with `/commands list`, invoke manually, and retain the exact version. |
| OpenCode | Parse YAML frontmatter, validate the Markdown template and `$ARGUMENTS`, resolve assets, and reject unintended shell interpolation. | Confirm command discovery and manual invocation, then retain the exact version. |

Local YAML and TOML parsing in repository tests validates the serializer contract.
It is not a substitute for parsing, discovery, or execution by the vendor application.

## Registry facts and evidence boundary

The central registry derives global support from independently named facts.
An observed fact must cite at least one repository evidence path, while an untested fact cannot cite passing evidence.

| Adapter | Format | Serializer | Local generation contract | Temporary installation contract | Vendor consumer parse | External discovery | External execution | Outcome review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Generic Markdown | project-defined and confirmed | implemented | passing | passing | not-applicable | not-applicable | not-applicable | not-applicable |
| Claude Code | confirmed | implemented | passing | passing | passing for `review-pull-request` | passing for explicit `review-pull-request` invocation | passing for `review-pull-request` | untested |
| OpenAI Codex | confirmed | implemented | passing | passing | passing for `review-pull-request` | passing for explicit `review-pull-request` invocation | passing for `review-pull-request` | untested |
| Cursor | confirmed | implemented | passing | passing | untested | untested | untested | untested |
| Gemini CLI | confirmed | implemented | passing | passing | untested | untested | untested | untested |
| OpenCode | confirmed | implemented | passing | passing | untested | untested | untested | untested |

Serializer implementation is retained in `packages/core/src/adapters.ts`.
The local generation contract is retained in `packages/core/src/core.test.ts`.
The temporary-directory installation contract is retained in `packages/cli/src/install.integration.test.ts`.
Official format decisions are retained in this document.

The global status `supported` is available only when format, serializer, generation contract, and installation contract satisfy the registry rule.
It does not imply vendor consumer parsing, external discovery, external execution, a tested agent version, or an approved outcome.
The generated compatibility matrix records recipe counts so that the Claude Code and Codex evidence cannot be mistaken for corpus-wide execution coverage.
No human outcome-review timestamp is recorded because no retained outcome review exists.
