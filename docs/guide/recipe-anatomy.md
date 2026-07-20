# Recipe anatomy

Every workflow in the catalog lives in its own directory under `recipes/`, and every directory contains the same set of files:

```text
recipes/<workflow-id>/
├── recipe.yml
├── workflow.md
├── README.md
├── checklist.md
├── output.schema.json
└── examples/
    ├── input.md
    └── expected-output.md
```

Here is what each file is for:

- **`recipe.yml`** holds the metadata: title, summary, inputs, outputs, safety rules, and which agents the recipe is compatible with.
  It is validated against [a strict JSON Schema](https://github.com/kauanpolydoro/agentic-workflows/blob/main/generated/recipe.schema.json), so unknown fields, invalid values, malformed IDs, invalid dates, and missing files all fail validation.
- **`workflow.md`** is the workflow itself and the single source of truth.
  Every workflow follows the same fifteen sections, from Objective through Example, so once you have read one recipe you can find your way around all of them.
- **`README.md`** explains the recipe to a human who is deciding whether to use it.
- **`checklist.md`** is a compact version of the steps, made for ticking off during execution.
- **`output.schema.json`** describes the shape of the artifact the workflow is expected to produce.
- **`examples/`** contains a complete synthetic input and its matching expected output, so you can see what good evidence looks like before running anything.

Adapter compatibility and verification status live in the metadata, not in the prose.
That separation lets you tell portable content apart from tested claims about external tools.
