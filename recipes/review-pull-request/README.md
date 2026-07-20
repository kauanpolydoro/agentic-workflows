# Review a pull request

Turn an immutable pull request comparison into a review whose findings, checks, and merge recommendation can be independently traced and challenged.

## Primary use cases

- A pull request is ready for pre-merge review.
- A focused diff needs correctness, regression, security, and test analysis.
- A previously reviewed pull request has a new head and needs a fresh evidence boundary.

## When not to use

- The immutable base or head revision cannot be resolved.
- The diff is incomplete or repository instructions are unavailable.
- The request is to implement changes rather than review them.
- A specialist risk boundary cannot be evaluated from the supplied evidence or authorization.

## Required evidence

- **Immutable comparison range:** Resolvable base, head, and merge-base identifiers.
- **Complete change set:** Unified diff plus an independently generated added, modified, renamed, and deleted path inventory.
- **Review contract:** Pull request intent, acceptance criteria, exclusions, and repository instructions for every changed path.
- **Verification evidence:** When available, commands, run IDs, reviewed revision, environment, and exact results.

## Produced artifacts

- An evidence-linked review report with immutable scope and verdict.
- A prioritized finding register with evidence, impact, severity, confidence, recommendation, verification, and disposition.
- A verification and residual-risk record that separates executed checks from proposed checks.

## Primary risks

- Do not modify files while performing the review.
- Do not expose secrets found in the diff; reference only a redacted location.
- Do not approve behavior that has not been inspected or verified.
- Stop when the reviewed head no longer matches the supplied diff.
- Require specialist approval when the change crosses a security, database, or public-contract boundary that the supplied evidence does not resolve.

## How to use this recipe

1. Resolve and record the immutable base, head, and merge base.
2. Recreate the diff and changed-file inventory, then map intent and instructions to every changed path.
3. Follow [workflow.md](workflow.md) to analyze behavior, test candidate findings, and derive a policy-based verdict.
4. Use [checklist.md](checklist.md) to control coverage, verification claims, secrets, specialist review, and submission.
5. Compare artifact structure with the synthetic [example input](examples/input.md) and [expected output](examples/expected-output.md), without copying its conclusions.
6. Obtain repository-maintainer approval for the exact report and recorded head before submission.

## Files

- `recipe.yml` contains catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- `workflow.md` is the canonical operational procedure.
- `checklist.md` controls evidence, safety, approval, and delivery omissions.
- `output.schema.json` defines the machine-readable contract for the delivered artifact set.
- `examples/input.md` is a synthetic evidence package.
- `examples/expected-output.md` is a complete reference artifact.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
The source metadata intentionally keeps installation, external execution, and outcome at `untested` because agent-specific records are aggregated outside this content-addressed bundle.
Changing this README after a run would change the seven-file recipe digest and correctly make that run stale.
Consult the repository [compatibility matrix](../../docs/compatibility.md) for current installation, execution, tested-version, and outcome counts derived from retained records.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

The example proves editorial derivability for a synthetic scenario.
Any current external run remains bounded to its recorded recipe bundle, agent version, command, and environment and cannot prove corpus-wide compatibility, implicit-invocation blocking, or human-approved outcome quality.
Domain evidence and approvals must be recollected for every real use.
The recipe does not replace a dedicated security, database migration, or API contract review when the change needs one.

See the repository [recipe quality standard](../../docs/quality/recipe-quality-standard.md) and [adapter sources](../../docs/research/adapter-sources.md).
