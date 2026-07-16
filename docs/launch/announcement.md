# Launch announcement draft

## Show HN title

Show HN: Portable workflows for Claude Code, Codex, Cursor and other coding agents

## Body

I built Agentic Workflows because reusable agent instructions often lose the engineering context that makes a procedure safe and reviewable.

The project ships 20 original workflows with strict YAML metadata and canonical Markdown.
Each one defines inputs, preconditions, decision points, safety constraints, approval gates, outputs, and completion evidence.

The offline TypeScript CLI can inspect and install exports for several documented agent formats.
It records hashes and refuses traversal, silent overwrite, or removal of locally modified files.

The verification model deliberately separates structural validation, installation testing, real agent execution, and human outcome review.
Most external-agent columns begin as Untested rather than inheriting a misleading verified badge.

I would especially value feedback from maintainers who repeat code review, migration, CI, or incident workflows and from contributors interested in fixture-backed verification.
