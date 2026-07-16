# Recipe schema version 2

Recipe schema version 2 removes global adapter facts from every `recipe.yml` file.

## Why it changed

Schema version 1 repeated support level, export format, documentation state, tested version, date, and evidence for every agent in every recipe.

Those values could drift even though destination paths and serializers are global product behavior.

The repeated `supported` value was also easy to misread as external-agent execution or outcome approval.

## Central source of truth

`packages/core/src/adapters.ts` now owns each adapter's ID, display name, support level, specialized export format, destination pattern, naming rules, official documentation, format confirmation, exporter implementation, assumptions, and limitations.

Contract tests verify serialization and the complete temporary-directory installation lifecycle.

## Recipe-specific declaration

Each recipe declares only whether its canonical content is compatible with an adapter and any recipe-specific limitation:

```yaml
agents:
  codex:
    compatibility: compatible
    limitations: []
```

`compatible` means the recipe content can be represented by that registered exporter.

It does not mean the exporter is globally supported, an external agent executed the workflow, or a reviewer approved an outcome.

## Verification remains separate

Structural, installation, execution, and outcome states remain distinct.

Tested agent versions and external verification dates appear only when retained execution evidence supplies them.

See the [verification model](./verification.md) and [adapter compatibility matrix](../compatibility.md).
