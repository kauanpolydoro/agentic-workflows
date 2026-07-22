# Autonomous workflows

An autonomous workflow is designed to continue without human responses after one explicit invocation and one complete upfront authorization.
It is still a recipe executed by an external agent host, not a daemon started by the Agentic Workflows CLI.

## What the label guarantees

A recipe with `execution_mode: autonomous` must also carry the strict `autonomy` contract in schema version 4.
That contract requires unattended execution, upfront authorization, no mid-run human input on the normal path, an observable user stop signal, a hard deadline, durable checkpoints, idempotent resume, and an explicit failure policy.
An item-oriented campaign can use `defer-and-continue`, while an atomic autonomous workflow can use `fail-closed`.
Every autonomous recipe must also declare the `persistent-execution` capability.

The category remains the work domain, such as `maintenance` or `security`.
Execution mode is a separate facet, so future autonomous recipes can keep their correct domain classification.

In a source build containing the Unreleased schema version 4 facet, use either catalog surface to find them:

```bash
awf list --execution-mode autonomous
```

The web catalog exposes the same execution-mode filter and marks matching cards as `autonomous design`.

## What the label does not guarantee

The label describes the workflow design.
It does not prove that a particular agent version can remain alive, receive a stop request, isolate workers, spawn subagents, preserve checkpoints, or complete an overnight run.

Those claims remain separate:

- `bundle_compatibility` says whether the recipe can be represented by an adapter.
- `capability_status` says whether required external capabilities were assessed.
- Installation evidence says whether the bundle was installed successfully.
- Execution evidence says whether a named agent version actually ran it.
- Outcome evidence says whether a human reviewed the result.

An autonomous recipe with execution status `untested` is autonomous by design and unverified in a real host.

## Authorization boundary

Every normal mutation and approval condition must be settled before the campaign starts.
Autonomy never widens permissions or converts missing authority into consent.

When an item needs a new approval, protected-domain authority, missing evidence, or a policy exception, the agent must leave that item open, record the blocker, release its worker capacity, and continue other eligible work.
It must not wait indefinitely for the user or close the item to make the queue look complete.

## Runtime contract

An autonomous workflow defines and verifies these controls before its first mutation:

- A finite scope or bounded intake cutoff.
- A trusted absolute deadline and a shutdown reserve.
- An observable user stop signal with an owner and polling rule.
- Durable state written atomically inside the authorized target.
- Idempotent resume that reconciles external state before retrying commands.
- Bounded concurrency with isolated mutable resources.
- Per-item retry limits and global circuit breakers.
- Honest terminal states that distinguish exhaustion from partial completion.

The host must fail closed when it cannot read the stop signal, persist a checkpoint, prove ownership, or reconcile an ambiguous mutation.

## Safe terminal states

For an item-oriented campaign, `backlog-exhausted` or an equivalent complete state means every finite-scope item has reached its verified terminal outcome.
Deadline, user stop, circuit breaker, eligible-work exhaustion, cleanup pending, and ambiguous external state are valid partial campaign states.

An item-oriented final artifact must reconcile resolved, externally resolved, unresolved, deferred, active, queued, unattempted, cleanup-pending, pending-integration, and out-of-scope counts appropriate to its own domain model.
It must never use a complete label while one in-scope item remains open or unsupported.

An atomic workflow does not invent item or backlog counts.
Its final artifact instead reconciles completed, pending, failed, ambiguous, cleanup, and recovery states for every declared step and effect, and complete means no required effect remains pending or ambiguous.

## Invocation and stopping

All recipes still require explicit invocation.
Installing an autonomous recipe does not start it and does not grant its requested permissions.

The caller must choose an agent host that supports the declared runtime contract and supply the upfront authorization.
A chat message is a valid stop signal only when that host proves it can receive the message while the run remains active.
Otherwise use another owner-bound signal that the runtime can poll safely.

## Current autonomous recipe

[`resolve-github-issues`](../catalog/resolve-github-issues.md) is the first autonomous design in the catalog.
Its editorial status is `blocked`, so the Unreleased source bundle is not publication-ready until the required human domain review is retained against its final digest.
Its external-agent execution and outcome remain `untested` until retained evidence from a named host and a human review establish otherwise.

The architecture rationale is recorded in [ADR 0003](../decisions/0003-autonomy-as-execution-mode.md).
