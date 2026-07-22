# Run an autonomous GitHub issue resolution campaign

Use this recipe to let a capable agent runtime work through a finite GitHub backlog after one upfront authorization, without asking the user for decisions during the normal run.
It prioritizes the backlog, handles independent issues concurrently, requires a fresh adversarial subagent for every correction, serializes merges, checkpoints every mutation, and leaves blocked work open rather than hiding it.

> Editorial status: `blocked`.
> The v0.3.0 candidate remains available for inspection and validation, but it is not publication-ready until the required human domain review is retained against its final digest.

## Primary use cases

- Process every issue in an owner-approved initial backlog until it is exhausted, the user stops the campaign, a hard deadline arrives, or a circuit breaker opens.
- Maximize safe overnight throughput with isolated issue workers, bounded concurrency, reserved coordinator and review slots, and one global integration lane.
- Separate demonstrated non-defects and duplicates from real functional, UX, accessibility, reliability, security, or compatibility problems.
- Deliver each new correction through its own branch, commits, pull request, fresh adversarial subagent review, direct squash merge, post-merge smoke, manual issue closure, and verified branch cleanup.
- Resume an interrupted campaign from a durable checkpoint without replaying uncertain GitHub mutations.

## When not to use

- The runtime cannot remain active, poll a stop signal, write durable checkpoints, isolate workers, spawn fresh review subagents, or resume safely.
- Every authorized runtime cannot reach one authenticated shared coordination backend with compare-and-swap, fencing, immutable receipts, append-only audit lookup, and recovery-only quarantine keyed by canonical host plus immutable repository ID.
- The issue intake is unbounded or lacks an upfront cutoff, deadline, mutation limit, concurrency limit, and circuit breakers.
- The repository lacks owner-approved priority, closure, validation, review, direct-merge, protected-domain, downstream-automation, or branch-deletion rules.
- Branch protection requires a merge queue, auto-merge is active, or server-side branch auto-deletion cannot remain disabled for the campaign.
- Any authorized push, pull request, issue, comment, direct-merge, or ref-deletion event can trigger a deployment, migration, production-traffic change, or another protected effect.
- The work requires new human authorization during the run and cannot be deferred safely.
- Restricted security, customer, secret, or private data lacks an approved private route.

## Required evidence

Provide an upfront campaign charter with the repository, finite intake rule, priority policy, allowed mutations, protected domains, canonical owner-bound stop-signal location, authenticated no-follow read and monotonic update procedure, maximum polling interval, per-operation command timeouts, latest safe direct-merge start, shutdown-reserve start, mutation cutoff, bounded reconciliation deadline, hard deadline, total runtime slots, coordinator slot, reserved reviewer capacity, worker count, reviewer checkout and evidence quotas, garbage-collection thresholds, retry budgets, circuit breakers, direct squash-merge conditions, and terminal states.
Provide the authorized issue query or explicit IDs plus the fields, pagination, stability, cutoff, maximum count, and digest rules needed to capture a complete finite snapshot before prioritization.
Provide immutable repository baseline rules, applicable instructions, product and architecture contracts, exact candidate-validation commands, one separate bounded post-merge smoke command, a frozen downstream-automation inventory for every authorized event, worktree and reviewer isolation rules, coordinator-only GitHub mutation credentials, direct-merge eligibility, disabled server-side branch deletion, and canonical no-symlink roots for every workflow-owned local path.
Provide a shared coordination backend keyed by canonical GitHub host plus immutable repository node or database ID, with atomic campaign and controller-process leasing, one immutable-key integration lock, authenticated compare-and-swap, monotonic epochs, fencing tokens, heartbeats, stale-owner recovery, a predecessor-bound confirmed-checkpoint pointer, immutable receipts, append-only audit lookup, idempotent initialization abort and terminalization, and recovery-only quarantine.
Keep the checkpoint, transition log, review packages, receipts, and ledger in a Git-excluded runtime and evidence directory outside issue and reviewer worktrees.
Keep the owner-writable stop record in a separate canonical control inbox whose capability or ACL permits mutation of only that record, never the checkpoint, evidence, or ledger directory.

## Produced artifacts

- `github-issue-resolution-ledger.md` records autonomous controls, finite scope, priority, worker and lease state, orthogonal per-issue state dimensions, derived resolution, mutations, implementation, validation, review rounds, merges, closures, cleanup, checkpoints, resumptions, blockers, terminal counts, and traceability.
- Repository files, commits, branches, comments, pull requests, merges, issue closures, worktrees, checkpoints, and branch deletions are declared workflow effects rather than additional output-contract documents.

## Primary risks

