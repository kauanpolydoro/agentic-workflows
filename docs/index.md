---
layout: home

hero:
  name: Agentic Workflows
  text: Step-by-step playbooks for coding agents.
  tagline: Browse ready-made workflows for tools like Claude Code and Codex, read exactly what each one does, and install the ones you want with one command.
  image:
    src: /logo.svg
    alt: Agentic Workflows interlocking path mark
  actions:
    - theme: brand
      text: Browse the catalog
      link: /catalog/
    - theme: alt
      text: Get started
      link: /guide/installation

features:
  - icon: "01"
    title: Read it before you run it
    details: Every workflow is plain Markdown. You can see its inputs, steps, safety rules, and expected results before anything touches your project.
  - icon: "02"
    title: Install with one command
    details: The CLI copies a workflow into your project in the format your coding agent understands, and it never overwrites unmanaged files or replaces managed edits without explicit authorization.
  - icon: "03"
    title: Know what has been tested
    details: Every workflow shows its real verification status. When something has not been tested with a given agent yet, the catalog says so instead of implying it works.
---

## Start with work that repeats

Most engineering work follows a pattern: review a pull request, debug a failing CI run, plan a database migration, write release notes.
Each workflow in this catalog turns one of those patterns into a clear procedure that a coding agent can follow and a human can check.
The original workflow is always readable Markdown; exporters package that same content for the tools you already use.

### Featured workflows

- [Review a pull request](./catalog/review-pull-request), with every finding tied to evidence you can verify.
- [Debug a failing CI pipeline](./catalog/debug-failing-ci) by testing one hypothesis at a time.
- [Review a database migration](./catalog/database-migration-review) before it locks a table or loses data.

## Honest about what works where

Every workflow works as plain Markdown with any tool that can read a file.
On top of that, dedicated exporters produce the project-local formats used by Claude Code, Codex, Cursor, Gemini CLI, and OpenCode.
Exporters and real agent runs are tested separately, and the site never blurs the two: the [compatibility matrix](./compatibility) shows exactly which combinations have recorded evidence and which remain untested.

[See the compatibility matrix](./compatibility) or [learn how verification works](./guide/verification).

## Nothing runs behind your back

A workflow is data: YAML and Markdown, never a plugin or a script.
The CLI works offline, collects no telemetry, and keeps a hash of every file it installs so updates and removals never destroy your edits silently.
If you want to write your own workflow, you can scaffold one, validate it locally, and submit it with evidence of what you actually tested.

[Read the authoring guide](./guide/authoring) or [contribute on GitHub](https://github.com/kauanpolydoro/agentic-workflows).
