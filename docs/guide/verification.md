# Verification model

When this site says a workflow was "tested", it always says exactly what was tested and what was not.
There is no single green badge.
Instead, verification is split into four independent stages, and each stage proves one specific thing.

| Stage | What the status proves | What it does not prove |
| --- | --- | --- |
| Structural | The recipe passed schema, required-file, content, evidence-ID, relative-link, and output-contract validation. | That the bundle was ever installed or executed by an external agent. |
| Installation | A recipe-specific adapter bundle completed the recorded filesystem installation contract. | That the external application discovered or executed the installed workflow. |
| Execution | The named external agent, at the retained version, executed the recorded fixture. | That the result satisfied the recipe's completion criteria. |
| Outcome | A reviewer evaluated the retained execution result against explicit criteria. | That future versions or different inputs will behave identically. |

When there is no evidence for a stage, the status is shown as `untested`, `unknown`, or `not-applicable`, depending on the stage.
A working exporter never upgrades a recipe's installation, execution, or outcome status by itself; each stage needs its own evidence.

## What a source recipe can claim about itself

A `recipe.yml` file is not allowed to declare its own success.
Its structural status can only say `derived`, and its installation, execution, and outcome statuses are limited to `untested` or `not-applicable`.
The generator marks structural status as `passing` only after the current source passes every registered structural check.

The structural check covers a digest of these seven files:

1. `recipe.yml`
2. `workflow.md`
3. `README.md`
4. `checklist.md`
5. `output.schema.json`
6. `examples/input.md`
7. `examples/expected-output.md`

Change any of those files and an older passing record for the recipe stops applying to the current version.
That is intentional: evidence belongs to the exact content that was tested.

## How evidence is recorded

Evidence records live under `verification/<recipe-id>/*.yml` and use schema version 2.
Every record identifies one recipe, one adapter, an adapter version, the complete seven-file recipe digest, and an immutable source commit.
A record that claims an observed stage must also retain the exact command, its exit code, start and finish timestamps, a complete environment description, and hashed copies of the command, stdout, and stderr.

Each stage raises the bar a little further:

- Installation `passing` also requires exit code zero and a hashed record of the installed files.
- Execution `passing` also requires installation `passing`, the retained external agent version, and hashed input and output artifacts.
- Outcome `passing` also requires execution `passing`, the reviewer's identity, a review timestamp, a hashed review artifact, and passing criteria that each cite a retained evidence artifact.

The schema rejects a "tested agent version" claim when no external execution was actually observed.

Evidence artifacts must stay inside `verification/`, must be regular files, must not be reached through symlinks, and must stay within the configured size limit.
Before using a record, the generator checks every artifact's SHA-256 digest, confirms the cited commit belongs to this repository's history, and confirms the recipe digest matches the seven files at that commit.

## Current, stale, and superseded evidence

A record is current only while its recipe version, adapter version, and complete recipe digest still match the working catalog.
Once any of those change, the record becomes stale: it stays visible for auditing, but it can no longer promote a current status.

A record can explicitly supersede an older record for the same recipe and agent through the optional `supersedes` field.
The referenced record must exist, superseding across agents or recipes is rejected, and cycles are rejected.
A stale superseding record cannot suppress a current one, and duplicate active claims with identical stage states must be resolved through explicit supersession.

When distinct active records disagree, aggregation fails closed:
`failing` beats `passing`, `passing` beats `untested`, and `not-applicable` is used only when every active record reports it.

## Adapter support is a separate question

"This adapter is supported" and "this workflow was executed by this agent" are different claims, and the site keeps them apart.

Global adapter support is derived from format confirmation, a working serializer, a local generation contract, and a temporary-directory installation contract.
Whether the external application can parse the output, discover the installed workflow, execute it, and produce a result a human approves of are all separate facts.

A retained external execution proves discovery, parsing, and execution only for that exact recipe bundle, agent version, command, and environment.
The adapter registry may cite such a record as representative evidence that the format is consumable, and the compatibility matrix keeps the recipe count visible so one execution is never generalized to every workflow.
Passing deterministic output-contract validation is also not the same as a human reviewing the outcome.

At the recipe level, bundle compatibility says whether one recipe can be serialized without losing meaning, and capability status says whether its external execution requirements have been confirmed.
Neither is inferred from global exporter support.

See the generated [compatibility matrix](../compatibility.md) and the retained [adapter source research](../research/adapter-sources.md).

## Where schema validation ends

The generated JSON Schema files validate portable field shapes and basic constraints, but JSON Schema cannot express every repository-dependent or cross-field rule used here.
The Zod validator enforces stage ordering and criterion references, and the generator enforces source commits, file hashes, artifact hashes, staleness, supersession, and conflict precedence.
If you consume these records with JSON Schema alone, do not treat a shape-valid record as verified evidence.

## Current limitations

Retained Claude Code and Codex execution records exist only for `review-pull-request`, and each record is tied to the exact recipe content that was tested.
The recipe's text has since been revised, so those records are now stale: they stay visible for auditing, but the matrix reports no current external execution until the agents are re-run against the current content.
No retained human outcome review exists yet, so every outcome stage remains `untested`.
Cursor, Gemini CLI, and OpenCode have no retained external execution or tested agent version at all.
