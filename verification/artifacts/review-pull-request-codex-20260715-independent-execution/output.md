# Pull request review: synthetic PR #42

## Scope and verdict

**Merge recommendation:** `request changes`

**Review boundary**

- Base: `a100000000000000000000000000000000000000`
- Head: `b200000000000000000000000000000000000000`
- Merge base: `a100000000000000000000000000000000000000`
- Changed files: `src/delivery.ts`, `src/delivery.test.ts`
- Renames, deletions, generated files, or additional paths: none

The recorded revisions resolve locally, and the supplied diff, inventory, and test record identify the same immutable head. [E1, E2]

The requested behavior is to retry one transport timeout only when duplicate invoice creation is prevented, while preserving all non-timeout errors. [E2]

The implementation preserves non-timeout errors and limits the timeout path to one retry. However, both creation attempts use `client.post(invoice)` without the shared `Idempotency-Key` required for provider deduplication. Because `ETIMEDOUT` leaves the outcome of the first write unknown, the retry can create a duplicate invoice. [E3, E5]

This unresolved duplicate-write risk is High severity and blocking under repository policy. Therefore, the required verdict is `request changes`. [E7]

## Findings

| Severity | Confidence | Finding | Evidence | Impact | Recommendation | Verification | Disposition |
|---|---|---|---|---|---|---|---|
| High | High - the complete production diff shows both calls omit request options, while the provider contract explicitly requires the same idempotency header for deduplication. | **The timeout retry can create a duplicate invoice.** Observation: after `ETIMEDOUT`, the code repeats `client.post(invoice)` without an idempotency key. Inference: if the provider accepted the first call but its response timed out locally, the second call is an independent creation request. | E3, E5 | A single delivery operation can produce two external invoices. Repository policy classifies this plausible duplicate external write as High severity. | Generate or obtain a stable idempotency key before the first request and pass the same `Idempotency-Key` header to both attempts. Do not retry an unknown-outcome write unless deduplication is guaranteed. | Add a test that models an accepted first request followed by a local timeout and verifies that both calls carry the same non-empty idempotency key. Where a provider simulation is available, confirm that the repeated request produces one provider invoice. | **Blocking - open.** The supplied implementation neither prevents nor disproves duplicate creation. |
| Medium | High - the complete test diff exercises retry count but explicitly contains no accepted-first-request scenario or idempotency assertion. | **The changed timeout branch lacks coverage for its required safety property.** Observation: the new test proves that `ETIMEDOUT` triggers exactly two calls and returns the second result. It does not verify duplicate prevention. | E4, E5, E7 | The test suite can pass while the retry violates the repository's external-write safety invariant. | Extend the unit tests to assert that a stable idempotency key is attached to both attempts and add an accepted-first-request simulation when feasible. Retain coverage for one retry and non-timeout error preservation. | Run the updated delivery tests on the reviewed revision and retain the command, environment, exit status, and relevant assertions. | **Open.** Medium under the supplied policy because a separate High finding already blocks merge. |

## Checks

### Executed

| Command | Revision | Environment | Result | Evidentiary scope |
|---|---|---|---|---|
| `pnpm test delivery` | `b200000000000000000000000000000000000000` | Local Node.js test environment | Exit 0; 8 tests passed | Confirms the recorded delivery unit suite passed. It does not exercise an accepted first request followed by a local timeout or verify an idempotency key. [E6] |

No end-to-end provider test or accepted-first-request simulation was recorded as executed. [E6]

### Proposed

- Add and run a regression test proving that both creation attempts carry the same stable `Idempotency-Key`.
- Simulate the first request being accepted while its response times out locally, then verify that retrying cannot create a second invoice.
- Retain or add an explicit test proving that non-`ETIMEDOUT` errors are rethrown unchanged.
- Record all proposed commands against the resulting immutable head. These checks are unexecuted and must not be treated as passing.

## Coverage disposition

| Changed file | Reviewed behavior | Evidence | Disposition |
|---|---|---|---|
| `src/delivery.ts` | Awaits the initial external write, rethrows non-timeout errors, and retries once after `ETIMEDOUT`. Both attempts omit the idempotency option required for safe retry after an unknown outcome. | E2, E3, E5 | Fully reviewed from the supplied complete diff. Blocking duplicate-write defect remains open. |
| `src/delivery.test.ts` | Adds unit coverage for one successful retry after `ETIMEDOUT` and verifies two calls. It does not cover the required duplicate-prevention property. | E2, E4, E5, E7 | Fully reviewed from the supplied complete diff. Required safety regression coverage remains open. |

The changed-file inventory and complete diff cover the same two paths according to the supplied immutable records. [E1, E2, E3, E4]

The governing instruction map is complete: the external-write rule applies to `src/delivery.ts`, the test-coverage and merge policy applies to `src/delivery.test.ts`, and neither path has nested or conflicting instructions. [E5]

## Assumptions and limitations

- The supplied evidence is treated as the complete review boundary.
- Revision resolution, merge-base correctness, diff integrity, and inventory agreement rely on the supplied immutable records. They were not independently recomputed during this review. [E1, E2]
- Only the displayed complete diffs were used to assess implementation and test behavior. [E3, E4]
- The provider contract and repository rules are assumed complete and authoritative for this synthetic example. [E5]
- The passing unit-test command establishes only its recorded result and does not prove the unexercised duplicate-prevention property. [E6]
- No external provider was contacted, and no unreported command or check is claimed as executed.
- Specialist review is not required because the supplied provider contract and repository rule fully define the external-write concern. [E8]
- Residual risk remains High until the retry is made idempotent or evidence disproves duplicate creation.
- Any change to the recorded head invalidates this verdict and requires review of a new immutable comparison.

## Approval and next decision

The repository maintainer has not approved or submitted this exact review artifact. The human submission gate therefore remains pending. [E8]

Before merge consideration:

1. Resolve the High duplicate-write finding.
2. Add regression coverage for the idempotency safety property.
3. Execute and retain relevant checks against the new immutable head.
4. Re-review the resulting comparison range.
5. Obtain repository-maintainer approval for the exact updated report, findings, checks, residual risks, and verdict.

Until those conditions are satisfied, the merge recommendation remains `request changes`.

## Traceability

| Material conclusion | Evidence |
|---|---|
| The immutable boundary is base and merge base `a100000000000000000000000000000000000000`, head `b200000000000000000000000000000000000000`. | E1 |
| The complete changed-file inventory contains only `src/delivery.ts` and `src/delivery.test.ts`. | E2 |
| The acceptance criterion permits one timeout retry only when duplicate creation is prevented and requires preservation of non-timeout errors. | E2 |
| The implementation retries `client.post(invoice)` after `ETIMEDOUT` without adding request options or an idempotency key. | E3 |
| The added test verifies two calls and a successful second result but does not test duplicate prevention. | E4 |
| Provider deduplication requires the same `Idempotency-Key` on both requests, and timeout does not establish whether the first write succeeded. | E5 |
| Repository rules prohibit retrying an unknown-outcome invoice write without an idempotency key. | E5 |
| The recorded unit command passed 8 tests but did not exercise the blocking safety scenario. | E6 |
| A plausible duplicate external write is High severity and requires `request changes`; missing safety coverage is Medium in the presence of that blocker. | E7 |
| Maintainer approval is pending, and no specialist review is required for the supplied review boundary. | E8 |
