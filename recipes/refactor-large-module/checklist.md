# Refactor a large module execution checklist

## Scope and contract

- [ ] The starting commit and working-tree state are recorded before any file moves.
- [ ] Every allowed source and test path is listed exactly, without directory wildcards that could admit unrelated changes.
- [ ] Every public export has its exact signature, output, error behavior, and verification method recorded.
- [ ] Repository-wide search results account for every known in-repository caller.
- [ ] Side effects, state ownership, ordering constraints, and cleanup behavior are represented in characterization coverage.

## Boundary design

- [ ] Each proposed file owns one responsibility with a distinct reason to change.
- [ ] Allowed and prohibited dependency directions are explicit for every new boundary.
- [ ] No proposed extraction exists only to forward parameters without clarifying ownership.
- [ ] The compatibility facade remains in place for every caller that still uses the original boundary.
- [ ] Each checkpoint changes one responsibility and can compile without a later checkpoint.

## Checkpoint validation

- [ ] Baseline results identify the exact command, environment, revision, exit status, and test count.
- [ ] Every checkpoint result identifies the exact checkpoint rather than only the final branch.
- [ ] Every checkpoint records its exact changed paths relative to its immediate predecessor.
- [ ] Every checkpoint identifies an independently retained source-and-test diff through an immutable version-control or archive identifier.
- [ ] Export, output, error, and side-effect comparisons show no unapproved difference.
- [ ] Dependency-boundary checks confirm that new imports follow the approved direction.
- [ ] Performance is either compared with like-for-like measurements or explicitly marked unassessed.
- [ ] Failed checkpoints retain their evidence and do not disappear from the delivery record.

## Reversibility and approval

- [ ] Every checkpoint rollback was exercised in an isolated branch or disposable worktree.
- [ ] Rollback restoration and checkpoint reapplication both returned passing results.
- [ ] Any public contract change has repository maintainer approval tied to a before-and-after contract.
- [ ] Any accepted performance regression has service owner approval tied to comparable measurements.
- [ ] No characterization test was removed merely because implementation code moved.

## Delivery

- [ ] The final changed-file inventory lists exact paths, equals the union of retained checkpoint paths, and distinguishes unchanged validation inputs.
- [ ] Temporary facades and residual risks have owner roles and measurable exit conditions.
- [ ] Every material result maps to a unique evidence item, and proposed work is not described as executed.
- [ ] The retained repository diffs and contracted Markdown delivery record satisfy every completion criterion in `workflow.md`.
