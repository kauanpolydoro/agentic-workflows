# Launch announcement draft

## Show HN title

Show HN: Portable workflows for Claude Code, Codex, Cursor and other coding agents

## Body

I built Agentic Workflows because reusable agent instructions tend to lose the engineering context that makes a procedure safe and reviewable.
A saved prompt tells an agent what to do, but not what evidence to collect, when to stop, or who has to approve the risky parts.

The current Unreleased source tree contains 21 original workflows written as strict YAML metadata plus canonical Markdown.
The schema version 4 metadata migration remains `blocked` until one cross-cutting human review is retained, the first autonomous workflow is separately `blocked` pending its human domain review, and the published npm package at version `0.2.2` predates both changes.
Each one defines its inputs, preconditions, decision points, safety constraints, approval gates, outputs, and the evidence that counts as completion.

There is an offline TypeScript CLI that inspects the catalog and installs workflows in several documented agent formats.
It records file hashes and refuses path traversal, silent overwrites, and removal of files you have modified locally.

One design decision I care about: the verification model keeps structural validation, installation testing, real agent execution, and human outcome review as separate claims.
Most external-agent columns start as untested instead of inheriting a misleading "verified" badge.

I would especially value feedback from maintainers who repeat code review, migration, CI, or incident workflows, and from anyone interested in fixture-backed verification.
