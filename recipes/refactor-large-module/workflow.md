# Refactor a large module through reversible slices

## Objective

Take one module that repository evidence shows is change-coupled, and decompose it through staged source and test checkpoints.
Each checkpoint carves out a cohesive boundary that a reviewer can inspect and revert on its own, and the work produces a contracted Markdown verification record.
Preserve every recorded public export, output, error, side effect, and compatibility constraint, unless a repository maintainer explicitly approves a contract change that has been identified separately.

## When to use

- Use this procedure when one module owns several responsibilities with distinct reasons to change, and repository evidence can identify their callers and effects.
- Use it when characterization tests can protect the public boundary while responsibilities move out in small checkpoints.
- Use it when the team needs a traceable decomposition, not a behavior change and not a framework migration.

## When not to use

- Do not start if the immutable revision, the exact module boundary, or the public contract cannot be established.
- Do not use this workflow to fold feature work, defect correction, dependency upgrades, or public API redesign into an internal refactor.
- Do not proceed when hidden state makes characterization nondeterministic and no safe seam can be introduced first.
- Do not use it when the work cannot be divided into checkpoints that can each be validated and reverted independently.

## Required inputs

- **Immutable revision and exact approved and final path inventories with explicit exclusions:** provide a commit identifier, every permitted source and test path, the starting working-tree state, the responsibilities in scope, and the files or behaviors that are excluded.
  This boundary is what keeps unrelated cleanup out of the change.
  Validate the commit through the version-control system, and reconcile every changed file against the recorded scope.
- **Public exports, callers, side effects, invariants, and compatibility constraints:** provide signatures, import locations, observable outputs, error contracts, state mutations, ordering rules, and any behavior that consumers rely on.
  These records define what must stay stable.
  Validate them with repository-wide search, call-site inspection, contract documentation, and characterization tests.
- **Baseline and per-checkpoint characterization commands with recorded results:** provide the exact commands, the environment, the exit status, the test counts, the relevant output, and the revision or checkpoint each result belongs to.
  Without comparable results you cannot detect semantic drift.
  Reject any result whose command, environment, or associated revision is missing.
- **Proposed responsibility boundaries, dependency direction, approval state, and rollback units:** provide the destination files, a responsibility statement for each, the allowed dependencies, the checkpoint order, the approver roles, and the exact unit that is reverted on failure.
  This is what makes cohesion, coupling, and reversibility reviewable before any code moves.
  Validate that no checkpoint needs a later checkpoint in order to compile or roll back.

## Optional inputs

- Comparable latency, allocation, or throughput measurements add a performance guard when the module is sensitive to execution cost.
  Without them, report performance as unassessed rather than unchanged.
- Owner-approved architecture notes can clarify who is meant to own each proposed boundary.
  Treat them as design intent, and reconcile them with the callers and dependencies you actually observe before relying on them.

## Preconditions

- The scoped revision resolves to an immutable commit, and the starting working-tree state is recorded.
- Every public export and every known in-repository caller appears in the inventory.
- Characterization tests pass, or each pre-existing failure has an owner and a written disposition.
- Every proposed checkpoint compiles and can be reverted without depending on a later checkpoint.
- Any requested public contract change has been separated from the refactor and submitted to the repository maintainer.

## Workflow

### Phase 1 - Freeze the protected boundary

1. Record the immutable revision, the module path, the allowed files, the exclusions, the runtime, and the exact validation commands.
   Write them up as a scope record that another reviewer can reproduce.
   Advance only when the revision and scope reconcile with the working tree, and stop on unrelated or unexplained changes.
2. Build a contract map of the public exports, call sites, observable outputs, errors, side effects, state ownership, and ordering invariants.
   Use repository search, documentation, and tests as evidence, and label any uncertain consumer explicitly.
   Advance only when every known contract element has a verification method; stop when a material behavior has no observable check.

### Phase 2 - Establish the baseline and boundaries

3. Run the characterization and project checks in the declared environment.
   Attach the command, exit status, test count, and relevant result to the immutable revision.
   Advance when the results are reproducible or every existing failure has a disposition; stop when a new run cannot be compared with the record.
4. Group responsibilities by the state they own, their side effects, their reasons to change, and the allowed dependency direction.
   Capture the result in a boundary table with the destination path, the stable seam, the prohibited dependency, and the responsible owner role.
   Advance only when each extraction reduces mixed ownership instead of merely adding forwarding parameters; otherwise keep that responsibility in the original module.
5. Order the work into the smallest checkpoints that compile and revert independently.
   For each checkpoint, record every changed path exactly, plus the protected behaviors, the commands, the expected result, and the rollback unit.
   Stop if a checkpoint combines multiple responsibilities or depends on a slice that has not been implemented yet.

### Phase 3 - Extract and verify

6. Implement one checkpoint, leaving the public facade unchanged unless an approved contract change explicitly requires it.
   Keep the diff limited to the checkpoint's declared responsibility, its tests, and its compatibility seam.
   Stop before the next checkpoint if the changed paths or behavior exceed the scope record.
7. Run the checkpoint's characterization, type, lint, and focused dependency-boundary checks.
   Compare the outputs, errors, side effects, exports, and any optional performance measurements with the baseline.
   Advance only when all protected behavior matches and new dependencies follow the boundary table; otherwise execute the checkpoint rollback.
8. Exercise the rollback unit in an isolated branch or a disposable worktree, then reapply the verified checkpoint.
   Retain both the restoration result and the reapplication result.
   Stop if rollback cannot return the module to the prior passing checkpoint.
