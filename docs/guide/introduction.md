# Introduction

Agentic Workflows is a catalog and local CLI for reusable coding-agent procedures.
It addresses a practical gap between a loose prompt and a reliable engineering playbook.

Each recipe defines its purpose, inputs, preconditions, operational steps, decision points, safety constraints, approval gates, output shape, and completion evidence.
The canonical Markdown remains inspectable before installation.

The project has three boundaries:

1. `recipes/` contains data and documentation only.
2. `@agentic-workflows/core` validates recipes and produces deterministic export bundles.
3. `awf` handles local discovery and a transaction-protected installation lifecycle.

No normal CLI command sends recipe data over the network or executes recipe instructions.
An installed workflow can still recommend commands to a human or external agent, so installation is not execution approval.

Continue with [installation](./installation), browse the [catalog](../catalog/), or study the [verification model](./verification).
