# Suggested initial issues

These issues are drafts for maintainers to open manually after launch.

## Verify generic installation across operating systems

Labels: `verification`, `good first issue`

Run the documented lifecycle in temporary directories on Linux, macOS, and Windows, retain sanitized command logs, and add evidence without claiming external-agent execution.

## Execute review-pull-request with one supported agent

Labels: `verification`, `workflow`

Choose an included fixture, record the exact agent version and environment, retain non-sensitive outputs, and review the result against completion criteria.

## Audit adapter source drift quarterly

Labels: `adapter`, `documentation`, `help wanted`

Revisit each official source, record format changes, update serializers and tests, and leave unconfirmed formats unchanged.

## Improve Windows path edge-case coverage

Labels: `bug`, `help wanted`

Add temporary-directory tests for drive roots, mixed separators, junctions, long paths, and paths containing spaces without touching real user files.

Recommended labels: `good first issue`, `help wanted`, `workflow`, `adapter`, `documentation`, `bug`, `security`, `verification`, and `breaking change`.
