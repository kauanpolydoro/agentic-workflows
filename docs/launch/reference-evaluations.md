# Maintained reference evaluations

This record covers three synthetic reference artifacts maintained in the repository.
It is a source-level editorial and contract review, not evidence that an external agent executed a recipe or that a human approved an agent-produced outcome.

Run `pnpm demo` to repeat each deterministic output-contract check, the disposable installation lifecycle, and an explicit `review-pull-request` invocation through the repository's fake fixture agent.
Run `pnpm validate:content` to repeat the evidence-reference and cross-file content checks.

## Fixture-agent evaluation

The demonstration installs `review-pull-request` for Generic Markdown in a disposable path with spaces.
It then explicitly invokes `scripts/demo-fixture-agent.ts` with the installed workflow, the synthetic input, the committed reference output, and a new output path.
The fixture agent proves that the runner reads those inputs and creates a distinct output file without overwriting an existing result.
The demonstration evaluates that produced file against `output.schema.json` before continuing.
The fixture agent deliberately replays a committed reference artifact, so this is a runner and contract test rather than evidence of autonomous reasoning or external-agent execution.

## Debug failing CI

- Input: [`recipes/debug-failing-ci/examples/input.md`](../catalog/debug-failing-ci#complete-example-input)
- Output: [`recipes/debug-failing-ci/examples/expected-output.md`](../catalog/debug-failing-ci#complete-expected-output)
- Contract: [`recipes/debug-failing-ci/output.schema.json`](../catalog/debug-failing-ci#output-contract)
- Material claim reviewed: the root-cause conclusion is limited to the retained local reproduction and does not claim that external CI reran.
- Trace: the command, failure log, controlled experiment, patch result, and external-verification state are supplied by E1 through E7 in the input and cited by the output.
- Deterministic exit criterion: the output contains every required artifact section and evidence notation required by its contract, with no undeclared artifact.

## Review pull request

- Input: [`recipes/review-pull-request/examples/input.md`](../catalog/review-pull-request#complete-example-input)
- Output: [`recipes/review-pull-request/examples/expected-output.md`](../catalog/review-pull-request#complete-expected-output)
- Contract: [`recipes/review-pull-request/output.schema.json`](../catalog/review-pull-request#output-contract)
- Material claim reviewed: the High finding follows from the complete changed hunk and retry contract, while the narrow passing test is explicitly insufficient to prove duplicate prevention.
- Trace: the immutable revisions, complete diff, acceptance criterion, test hunk, command result, and changed-file inventory are supplied by E1 through E7 and cited by the finding.
- Deterministic exit criterion: the output provides the required finding fields, verdict, limitations, and evidence references declared by its contract.

## Synchronize documentation

- Input: [`recipes/synchronize-documentation/examples/input.md`](../catalog/synchronize-documentation#complete-example-input)
- Output: [`recipes/synchronize-documentation/examples/expected-output.md`](../catalog/synchronize-documentation#complete-expected-output)
- Contract: [`recipes/synchronize-documentation/output.schema.json`](../catalog/synchronize-documentation#output-contract)
- Material claim reviewed: the proposed patch changes only the two obsolete executable names contained in the supplied source and retained zero-context diff.
- Trace: the documentation source, package manifest, help output, acceptance record, release decision, exact patch, and validation record are supplied by E1 through E7 and cited by the output.
- Deterministic exit criterion: the fenced patch artifact and report sections satisfy the declared output contract without adding facts outside the input evidence.

## Verification boundary

The maintained outputs are synthetic examples authored with their inputs.
Passing the output contract proves only that required artifacts, populated sections and tables, literals, and evidence-reference rules are satisfied.
The content validator additionally checks structural derivability signals, but semantic claim review remains human work.
No external-agent command, agent version, external execution artifact, outcome reviewer, or outcome approval is retained by this record.
