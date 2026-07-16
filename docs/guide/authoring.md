# Authoring workflows

Create a scaffold from the repository root:

```bash
pnpm new:recipe my-workflow
```

The scaffold deliberately contains visible replacement markers and cannot pass final review as written.

1. Replace every marker with observable actions and evidence.
2. Declare required and optional inputs separately.
3. Name destructive operations and human approval gates explicitly.
4. Include realistic input and expected-output examples.
5. Declare adapter support only when an official source confirms the format.
6. Add evidence only after the corresponding activity occurs.
7. Run `pnpm validate:recipes`, `pnpm validate:content`, tests, and the docs build.

Follow the [recipe quality standard](../quality/recipe-quality-standard.md) and use schema version 2 agent compatibility declarations.

Global adapter support and format fields belong to the central registry and must not be copied into recipe metadata.

Do not include executable recipe plugins, secrets, vendor documentation copied at length, or vague commands such as “fix everything.”
See [CONTRIBUTING.md](https://github.com/kauanpolydoro/agentic-workflows/blob/main/CONTRIBUTING.md) for the full pull-request process.
