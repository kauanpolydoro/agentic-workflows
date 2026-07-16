# Recipe anatomy

A recipe directory is a versioned, reviewable unit:

```text
recipes/<workflow-id>/
├── recipe.yml
├── workflow.md
├── README.md
├── checklist.md
└── examples/
    ├── input.md
    └── expected-output.md
```

`recipe.yml` is strict metadata validated against [the generated JSON Schema](https://github.com/kauanpolydoro/agentic-workflows/blob/main/generated/recipe.schema.json).
Unknown fields, invalid enums, malformed IDs, invalid dates, and missing files fail validation.

`workflow.md` is the canonical source and always follows the same fifteen-section contract, from Objective through Example.
The checklist is optimized for execution while examples calibrate evidence quality.

Adapter status and verification stages live in metadata so readers can distinguish portable content from tested external behavior.
