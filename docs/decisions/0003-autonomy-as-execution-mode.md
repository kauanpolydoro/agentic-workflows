# ADR 0003: Model autonomy as an execution mode

- Status: Accepted
- Date: 2026-07-22

## Context

Catalog categories currently describe work domains such as maintenance, security, testing, and documentation.
Autonomy describes how a workflow runs after invocation rather than what domain it addresses.

Using `autonomous` as a category would prevent a recipe from retaining its domain and would not define what unattended behavior means.
A tag would improve discovery but would be too weak for a product-level promise.

## Decision

Recipe schema version 4 adds `execution_mode` with values `supervised` and `autonomous`.
An autonomous recipe must also declare the strict `autonomy` object that requires upfront authorization, no mid-run human response on the normal path, an observable stop signal, a hard deadline, durable checkpoints, resume support, and an explicit `fail-closed` or `defer-and-continue` failure policy.
It must declare the `persistent-execution` capability, while workflow-specific capabilities such as subagent orchestration remain separate.

Category remains the singular domain classification.
CLI and web catalog filters expose execution mode separately from category and separately from external execution-evidence status.

The mode describes the recipe design only.
It does not claim that the CLI executes recipes or that any external agent has demonstrated persistent unattended execution.

## Consequences

All recipe metadata migrates to schema version 4 and declares its execution mode explicitly.
Existing workflows are `supervised` unless they satisfy the autonomous contract.

Autonomous workflows require stronger authoring and review rules for upfront authority, checkpointing, stop behavior, deadlines, safe partial completion, and honest terminal states.
Real autonomy claims still require retained external-agent execution and human outcome evidence.
