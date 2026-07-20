# Pull request review: PR #42 - timeout retry handling for the invoice-delivery client

## Scope and verdict

**Verdict: request changes** (derived from E7, applied to finding PR42-F1).

| Item | Value | Evidence |
| --- | --- | --- |
| Base revision | `a100000000000000000000000000000000000000` | E1 |
| Head revision | `b200000000000000000000000000000000000000` | E1 |
| Merge base | `a100000000000000000000000000000000000000` | E1 |
| Comparison range | `a100000000000000000000000000000000000000...b200000000000000000000000000000000000000` | E1, E2 |
| Changed-file inventory | `src/delivery.ts`, `src/delivery.test.ts`; no renames, deletions, or generated paths | E2 |
| Inventory agreement | The supplied diffs (E3, E4) account for the complete content of both inventoried paths and introduce no path outside the inventory | E2, E3, E4 |
| Governing instructions | External-write rule maps to `src/delivery.ts`; test-coverage and merge policy map to `src/delivery.test.ts`; no other nested or conflicting instruction for either path | E5, E7 |

**Intent (observation).** The acceptance criterion is to retry one transport timeout only when duplicate invoice creation is prevented, and to preserve all non-timeout errors (E2).

**Boundary status (observation).** The revision record, the diff hunks, and the command record all identify head `b200000000000000000000000000000000000000` (E1, E3, E4, E6), so the review boundary is frozen and failure modes F1, F2, and F4 do not apply to this review.

**Verdict rationale (inference).** Repository policy classifies a plausible duplicate external write as High and blocking, and requires `request changes` for any unresolved High finding (E7). PR42-F1 is High and unresolved, so `request changes` follows from the supplied policy rather than from reviewer preference.

## Findings

| Severity | Confidence | Finding | Evidence | Impact | Recommendation | Verification | Disposition |
| --- | --- | --- | --- | --- | --- | --- | --- |
| High | High | The `catch` branch reissues `client.post(invoice)` after `ETIMEDOUT` with the same arguments and no `Idempotency-Key`, and no idempotency header or key is created elsewhere in the changed file. `ETIMEDOUT` does not establish whether the provider accepted the first request, and the provider deduplicates repeated creation requests only when both calls carry the same `Idempotency-Key`. This violates the repository rule that external invoice writes must not be retried after an unknown outcome without an idempotency key. | E3, E5 | An invoice accepted by the provider before a local timeout can be created a second time, producing a duplicate billing record for the customer. | Generate one idempotency key per logical invoice creation, pass it on both the initial call and the retry through the documented `options` parameter of `client.post(invoice, options?)`, or remove the retry until deduplication is in place. | Falsifiable: exhibit code in the reviewed range that attaches a stable `Idempotency-Key` to both calls, or a provider-contract statement that creation requests deduplicate without one. Either would disprove this finding. | Open - blocking |
| Medium | High | The added test asserts only that `client.post` is called twice after one `ETIMEDOUT` rejection. No test models a first request accepted by the provider followed by a local timeout, and no assertion inspects an idempotency key, so the duplicate-prevention property required by the acceptance criterion is unexercised by the changed branch. | E2, E4 | The safety property that gates the retry can regress without any test failing, and the passing suite gives false assurance about the changed branch. | Add a test that simulates provider acceptance followed by `ETIMEDOUT` and asserts that no duplicate invoice results, plus an assertion that both calls carry the same idempotency key. | Falsifiable: exhibit a test in the reviewed range that asserts the duplicate-prevention or idempotency-key property. | Open - non-blocking |

**Severity rationale (traceable to policy).**
- PR42-F1 is High because E7 classifies a plausible duplicate external write as High and blocking. Plausibility, not proof of duplication, is the policy threshold, and E5 establishes that `ETIMEDOUT` leaves the first request's outcome unknown.
- PR42-F2 is Medium, not High, because E7 downgrades a changed branch that lacks a test for its required safety property when a separate blocking finding already prevents merge. PR42-F1 is that blocking finding.

