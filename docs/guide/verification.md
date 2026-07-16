# Verification model

Verification is a sequence of independent claims, not a single badge.

| Stage | What the status proves | What it does not prove |
| --- | --- | --- |
| Structural | The recipe passed schema, required-file, content, evidence-ID, relative-link, and output-contract validation. | The bundle was installed or executed by an external agent. |
| Installation | A recipe-specific adapter bundle completed the recorded filesystem installation contract. | The external application discovered or executed the installed workflow. |
| Execution | The named external agent and retained version executed the recorded fixture. | The result satisfied the recipe completion criteria. |
| Outcome | A reviewer evaluated the retained execution result against explicit criteria. | Future versions or different inputs will behave identically. |

Missing evidence appears as `untested`, `unknown`, or `not-applicable` according to the stage.
An exporter contract does not promote a recipe-specific installation, execution, or outcome status.

## Source recipe status

Source `recipe.yml` files can declare structural status only as `derived`.
Installation, execution, and outcome in source metadata are limited to `untested` or `not-applicable`.
The generator derives structural `passing` only after the current source passes every registered structural check.

The structural digest covers these seven files:

1. `recipe.yml`
2. `workflow.md`
3. `README.md`
4. `checklist.md`
5. `output.schema.json`
6. `examples/input.md`
7. `examples/expected-output.md`

Changing any covered file invalidates an older passing record for the current recipe.

## Retained evidence records

Schema version 2 records live under `verification/<recipe-id>/*.yml`.
Every record identifies one recipe, one adapter, an adapter version, the complete seven-file recipe digest, and an immutable source commit.
An observed stage also requires the exact command, exit code, start and finish timestamps, a complete environment, and hashed command, stdout, and stderr artifacts.

Installation `passing` additionally requires exit code zero and a hashed installed-artifact record.
Execution `passing` additionally requires installation `passing`, a retained external agent version, and hashed input and output artifacts.
Outcome `passing` additionally requires execution `passing`, reviewer identity, review timestamp, a hashed review artifact, and passing criteria that each cite a retained evidence artifact.
The schema rejects a tested agent version when no external execution was observed.

Evidence artifacts must stay inside `verification/`, must be regular files, must not be reached through symlinks, and must remain within the configured size limit.
The generator checks every artifact SHA-256 digest before using the record.
It also verifies that the cited commit belongs to the current repository history and that the recipe digest matches the seven files at that commit.

## Current, stale, and superseded evidence

A record is current only when its recipe version, adapter version, and complete recipe digest match the working catalog.
A stale record remains countable for audit purposes but cannot promote a current status.

The optional `supersedes` field establishes explicit precedence over another record for the same recipe and agent.
The referenced record must exist, cross-agent or cross-recipe supersession is rejected, and cycles are rejected.
A stale superseding record cannot suppress a current record.
Duplicate active claims with the same stage states are rejected and must be resolved through explicit supersession.

When distinct active records conflict, aggregation is fail closed.
`failing` takes precedence over `passing`, `passing` takes precedence over `untested`, and `not-applicable` is used only when every active record reports it.

## Adapter support is separate

Global adapter support is derived from format confirmation, serializer implementation, a local generation contract, and a temporary-directory installation contract.
Consumer parsing, external application discovery, external execution, and human outcome review remain separate facts.

An explicit external execution proves discovery, parsing, and execution only for the retained recipe bundle, agent version, command, and environment.
The adapter registry may cite that record as representative format-consumption evidence, while the compatibility matrix keeps the recipe count visible so the claim is not generalized to every workflow.
Passing deterministic output-contract validation is not a human outcome review.

Recipe-level bundle compatibility describes whether one recipe can be serialized without semantic loss.
Recipe-level capability status describes whether the external execution requirements have been confirmed.
Neither declaration is inferred from global exporter support.

See the generated [compatibility matrix](../compatibility.md) and the retained [adapter source research](../research/adapter-sources.md).

## Validation boundary

The generated JSON Schema files validate portable field shape and basic constraints.
JSON Schema cannot represent every repository-dependent or cross-field rule used here.
The Zod validator enforces stage ordering and criterion references, while the generator enforces source commits, file hashes, artifact hashes, staleness, supersession, and conflict precedence.
Consumers that run JSON Schema alone must not treat a shape-valid record as verified evidence.

## Current limitation

Retained Claude Code and Codex executions exist only for `review-pull-request` and the recorded agent versions.
The matrix therefore reports one current execution out of 20 recipes for each of those agents.
No retained human outcome review exists, and every outcome stage remains `untested`.
Cursor, Gemini CLI, and OpenCode still have no retained external execution or tested external agent version.
