# Recipe schema version 2

Schema version 2 changed one thing: facts about adapters no longer live inside individual `recipe.yml` files.

## Why it changed

Under schema version 1, every recipe repeated the same adapter facts: support level, export format, documentation state, tested version, verification date, and evidence.
Copying those values into 20 files meant they could drift out of sync, even though destination paths and serializers are global product behavior, not per-recipe facts.

The repeated `supported` value caused a subtler problem: it was easy to read as "an agent executed this workflow and someone approved the result", which it never meant.

## One central source of truth

`packages/core/src/adapters.ts` now owns everything global about each adapter: its ID, display name, support level, export format, destination pattern, naming rules, official documentation, format confirmation, exporter implementation, assumptions, and limitations.
Contract tests verify serialization and the complete temporary-directory installation lifecycle.

## What a recipe still declares

Each recipe declares only what is genuinely recipe-specific: whether its content is compatible with an adapter, and any limitation of that pairing.

```yaml
agents:
  codex:
    compatibility: compatible
    limitations: []
```

Here `compatible` means the recipe's content can be represented by that registered exporter, nothing more.
It does not mean the exporter is globally supported, that an external agent executed the workflow, or that a reviewer approved an outcome.

## Verification stays separate

Structural, installation, execution, and outcome states remain distinct from compatibility.
Tested agent versions and verification dates appear only when retained execution evidence supplies them.

See the [verification model](./verification.md) and the [adapter compatibility matrix](../compatibility.md).
