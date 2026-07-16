# Refactor a large module through reversible slices

## Objective

Transform one evidenced, change-coupled module through staged source and test checkpoints and produce a contracted Markdown verification record whose cohesive boundaries can be reviewed and reverted independently.
Preserve every recorded public export, output, error, side effect, and compatibility constraint unless a repository maintainer explicitly approves a separately identified contract change.

## When to use

- Use this procedure when one module owns multiple responsibilities that have distinct reasons to change and repository evidence can identify their callers and effects.
- Use it when characterization tests can protect the public boundary while responsibilities move through small checkpoints.
- Use it when the team needs a traceable decomposition rather than a behavior change or a framework migration.

## When not to use

- Do not start when the immutable revision, exact module boundary, or public contract cannot be established.
- Do not use this workflow to combine feature work, defect correction, dependency upgrades, or public API redesign with an internal refactor.
- Do not proceed when hidden state makes characterization nondeterministic and no safe seam can be introduced first.
- Do not use it when the proposed work cannot be divided into checkpoints that can be validated and reverted independently.

## Required inputs

- **Immutable revision and exact approved and final path inventories with explicit exclusions:** provide a commit identifier, every permitted source and test path, the starting working-tree state, in-scope responsibilities, and excluded files or behaviors.
  The boundary prevents unrelated cleanup from entering the change.
  Validate the commit through the version-control system and reconcile every changed file against the recorded scope.
- **Public exports, callers, side effects, invariants, and compatibility constraints:** provide signatures, import locations, observable outputs, error contracts, state mutations, ordering rules, and behavior that consumers rely on.
  These records define what must remain stable.
  Validate them with repository-wide search, call-site inspection, contract documentation, and characterization tests.
- **Baseline and per-checkpoint characterization commands with recorded results:** provide exact commands, environment, exit status, test counts, relevant output, and the revision or checkpoint to which each result applies.
  Comparable results are required to detect semantic drift.
  Reject results whose command, environment, or associated revision is missing.
- **Proposed responsibility boundaries, dependency direction, approval state, and rollback units:** provide destination files, responsibility statements, allowed dependencies, checkpoint order, approver roles, and the exact unit reverted on failure.
  This makes cohesion, coupling, and reversibility reviewable before code moves.
  Validate that no checkpoint requires a later checkpoint to compile or roll back.

## Optional inputs

- Comparable latency, allocation, or throughput measurements add a performance guard when the module is sensitive to execution cost.
  Without them, report performance as unassessed rather than unchanged.
- Owner-approved architecture notes can clarify intended boundary ownership.
  Treat them as design intent and reconcile them with observed callers and dependencies before relying on them.

## Preconditions

- The scoped revision resolves to an immutable commit, and the starting working-tree state is recorded.
- Every public export and known in-repository caller appears in the inventory.
- Characterization tests pass, or each pre-existing failure has an owner and written disposition.
- Every proposed checkpoint compiles and can be reverted without a later checkpoint.
- Any requested public contract change has been separated from the refactor and submitted to the repository maintainer.

## Workflow

### Phase 1 - Freeze the protected boundary

1. Record the immutable revision, module path, allowed files, exclusions, runtime, and exact validation commands.
   Produce a scope record that another reviewer can reproduce.
   Advance only when the revision and scope reconcile with the working tree; stop on unrelated or unexplained changes.
2. Build a contract map of public exports, call sites, observable outputs, errors, side effects, state ownership, and ordering invariants.
   Use repository search, documentation, and tests as evidence, and label any uncertain consumer explicitly.
   Advance only when every known contract element has a verification method; stop when a material behavior has no observable check.

### Phase 2 - Establish the baseline and boundaries

3. Run the characterization and project checks in the declared environment.
   Attach the command, exit status, test count, and relevant result to the immutable revision.
   Advance when results are reproducible or every existing failure is dispositioned; stop when a new run cannot be compared with the record.
4. Group responsibilities by owned state, side effects, reasons to change, and allowed dependency direction.
   Produce a boundary table with destination path, stable seam, prohibited dependency, and responsible owner role.
   Advance only when each extraction reduces mixed ownership without merely adding forwarding parameters; otherwise keep that responsibility in the original module.
5. Order the work into the smallest independently compilable and revertible checkpoints.
   For each checkpoint, record every changed path exactly, protected behaviors, commands, expected result, and rollback unit.
   Stop if a checkpoint combines multiple responsibilities or depends on an unimplemented later slice.

### Phase 3 - Extract and verify

6. Implement one checkpoint without changing the public facade unless an approved contract change explicitly requires it.
   Keep the diff limited to its declared responsibility, tests, and compatibility seam.
   Stop before the next checkpoint if changed paths or behavior exceed the scope record.
7. Run the checkpoint's characterization, type, lint, and focused dependency-boundary checks.
   Compare outputs, errors, side effects, exports, and optional performance measurements with the baseline.
   Advance only when all protected behavior matches and new dependencies follow the boundary table; otherwise execute the checkpoint rollback.
8. Exercise the rollback unit in an isolated branch or disposable worktree, then reapply the verified checkpoint.
   Retain both restoration and reapplication results.
   Stop if rollback cannot return the module to the prior passing checkpoint.
