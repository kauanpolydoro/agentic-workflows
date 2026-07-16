# Pull request review: #42

## Scope and verdict

Reviewed merge base `a100000000000000000000000000000000000000` through head `b200000000000000000000000000000000000000`; the supplied diff and command record both identify the same head, so the comparison boundary is frozen [E1].
The reviewed paths are `src/delivery.ts` and `src/delivery.test.ts`, which match the complete supplied inventory with no renames, deletions, or generated artifacts [E2].
The acceptance criterion is "retry one transport timeout only when duplicate invoice creation is prevented, and preserve all non-timeout errors" [E2].
The external-write rule governs `src/delivery.ts`, the test-coverage and merge policy governs `src/delivery.test.ts`, and the supplied instruction map records no nested or conflicting rule for either path [E5, E7].
Recommended verdict: `request changes`, because one unresolved High finding is blocking under the supplied merge policy [E7].
No specialist review is required; the supplied rule and provider contract fully define the external-write concern [E8].
Submission remains pending repository-maintainer approval [E8].

## Findings

| Severity | Confidence | Finding | Evidence | Impact | Recommendation | Verification | Disposition |
|---|---|---|---|---|---|---|---|
| High | High, because the complete changed production hunk exposes both call sites and the governing contract states the key is the only deduplication mechanism | The `ETIMEDOUT` branch repeats the invoice-creation call without the `Idempotency-Key` required to deduplicate a retry whose first outcome is unknown. | E3, E5, E7 | Observation: both attempts call `client.post(invoice)` with no `options` argument, and no key is created elsewhere in the changed file [E3]. Inference: `ETIMEDOUT` does not establish whether the provider accepted the first request, and the provider deduplicates only on a matching key, so a retry can create a second invoice [E5]. The supplied rule forbids retrying an external invoice write after an unknown outcome without an idempotency key, and the policy classifies a plausible duplicate external write as High and blocking [E5, E7]. | Pass a stable invoice-specific idempotency key via `client.post(invoice, options)` on both attempts, or do not retry while the first outcome is unknown. | Add a local test that models a first request accepted by the provider followed by `ETIMEDOUT`, captures the options of both calls, and asserts the same non-empty key is sent twice. No such test is recorded as executed [E4, E6]. | Blocking |
| Medium | High, because the complete changed test hunk contains the only new assertions and the supplied inventory excludes any other changed test path | The changed test asserts the retry count but not the duplicate-prevention property the acceptance criterion requires. | E2, E4, E7 | Observation: the new test asserts `toHaveBeenCalledTimes(2)` and no assertion inspects an idempotency key; no test models an accepted first request followed by a local timeout [E4]. Impact: the suite can pass while the acceptance criterion remains violated, which is how the executed run reports 8 passing tests alongside the High finding [E6]. The policy rates a changed branch lacking a test for its required safety property as Medium while a separate blocking finding prevents merge [E7]. | Extend or replace the test with assertions for a stable idempotency key across both attempts, and add a non-timeout error case. | The executed command passed, but the required assertions are absent from the complete test diff, so the pass does not evidence the property [E4, E6]. | Open |

## Checks

### Executed

- `pnpm test delivery` exited 0 with 8 tests passing on head `b200000000000000000000000000000000000000` in the local Node.js test environment [E6].

### Proposed

- Run a local accepted-first-request simulation and assert identical non-empty idempotency keys on both calls [E4, E5].
- Exercise a non-timeout error and assert it is rethrown unchanged, as the acceptance criterion requires [E2, E3].

The proposed checks have not been executed; no end-to-end provider test or accepted-first-request simulation is recorded, and the executed unit run does not exercise the duplicate-write path [E6].

## Coverage disposition

| Changed file | Reviewed behavior | Evidence | Disposition |
|---|---|---|---|
| `src/delivery.ts` | Timeout classification, the repeated external write in the `ETIMEDOUT` branch, and the non-timeout rethrow path | E2, E3, E5 | High blocking finding on the repeated write; the non-timeout rethrow matches intent by inspection but carries a proposed regression check |
| `src/delivery.test.ts` | Timeout retry-count coverage and the absent duplicate-prevention assertion | E2, E4, E7 | Medium open finding |

Governing instructions are E5 for the production path and E7 for the test path; the supplied complete map records no additional nested instruction for either path [E5, E7].

## Assumptions and limitations

The review relies on the supplied diffs and inventory being complete for head `b200000000000000000000000000000000000000`, as their integrity records declare [E1, E2, E3, E4].
Provider behavior is limited to the supplied contract; no other provider-side duplicate protection is assumed [E5].
No end-to-end provider behavior and no accepted-first-request outcome were observed, so the duplicate-write risk is established from the contract rather than a reproduction [E5, E6].
The non-timeout rethrow is assessed from the diff text alone; no executed check confirms it [E3, E6].
This report recommends code and test changes; it does not claim either was implemented, and no file was modified during the review.

## Approval and next decision

The repository maintainer approves the immutable range, path inventory, finding dispositions, executed and proposed checks, and residual risk before this report is submitted; that approval has not occurred [E8].
No specialist security, database, or API review is required for this boundary [E8].
The merge recommendation may be reconsidered once the High finding is prevented or disproved and the proposed duplicate-prevention test passes on a new immutable head, which would require re-reviewing that new comparison range [E7].
Residual risk if merged as-is: a transport timeout can produce a duplicate invoice at the provider, undetected by the current suite [E3, E5, E6].

## Traceability

| Material conclusion | Evidence |
|---|---|
| Immutable range and reviewed head | E1 |
| Intent, acceptance criterion, and complete changed-file coverage | E2 |
| Repeated invoice-creation call without request options | E3 |
| Absent idempotency and duplicate-prevention assertions | E4 |
| Unknown timeout outcome, required deduplication key, and governing instruction map | E5 |
| Executed unit-test result and unexecuted provider simulation | E6 |
| High and Medium severity ratings and the `request changes` rule | E7 |
| Pending maintainer submission gate and no specialist review | E8 |
