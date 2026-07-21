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
4. Write realistic input and expected-output examples.
5. Declare adapter support only when an official source confirms the format.
6. Add evidence only after the corresponding activity has actually happened.
7. Run `pnpm validate:recipes`, `pnpm validate:content`, the tests, and the docs build.

Follow the [recipe quality standard](../quality/recipe-quality-standard.md) and use schema version 3 for recipe metadata.
Agent compatibility declarations belong to each recipe, while global adapter support and format facts remain in the central registry.

A few boundaries to respect:

- Global adapter support and format facts belong to the central registry; do not copy them into recipe metadata.
- Recipes must not contain executable plugins, secrets, or long stretches of copied vendor documentation.
- Avoid vague instructions such as "fix everything"; every step should name something observable.

See [CONTRIBUTING.md](https://github.com/kauanpolydoro/agentic-workflows/blob/main/CONTRIBUTING.md) for the full pull-request process.