**Confidence rationale.** Both ratings are High because each rests on the supplied complete diffs and the declared-complete contract and instruction map for both changed paths (E3, E4, E5), not on unstated repository context. Neither finding required inference about code outside the reviewed range.

### Questions, not findings

These are recorded as questions because the supplied evidence does not support asserting a defect. Per the workflow, a suspected defect that the diff or a reproduction cannot support is reported as a question.

- **Q1 - rejection shape.** The `catch` branch reads `error.code` (E3). The supplied evidence does not establish what the client rejects with in every failure mode. If a rejection can be a non-object value, reading `.code` would throw and mask the original error. No supplied evidence confirms or excludes that case, so this is not raised as a finding.
- **Q2 - retry ceiling.** The changed code performs at most one retry, which matches the "retry one transport timeout" wording of the acceptance criterion (E2, E3). Confirm with the author that a second consecutive timeout is intended to propagate to the caller rather than retry again.

### Behavior confirmed as intended (observation, not a finding)

The guard `if (error.code !== "ETIMEDOUT") throw error;` rethrows every non-timeout error unchanged, which satisfies the "preserve all non-timeout errors" half of the acceptance criterion (E2, E3).

## Checks

### Executed

| Check | Command | Reviewed revision | Environment | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Delivery unit suite | `pnpm test delivery` | `b200000000000000000000000000000000000000` | Local Node.js test environment | Exit 0, 8 tests passing | E6 |

**Interpretation (inference).** This passing result does not verify the duplicate-prevention property. E6 records that no end-to-end provider test and no accepted-first-request simulation ran, and E4 records that no such test exists in the reviewed range. Per the guardrail against treating a passing broad command as proof of an unexercised branch, the suite result is not evidence against PR42-F1 or PR42-F2.

### Proposed

None of the following ran. Each is labeled proposed, and no result is claimed for any of them.

| Proposed check | Claim it would test | Missing capability | Evidence |
| --- | --- | --- | --- |
| Unit test simulating provider acceptance followed by a local `ETIMEDOUT`, asserting exactly one invoice is created | PR42-F1 duplicate-write risk | No such test exists at the reviewed head; writing one would modify the repository, which this read-only review does not do | E3, E4 |
| Assertion that both `client.post` calls carry an identical `Idempotency-Key` | PR42-F1 and PR42-F2 idempotency property | Same as above; the reviewed code creates no key to assert on | E3, E5 |
| Provider sandbox end-to-end delivery test | Real deduplication behavior under timeout | Not executed per E6; contacting an external provider is excluded by the review constraints | E5, E6 |

## Coverage disposition

| Changed file | Reviewed behavior | Evidence | Disposition |
| --- | --- | --- | --- |
| `src/delivery.ts` | Unconditional `return client.post(invoice)` replaced by a `try`/`catch`: awaited initial call, rethrow of every non-`ETIMEDOUT` error, and one unguarded retry of the external invoice write with unchanged arguments and no idempotency key | E3, E5 | Behavior change - blocking finding PR42-F1; non-timeout rethrow reviewed and consistent with intent |
| `src/delivery.test.ts` | One added test asserting that an `ETIMEDOUT` rejection followed by a success resolves and calls `client.post` twice | E4 | Test change - exercises retry count only; insufficient for the required safety property, finding PR42-F2 |

**Coverage completeness (observation).** The inventory contains exactly two paths (E2), both are dispositioned above, and E3 and E4 each declare that they account for the complete changed file. There are no renames, deletions, generated artifacts, or no-op formatting hunks in this range (E2), so no removed protection is unaccounted for.

## Assumptions and limitations

**Assumptions.**
- The supplied evidence inventory is complete and accurate for head `b200000000000000000000000000000000000000`, as E3, E4, and E5 each declare for their scope.
- The instruction map in E5 is exhaustive. Both changed paths carry an explicit no-additional-rule disposition rather than an assumed gap, so failure mode F5 does not apply.
- The E7 policy is the governing severity and merge rubric for PR #42.

