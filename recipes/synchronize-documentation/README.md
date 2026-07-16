# Synchronize documentation with verified behavior

Use this recipe to convert identified documentation drift into a bounded, evidence-linked patch that a maintainer can review without reconstructing product behavior from memory.

## Primary use cases

- Correct commands, configuration names, paths, defaults, or version statements after an implemented change.
- Reconcile a known contradiction between a documentation page and versioned source, tests, configuration, or safe runtime evidence.
- Prepare a reviewable documentation update for a release whose scope and immutable revision are known.

## When not to use

- The source revision or documentation file set is unknown.
- Verification would require production credentials, customer data, or an unsafe mutation.
- The request defines new product behavior or a new public commitment rather than correcting drift.
- Authoritative sources conflict and the responsible maintainer has not selected the public contract.

## Required evidence

Provide exact repository-relative documentation paths, an immutable commit, intended audience, exclusions, and authoritative evidence for each claim class.
Each source must record its provenance, revision, execution status, and redaction status where applicable.

## Produced artifacts

- A bounded documentation patch.
- A claim-to-evidence drift register with dispositions and patch locations.
- A verification report that distinguishes executed and unexecuted checks.
- An approval record, limitations, and owned follow-up items.

## Primary risks

The main risks are publishing invented commands, treating an aspirational design as implemented behavior, exposing sensitive support material, silently expanding scope, and changing a public commitment without approval.

## How to use this recipe

1. Confirm the recipe fits the situation and collect the evidence declared in `recipe.yml`.
2. Freeze the commit, exact files, audience, and exclusions before editing.
3. Execute the procedure in `workflow.md` and use `checklist.md` to control omissions.
4. Compare the result with the synthetic input and complete expected output under `examples/`.
5. Run the repository's recipe, content, formatting, and relative-link validations before requesting approval.

## Files

| File | Purpose |
|---|---|
| `recipe.yml` | Declares catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states. |
| `workflow.md` | Defines the canonical evidence collection, correction, validation, approval, and recovery procedure. |
| `checklist.md` | Controls scope, claim coverage, command status, safety, validation, and delivery omissions during execution. |
| `output.schema.json` | Defines the machine-readable contract for the delivered artifact set. |
| `examples/input.md` | Supplies a self-contained synthetic drift scenario and evidence inventory. |
| `examples/expected-output.md` | Demonstrates the complete derivable patch and synchronization report. |

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

This workflow cannot resolve an intentional contract conflict without maintainer approval.
It cannot verify a command that requires unavailable safe access, and it reports out-of-scope drift without correcting it silently.

See [the project recipe quality standard](../../docs/quality/recipe-quality-standard.md).
