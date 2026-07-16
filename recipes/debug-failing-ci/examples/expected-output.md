# CI diagnosis: generated types are absent before type checking

> Synthetic CI-diagnosis artifact derived only from the supplied run, source, and command records.

## Status and run identity

Status: locally verified patch, pending repository-maintainer approval and external CI confirmation.

The failed execution is GitHub Actions run `700`, attempt `1`, job `typecheck`, on commit `abc1230000000000000000000000000000000000` using `ubuntu-24.04`, Node.js 22.11.0, and pnpm 10.1.0 [E1].

## Facts

- The first failing command is `pnpm typecheck`, which exits `2` because `src/index.ts` cannot resolve `./generated/types.js` [E3].
- The CI job installs dependencies and immediately runs type checking, with no generation or artifact-download step [E2].
- `pnpm generate:types` is the declared producer for `src/generated/types.ts`, and repository policy intentionally excludes that directory from version control [E4].
- The clean failing sequence reproduces the same TS2307 error, while adding the declared producer before type checking makes two clean runs exit `0` [E5].

## Environment and command-order comparison

| Dimension | Failing CI | Controlled local experiment | Assessment |
| --- | --- | --- | --- |
| Revision | `abc123...` | `abc123...` | Matched |
| Operating system | Ubuntu 24.04 runner | Ubuntu 24.04 | Matched |
| Node.js | 22.11.0 | 22.11.0 | Matched |
| pnpm | 10.1.0 | 10.1.0 | Matched |
| Cache | pnpm cache configured | Cache disabled | Not needed to reproduce |
| Generated types before typecheck | Absent | Tested as absent and present | Controlled variable |

Sources: E1, E2, and E5.

## Hypotheses and experiments

| Hypothesis | Prediction | Experiment | Result | Disposition |
| --- | --- | --- | --- | --- |
| The clean job omits the generated-type producer. | Typecheck fails without generation and passes when the producer runs first. | Execute both sequences on the same clean revision and environment. | Exit `2` without generation and exit `0` twice with generation. | Supported [E5] |
| A stale restored cache causes the missing module. | The failure disappears when the cache is disabled. | Reproduce with no restored cache. | The failure still occurs. | Rejected as the necessary cause [E5] |
| The generated directory should be committed. | Repository policy identifies tracked generation as the required state. | Inspect the producer and ignore policy. | The directory is intentionally untracked and must be produced in clean environments. | Rejected [E4] |

## Supported root cause

The `typecheck` job consumes `src/generated/types.ts` without first running its declared producer.
This statement explains the earliest causal error, the workflow order, and both controlled outcomes [E2, E3, E4, E5].

## Minimal causal patch

Target: `.github/workflows/ci.yml`.

```diff
 - run: pnpm install --frozen-lockfile
+- run: pnpm generate:types
 - run: pnpm typecheck
```

The disposable-branch record confirms that this is the only source change in the candidate and that no generated file is added to version control [E6].
Compiler rules, assertions, and required checks remain unchanged.

## Verification matrix

| Check | Revision or run | Result | Verification class | Evidence |
| --- | --- | --- | --- | --- |
| Original clean install then typecheck | `abc123...` | Exit `2`, TS2307 | Reproduced baseline | E5 |
| Generate types then typecheck, run 1 | `abc123...` plus one-line patch | Exit `0` | Local candidate | E5, E6 |
| Generate types then typecheck, run 2 | `abc123...` plus one-line patch | Exit `0` | Local repeatability | E5 |
| Unit tests after generation | `abc123...` plus one-line patch | Exit `0`, 14 passing | Local adjacent check | E6 |
| Equivalent external CI job | Not run | Pending | External CI | E7 |

The local results support the causal patch but do not establish that the external CI workflow has passed.

## Safety, approval, and rollback

No check, compiler rule, assertion, or threshold is disabled.
The rejected alternatives include committing generated files, removing the import, enabling `skipLibCheck`, and tolerating typecheck failure [E8].

The repository maintainer must approve the diagnosis, one-line workflow diff, local verification, and rollback before the patch is pushed [E7].
Rollback removes only the added `pnpm generate:types` step [E8].

## Residual uncertainty and next action

The external runner has not executed the candidate workflow, so provider-specific behavior remains unverified [E7].
The next action is for the repository maintainer to review E1 through E8 and, if approved, push the patch and record the resulting CI run ID and outcome.
If that run fails, its first causal failure becomes a new evidence package rather than being folded into this root-cause claim.

## Traceability

| Material claim or decision | Evidence |
| --- | --- |
| Immutable run and environment | E1 |
| Missing generation step in CI order | E2 |
| First causal TS2307 failure and exit code | E3 |
| Producer, consumer, and untracked-output policy | E4 |
| Controlled reproduction and falsification results | E5 |
| Named-path patch and local adjacent checks | E6 |
| Pending push approval and external CI state | E7 |
| Rollback and rejected unsafe alternatives | E8 |
