# Broken TypeScript CI fixture

This fixture intentionally contains three deterministic and separate failures: incorrect addition behavior, a type error, and a lint marker.
It exists only for local workflow exercises.

Run `pnpm exec tsc`, then `node --test` after emitting, and `node scripts/lint.js`.
Each command is expected to fail before a workflow applies a fix.