9. Move to the next checkpoint by repeating steps 6 through 8, but only after the current checkpoint has a complete evidence record.
   Do not collapse checkpoint histories after a failure; the sequence is part of the audit trail.

### Phase 4 - Reconcile and deliver

10. Compare the final export surface, caller inventory, outputs, errors, side effects, dependency direction, and any optional performance measurements with the baseline.
    Produce the public behavior and dependency-boundary verification record.
    Stop delivery on any unapproved difference.
11. Retain each source and test checkpoint as an immutable version-control diff, and deliver the contracted compatibility, rollback, approval, and residual-risk record.
    Identify untested consumers, unavailable measurements, temporary facades, and the owner and exit condition for every follow-up.
    Advance to merge review only when each completion criterion can be checked from the retained evidence.

## Decision points

- If repository search finds an unclassified caller, add it to the contract map and characterize its behavior before moving the responsibility that caller references.
- If an extraction only introduces parameter forwarding without establishing ownership or dependency direction, keep that code in its current boundary and redesign the slice.
- If a checkpoint changes a public export, output, error, or side effect, revert it and separate the semantic change unless the repository maintainer approves the explicit before-and-after contract.
- If comparable performance evidence exceeds an approved threshold, revert the checkpoint unless the service owner accepts the measured regression with its documented impact.
- If rollback depends on a later checkpoint, reorder or divide the work before implementation continues.

## Safety guardrails

- Never perform a big-bang rewrite that cannot be verified or reverted by checkpoint.
- Never change public exports, outputs, errors, or side effects without explicit approval tied to a before-and-after contract.
- Never delete characterization tests just because the implementation code moved.
- Do not widen the scope into nearby cleanup, naming changes, dependency upgrades, or feature work.
- Do not remove a compatibility facade until repository-wide caller evidence shows that no protected consumer still depends on it.
- Run rollback drills only in an isolated branch or a disposable worktree, and never discard unrelated local changes.
- Stop when hidden state, nondeterminism, or unavailable dependencies prevent a reliable comparison with the baseline.

## Human approval gates

- Before changing any public contract, the repository maintainer must approve the exact before-and-after signature or behavior, the affected caller inventory, the migration action, the test evidence, and the rollback plan.
- Before accepting a measured performance regression, the service owner must approve the comparable baseline and checkpoint measurements, the user impact, the threshold exception, and the follow-up owner.
- Before merge, the repository maintainer reviews the final contract comparison, the checkpoint results, the rollback drill, the changed-file inventory, and the residual risks.

## Expected output

Each reversible repository checkpoint applies one cohesive source and test responsibility.
The output contract covers one Markdown refactor delivery record containing:

- the scope, the immutable starting revision, the exclusions, and the final changed-file inventory;
- the protected public contract and the caller map;
- a boundary and dependency-direction table;
- the exact changed paths, an implementation summary, and the command results for each checkpoint;
- a public behavior and dependency-boundary verification record;
- rollback drill evidence for every checkpoint;
- compatibility decisions, approval state, assumptions, residual risks, and owned follow-up actions; and
- claim-to-evidence traceability for every material result.

Source and test files are repository effects, not serialized output-contract artifacts.
For every checkpoint, the record must identify the immutable diff and the exact retained path or archive identifier a reviewer can use to inspect it.
Code excerpts must name their destination file and state whether they are proposed or implemented.
Do not describe a checkpoint as passing unless its retained result identifies that exact checkpoint.

## Completion criteria

- Every final public export, output, error, side effect, and known caller matches the baseline or carries explicit repository maintainer approval.
- Each changed source file has one stated responsibility and follows the approved dependency direction.
- Every checkpoint has an exact changed-path list, an immutable identifier for its independently retained implementation diff, a passing characterization result, and a successful rollback and reapplication record.
- No unrelated file or behavior appears in the final changed-file inventory.
- Every accepted performance difference has comparable measurements and service owner approval.
- Every residual risk or temporary compatibility seam has an owner role and a measurable exit condition.
- The delivery record maps every material claim to evidence and names any check that was not executed.

## Failure modes

- **F1:** A protected behavior turns out to depend on hidden global state or nondeterministic ordering.
- **F2:** Repository search reveals a caller or side effect that the approved inventory does not list.
- **F3:** A checkpoint changes protected behavior or violates the dependency direction.
- **F4:** The rollback drill cannot restore the preceding passing checkpoint.
- **F5:** The final reconciliation contains an unrelated change or an unsupported compatibility claim.

## Recovery procedure

- **R1:** Introduce the smallest injectable or observable seam without moving any responsibility, characterize the hidden behavior, and restart the baseline review before extraction.
- **R2:** Stop the current checkpoint, expand the contract map and the tests, revise the affected slices, and restart from the last verified checkpoint.
- **R3:** Revert the failing checkpoint, retain its diff and results, isolate the semantic or dependency violation, and redesign the slice or obtain the applicable approval before retrying.
- **R4:** Preserve the failure evidence, restore the last known-good revision through a reviewed manual path, correct the checkpoint boundaries, and rerun rollback before any further extraction.
- **R5:** Remove the unrelated change or downgrade the unsupported claim, rerun the final reconciliation, and return the record to merge review.

## Example

The [synthetic input](examples/input.md) supplies an immutable scope, a contract map, implementation slices, checkpoint results, and rollback evidence for a reporting module.
The [complete expected output](examples/expected-output.md) is a finished refactor delivery record derived only from those supplied evidence items.