9. Repeat steps 6 through 8 for the next checkpoint only after the current checkpoint has a complete evidence record.
   Do not collapse checkpoint histories after a failure because the sequence is part of the audit trail.

### Phase 4 - Reconcile and deliver

10. Compare the final export surface, caller inventory, outputs, errors, side effects, dependency direction, and optional performance measurements with the baseline.
    Produce the public behavior and dependency-boundary verification record.
    Stop delivery on any unapproved difference.
11. Retain each source and test checkpoint as an immutable version-control diff and deliver the contracted compatibility, rollback, approval, and residual-risk record.
    Identify untested consumers, unavailable measurements, temporary facades, and the owner and exit condition for every follow-up.
    Advance to merge review only when each completion criterion can be checked from retained evidence.

## Decision points

- If repository search finds an unclassified caller, add it to the contract map and characterize its behavior before moving the referenced responsibility.
- If an extraction only introduces parameter forwarding without establishing ownership or dependency direction, keep that code in the current boundary and redesign the slice.
- If a checkpoint changes a public export, output, error, or side effect, revert it and separate the semantic change unless the repository maintainer approves the explicit before-and-after contract.
- If comparable performance evidence exceeds an approved threshold, revert the checkpoint unless the service owner accepts the measured regression with documented impact.
- If rollback depends on a later checkpoint, reorder or divide the work before implementation continues.

## Safety guardrails

- Never perform a big-bang rewrite that cannot be verified or reverted by checkpoint.
- Never change public exports, outputs, errors, or side effects without explicit approval tied to a before-and-after contract.
- Never delete characterization tests because implementation code moved.
- Do not broaden scope to nearby cleanup, naming changes, dependency upgrades, or feature work.
- Do not remove a compatibility facade until repository-wide caller evidence shows that no protected consumer depends on it.
- Run rollback drills only in an isolated branch or disposable worktree, and never discard unrelated local changes.
- Stop when hidden state, nondeterminism, or unavailable dependencies prevent a reliable comparison with the baseline.

## Human approval gates

- Before changing any public contract, the repository maintainer must approve the exact before-and-after signature or behavior, affected caller inventory, migration action, test evidence, and rollback plan.
- Before accepting a measured performance regression, the service owner must approve comparable baseline and checkpoint measurements, user impact, threshold exception, and follow-up owner.
- Before merge, the repository maintainer reviews the final contract comparison, checkpoint results, rollback drill, changed-file inventory, and residual risks.

## Expected output

Apply one cohesive source and test responsibility per reversible repository checkpoint.
The output contract covers one Markdown delivery record containing:

- scope, immutable starting revision, exclusions, and final changed-file inventory;
- the protected public contract and caller map;
- a boundary and dependency-direction table;
- checkpoint-level exact changed paths, implementation summaries, and command results;
- a public behavior and dependency-boundary verification record;
- rollback drill evidence for every checkpoint;
- compatibility decisions, approval state, assumptions, residual risks, and owned follow-up actions; and
- claim-to-evidence traceability for every material result.

Source and test files are repository effects rather than serialized output-contract artifacts.
The record must identify the immutable diff for every checkpoint and the exact retained path or archive identifier by which a reviewer can inspect it.
Code excerpts must identify their destination file and whether they are proposed or implemented.
Do not describe a checkpoint as passing unless its retained result identifies the exact checkpoint.

## Completion criteria

- Every final public export, output, error, side effect, and known caller matches the baseline or has explicit repository maintainer approval.
- Each changed source file has one stated responsibility and obeys the approved dependency direction.
- Every checkpoint has an exact changed-path list, immutable identifier for an independently retained implementation diff, passing characterization result, and successful rollback and reapplication record.
- No unrelated file or behavior appears in the final changed-file inventory.
- Every accepted performance difference has comparable measurements and service owner approval.
- Every residual risk or temporary compatibility seam has an owner role and measurable exit condition.
- The delivery record maps every material claim to evidence and identifies any unexecuted check.

## Failure modes

- **F1:** A protected behavior depends on hidden global state or nondeterministic ordering.
- **F2:** Repository search reveals a caller or side effect absent from the approved inventory.
- **F3:** A checkpoint changes protected behavior or violates the dependency direction.
- **F4:** The rollback drill cannot restore the preceding passing checkpoint.
- **F5:** Final reconciliation contains an unrelated change or an unsupported compatibility claim.

## Recovery procedure

- **R1:** Introduce the smallest injectable or observable seam without moving responsibility, characterize the hidden behavior, and restart baseline review before extraction.
- **R2:** Stop the current checkpoint, expand the contract map and tests, revise affected slices, and restart from the last verified checkpoint.
- **R3:** Revert the failing checkpoint, retain its diff and results, isolate the semantic or dependency violation, and redesign or seek the applicable approval before retrying.
- **R4:** Preserve the failure evidence, restore the last known-good revision through a reviewed manual path, correct checkpoint boundaries, and rerun rollback before any further extraction.
- **R5:** Remove the unrelated change or downgrade the unsupported claim, rerun final reconciliation, and return the record to merge review.

## Example

The [synthetic input](examples/input.md) supplies an immutable scope, contract map, implementation slices, checkpoint results, and rollback evidence for a reporting module.
The [complete expected output](examples/expected-output.md) is a finished refactor delivery record derived only from those supplied evidence items.
