# Synthetic CI failure evidence package

This example is synthetic and self-contained.
No repository, provider page, or service outside this file is required to produce the expected output.

## Objective

Diagnose why the `typecheck` job fails, prepare the smallest supported workflow patch, and distinguish local validation from external CI verification.

## Scope and constraints

- The only authorized source change is `.github/workflows/ci.yml`.
- Generated files remain untracked by repository policy.
- Required checks and TypeScript compiler settings cannot be disabled or weakened.
- Commands may be described as executed only when an evidence item records an exit code.
- No deploy, publish, production credential, or external service is authorized.

## Evidence inventory

### E1 - Immutable CI run identity

- Provider: GitHub Actions.
- Run ID: `700`.
- Attempt: `1`.
- Job: `typecheck`.
- Runner image: `ubuntu-24.04`.
- Runtime: Node.js `22.11.0` and pnpm `10.1.0`.
- Checkout commit: `abc1230000000000000000000000000000000000`.
- The provider metadata and checkout line contain the same commit.
- Establishes the immutable failing execution and environment.

### E2 - Workflow at the failing commit

- Path: `.github/workflows/ci.yml`.
- The complete relevant command order is shown below.

```yaml
- uses: actions/checkout@v4
- uses: pnpm/action-setup@v4
  with:
    version: 10.1.0
- uses: actions/setup-node@v4
  with:
    node-version: 22.11.0
    cache: pnpm
- run: pnpm install --frozen-lockfile
- run: pnpm typecheck
```

- No artifact download or generation step appears in the job.
- Establishes the exact CI order and patch target.

### E3 - Complete sanitized first-failure log

```text
Run pnpm typecheck
> synthetic-project@1.4.0 typecheck
> tsc --noEmit
src/index.ts(2,29): error TS2307: Cannot find module './generated/types.js' or its corresponding type declarations.
ELIFECYCLE Command failed with exit code 2.
Process completed with exit code 2.
```

- The log is complete for the first failing command and contains no secret values.
- Establishes the first causal failure and exit code.

### E4 - Repository producer and generated-file policy

- `package.json` defines `"generate:types": "node scripts/generate-types.mjs"`.
- `scripts/generate-types.mjs` writes `src/generated/types.ts`.
- `.gitignore` includes `src/generated/`.
- `src/index.ts` imports `./generated/types.js`.
- Repository policy requires generation in clean environments and forbids committing `src/generated/`.
- Establishes that type checking consumes an intentionally untracked generated module.

### E5 - Clean reproduction and controlled experiment

- Environment: a clean checkout of `abc1230000000000000000000000000000000000`, Ubuntu 24.04, Node.js 22.11.0, pnpm 10.1.0, and no restored cache.
- `pnpm install --frozen-lockfile && pnpm typecheck` exited `2` with the same TS2307 error.
- `pnpm install --frozen-lockfile && pnpm generate:types && pnpm typecheck` exited `0`.
- Repeating the corrected sequence from a second clean checkout also exited `0`.
- Establishes reproduction, prediction, and repeatability for the missing-producer hypothesis.

### E6 - Candidate patch and local adjacent verification

- A disposable branch inserted `- run: pnpm generate:types` after frozen installation and before type checking in `.github/workflows/ci.yml`.
- On commit `abc1230000000000000000000000000000000000` plus only that uncommitted workflow patch, `pnpm generate:types && pnpm typecheck` exited `0`.
- In the same clean environment, `pnpm test` exited `0` with `14` tests passing.
- `git diff -- src/generated` showed no tracked generated-file change.
- Establishes the named patch and local verification results.

### E7 - Approval and external verification state

- The repository maintainer has not yet approved pushing the workflow patch.
- No external CI run contains the patch.
- The authorized next action is to submit E1 through E6, the one-line diff, and the rollback instruction to the repository maintainer.
- Establishes that external CI verification and push approval are pending.

### E8 - Rollback and rejected alternatives

- Rollback is removal of the single `pnpm generate:types` workflow step.
- Deleting the import, committing generated files, adding `skipLibCheck`, and allowing typecheck failure are outside scope because they do not restore the required producer.
- Establishes the reversible boundary and forbidden alternatives.