**Limitations.**
- This review is read-only and derives entirely from the synthetic evidence inventory E1 through E8. No repository was inspected, no command was run by this reviewer, and no external system was contacted.
- The only verification result available is a narrow unit-suite pass (E6). The duplicate-write claim in PR42-F1 is supported by the diff and the provider contract (E3, E5), not by an executed reproduction. It remains disprovable by the falsification step recorded in the finding register.
- Q1 and Q2 are unresolved for want of evidence about client rejection shape and author intent on repeated timeouts. They are excluded from the verdict.
- Runtime and performance characteristics of the retry, and behavior under concurrent delivery of the same invoice, are outside the supplied evidence and were not assessed.

**Residual risk.** If PR42-F1 is merged unaddressed, the residual risk is duplicate invoice creation for any request whose acceptance coincides with a transport timeout. No supplied test, check, or contract statement detects that condition today (E4, E5, E6). PR42-F2 means the risk would also be undetected by the suite after merge.

**Specialist review.** Not required. E8 records that no specialist review was requested because the supplied repository rule and provider contract fully define the external-write concern for this change (E5, E8). The change does not present an authentication, production-data, or public wire-contract boundary beyond the supplied evidence.

## Approval and next decision

- **Approval gate status: pending.** The repository maintainer has not reviewed or submitted this report (E8). Under the skill's human approval gate, this artifact is not submitted until the repository maintainer approves the immutable range, the path inventory, the finding dispositions, the executed and proposed checks, and the residual risks recorded above.
- **Reviewer role and artifact.** Prepared for maintainer approval as `pull-request-review.md` for PR #42 at head `b200000000000000000000000000000000000000`.
- **Head recheck required before submission.** This verdict is bound to head `b200000000000000000000000000000000000000` (E1). If the head changes, discard this verdict, invalidate findings whose lines moved, and restart the review from the new immutable comparison range per recovery procedure R4.
- **Next decision for the author.** Resolve PR42-F1 by attaching a stable idempotency key to both calls or by removing the retry, then close PR42-F2 with a test asserting the duplicate-prevention property. Once PR42-F1 is closed, the `request changes` verdict no longer follows from E7 and the range is eligible for re-review.

## Traceability

| Material conclusion | Evidence |
| --- | --- |
| The comparison range `a1000000...b2000000` is immutable and consistent across the revision record, both diffs, and the command record | E1, E3, E4, E6 |
| The reviewed inventory is exactly `src/delivery.ts` and `src/delivery.test.ts`, with no renames, deletions, or generated paths | E2 |
| Both changed paths have a complete governing-instruction map with no nested or conflicting rule | E5, E7 |
| The acceptance criterion conditions any timeout retry on prevented duplicate invoice creation and on preserving non-timeout errors | E2 |
| The retry reissues the external invoice write with unchanged arguments and no idempotency key | E3 |
| `ETIMEDOUT` leaves the first request's outcome unknown, and the provider deduplicates only on a matching `Idempotency-Key` | E5 |
| Retrying an external invoice write after an unknown outcome without an idempotency key violates the repository rule mapped to `src/delivery.ts` | E5 |
| PR42-F1 is High and blocking | E3, E5, E7 |
| The non-timeout rethrow satisfies the error-preservation half of the acceptance criterion | E2, E3 |
| No test covers the accepted-first-request-then-timeout case or asserts an idempotency key | E4 |
| PR42-F2 is Medium rather than High because a separate blocking finding already prevents merge | E4, E7 |
| `pnpm test delivery` exited 0 with 8 tests passing on head `b2000000` in a local Node.js environment | E6 |
| The passing suite does not verify the duplicate-prevention property, and no end-to-end or accepted-first-request check ran | E4, E6 |
| An unresolved High finding requires `request changes` | E7 |
| The maintainer approval gate is pending and no specialist review is required | E8 |
