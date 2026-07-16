---
layout: home

hero:
  name: Agentic Workflows
  text: Evidence-oriented workflow bundles.
  tagline: Inspect structured procedures and install locally tested exporter bundles without confusing installation with agent execution.
  image:
    src: /logo.svg
    alt: Agentic Workflows interlocking path mark
  actions:
    - theme: brand
      text: Explore 20 workflows
      link: /catalog/
    - theme: alt
      text: Install from source
      link: /guide/installation

features:
  - icon: "01"
    title: Inspect the contract
    details: Every recipe declares inputs, guardrails, approval gates, outputs, and objective completion criteria.
  - icon: "02"
    title: Install the right export
    details: The CLI installs a complete project-local bundle and applies tested containment, transaction, and overwrite controls.
  - icon: "03"
    title: Verify what actually happened
    details: Structural validation, installation, agent execution, and human outcome review remain separate evidence stages.
---

## Start with work that repeats

Review a pull request, debug CI, plan a safe migration, synchronize documentation, or produce a blameless postmortem.
The canonical workflow remains readable Markdown; adapters package it for supported tools.

### Featured workflows

- [Review a pull request](./catalog/review-pull-request) with evidence-ranked findings.
- [Debug a failing CI pipeline](./catalog/debug-failing-ci) through falsifiable hypotheses.
- [Review a database migration](./catalog/database-migration-review) for locks, data loss, and rollout sequencing.

## Compatibility without inflated claims

Generic Markdown is the portability baseline.
Claude Code, Codex, Cursor, Gemini CLI, and OpenCode exporters follow documented project-local formats.
Retained evidence currently covers one `review-pull-request` execution for Claude Code and Codex.
Cursor, Gemini CLI, OpenCode, and every human outcome-review stage remain externally untested.

[See the compatibility matrix](./compatibility) and [understand verification](./guide/verification).

## Built for public maintenance

Recipes are data and instructions, never CLI plugins.
The CLI operates offline, collects no telemetry, and records hashes for safe updates and removal.
Contributors can scaffold a recipe, validate it locally, and submit explicit evidence without pretending that generated files prove agent outcomes.

[Read the authoring guide](./guide/authoring) or [contribute on GitHub](https://github.com/kauanpolydoro/agentic-workflows).
