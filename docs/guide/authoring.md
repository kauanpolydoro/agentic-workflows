# Authoring workflows

Want to add a workflow of your own?
Start by generating a scaffold from the repository root:

```bash
pnpm new:recipe my-workflow
```

The scaffold contains visible placeholder markers on purpose: it cannot pass review as generated, so nothing half-finished slips into the catalog by accident.

From there, work through these steps:

1. Replace every marker with observable actions and real evidence.
2. Declare required and optional inputs separately.
3. Name destructive operations and human approval gates explicitly.
4. Choose `supervised` or `autonomous` execution mode honestly.
5. Write realistic input and expected-output examples.
6. Declare adapter support only when an official source confirms the format.
7. Add evidence only after the corresponding activity has actually happened.
8. Run `pnpm validate:recipes`, `pnpm validate:content`, the tests, and the docs build.

Follow the [recipe quality standard](../quality/recipe-quality-standard.md) and use schema version 4 for recipe metadata.
Agent compatibility declarations belong to each recipe, while global adapter support and format facts remain in the central registry.

Use `execution_mode: supervised` when the normal path may require a human response after invocation.
Use `execution_mode: autonomous` only with the complete `autonomy` contract and the controls in the [autonomous workflows guide](autonomous-workflows.md).
Autonomous mode describes workflow design and does not count as external-agent execution evidence.
Increment the recipe version whenever any of its seven source files changes, including a metadata schema migration, so installations and verification records never reuse a version for different bundle content.

A few boundaries to respect:

- Global adapter support and format facts belong to the central registry; do not copy them into recipe metadata.
- Recipes must not contain executable plugins, secrets, or long stretches of copied vendor documentation.
- Avoid vague instructions such as "fix everything"; every step should name something observable.
- Do not use autonomous mode when a normal-path approval, decision, or missing input would make the agent wait for the user.

See [CONTRIBUTING.md](https://github.com/kauanpolydoro/agentic-workflows/blob/main/CONTRIBUTING.md) for the full pull-request process.