The workflow can publish code and comments, merge multiple changes, close issues, and delete branches without mid-run confirmation.
Its highest risks are stale or ambiguous resume state, split-brain coordination, prompt injection in remote content, data truncation, unsafe parallelism, false closure of a real UX problem, self-review, merge against an unreviewed boundary, ambiguous direct-merge result, downstream production automation, cross-resource races between Git and issue state, and deletion after a concurrent branch push.
The charter, finite snapshot, isolated worktrees, reserved capacity, shared fenced ownership, exact head binding, stop checks, direct-only integration, deadline reserve, circuit breakers, remote expected-OID plus local compare-and-delete cleanup, and two-phase terminalization reduce these risks but do not eliminate host-runtime or external-actor failure.

## How to use this recipe

1. Install and inspect the bundle, then prepare one complete campaign charter before invocation.
2. Confirm that the chosen agent host can stay active for the intended window, receive the stop signal, persist checkpoints, participate in shared distributed coordination, isolate workers, and spawn a genuinely fresh subagent.
3. Invoke the workflow once with the charter and finite issue scope.
4. Let the coordinator continue without waiting for input, while it defers any issue that falls outside the authorization envelope.
5. On return, inspect the terminal status and counts before interpreting the result as backlog exhaustion.
6. Resume with a new invocation only when the prior charter is still valid or a maintainer has approved a replacement charter.

In the v0.3.0 candidate, find autonomous designs with `awf list --execution-mode autonomous`.
The separate `--execution <status>` filter reports retained external-agent execution evidence and does not describe the workflow design.

## Files

| File | Purpose |
| --- | --- |
| `recipe.yml` | Declares the autonomous execution contract, mutable effects, approvals, capabilities, limitations, and verification states. |
| `workflow.md` | Defines finite intake, prioritization, worker scheduling, triage, implementation, fresh subagent review, merge, checkpointing, stop, resume, and recovery. |
| `checklist.md` | Prevents omissions in authorization, state integrity, isolation, review independence, merge safety, and honest termination. |
| `output.schema.json` | Defines the required structure of `github-issue-resolution-ledger.md`. |
| `examples/input.md` | Supplies a self-contained synthetic campaign charter, backlog, repository evidence, transitions, approvals, and evidence inventory. |
| `examples/expected-output.md` | Demonstrates a complete evidence-derived autonomous campaign ledger. |

## Verification status

Structural status is `derived` from the current recipe sources and repository validators.
Installation status is `untested` because no retained adapter-installation evidence is supplied.
External-agent execution status is `untested` because no named agent version has run the final autonomous campaign with retained evidence.
Outcome status is `untested` because no human has reviewed a real unattended campaign result against the completion criteria.
Bundle compatibility records source-level representability only, while capability status remains `unknown` for every external agent.

## Limitations

This recipe is an instruction bundle, not an executable daemon, scheduler, GitHub App, or guarantee that a host will remain alive overnight.
Its `autonomous` mode means the designed normal path requires no human response after explicit invocation and upfront authorization.
It does not mean the CLI executes the recipe or that an adapter has proven persistent execution, distributed compare-and-swap, fencing, receipts, quarantine, GitHub permissions, repository mutations, stop-signal polling, command supervision, checkpoint recovery, worktree isolation, or fresh subagent orchestration.
This version deliberately does not support merge queues or auto-merge.
GitHub does not provide one atomic transaction across a Git commit, default-branch state, and issue closure, so the workflow uses immediate revalidation and honest unresolved states but cannot eliminate every external-actor race.
The campaign can end with `initialization-failed`, `eligible-work-exhausted`, `cleanup-pending`, `deadline-reached`, `user-stopped`, `circuit-breaker`, `runtime-state-ambiguous`, or `external-state-ambiguous` and retain unresolved, unattempted, cleanup-pending, or remotely ambiguous work.
If repository and process ownership are acquired but the first local checkpoint plus backend confirmed-checkpoint pointer cannot both be established, the workflow instead emits an ownership-initialization preflight error and only actually confirmed shared-backend process-release plus repository-release-or-quarantine receipts without claiming a ledger or terminal campaign result.
If checkpoint durability fails after initialization, whether in local storage or backend-pointer confirmation, the workflow stops business mutation and reports only the last confirmed checkpoint plus any actually confirmed backend receipt IDs until authorized recovery can reconstruct durable state.
It quarantines repository ownership only when coordination remains reachable and reconciled with enough authorized pre-deadline time; when the backend is unavailable, ambiguous, or too late for a confirmed safety operation, it instead preserves the last ownership and fences without claiming quarantine, release, receipts, a final ledger, or terminal campaign status, regardless of local storage health.
Only `backlog-exhausted` means every finite-scope issue is resolved, tracker-closed, terminal, cleanup-complete or not applicable, and integration-clear or absent.
The eight-hour estimate is approximate because issue complexity, CI latency, review rounds, rate limits, and repository controls vary.

See the [autonomous workflow contract](../../docs/guide/autonomous-workflows.md), [recipe quality standard](../../docs/quality/recipe-quality-standard.md), and related [issue triage recipe](../triage-issues/README.md).
