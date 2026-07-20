# Pull request review: #42

## Scope and verdict

Reviewed merge base `a100000000000000000000000000000000000000` through head `b200000000000000000000000000000000000000` [E1].
The two reviewed paths are `src/delivery.ts` and `src/delivery.test.ts`, which match the complete supplied inventory [E2].
The external-write rule governs `src/delivery.ts`, the supplied test-coverage and merge policy governs `src/delivery.test.ts`, and the instruction inventory records no nested or conflicting rule for either path [E5, E7].
Recommended verdict: `request changes` because one unresolved High finding is blocking under the supplied merge policy [E7].
Submission remains pending repository-maintainer approval [E8].

## Findings

| Severity | Confidence | Finding | Evidence | Impact | Recommendation | Verification | Disposition |
|---|---|---|---|---|---|---|---|
| High | High, because the complete changed production hunk and governing provider contract directly expose both request arguments and the missing required key | The `ETIMEDOUT` branch repeats the invoice-creation call without the idempotency key required to deduplicate an unknown-outcome retry. | E3, E5, E6, E7 | Observation: both attempts use `client.post(invoice)` with no options. Inference: because a timeout does not prove rejection, the provider may create two invoices. The supplied policy classifies this duplicate-write risk as High. | Pass a stable invoice-specific idempotency key on both attempts, or stop retrying when the first outcome is unknown. | Add a local test that models an accepted first call followed by `ETIMEDOUT`, captures both request options, and proves the same non-empty key is sent twice. No such test was executed. | Blocking |
| Medium | High, because the complete changed test hunk shows the only new assertion and the supplied inventory excludes other changed tests | The changed test checks retry count but does not check the required duplicate-prevention property. | E2, E4, E6, E7 | The suite can pass while the acceptance criterion remains violated. | Replace or extend the test with assertions for a stable idempotency key and preserved non-timeout errors. | The existing command passed, but the required assertions are absent from the complete test diff. | Open |

## Checks

### Executed

- `pnpm test delivery` exited 0 with 8 tests passing on head `b200000000000000000000000000000000000000` [E6].

### Proposed

- Run a local accepted-first-request simulation and assert identical non-empty idempotency keys on both calls [E4, E5].
- Exercise a non-timeout error and assert that it is rethrown, as required by the acceptance criterion [E2].

The proposed checks have not been executed [E6].

## Coverage disposition

| Changed file | Reviewed behavior | Evidence | Disposition |
|---|---|---|---|
| `src/delivery.ts` | Timeout classification, repeated external write, and non-timeout rethrow branch | E2, E3, E5 | High finding plus a proposed non-timeout regression check |
| `src/delivery.test.ts` | Timeout retry count and missing duplicate-prevention assertion | E2, E4 | Medium finding |

Governing instructions are E5 for the production path and E7 for the test path, with no additional nested instruction in the supplied complete map [E5, E7].

## Assumptions and limitations

The review relies on the supplied diffs and inventory being complete for head `b200000000000000000000000000000000000000` [E1, E2].
The provider behavior is limited to the supplied contract; no other provider-side protection is assumed [E5].
No end-to-end provider behavior was observed [E6].
The report recommends code and tests but does not claim either was implemented.

## Approval and next decision

The repository maintainer may reconsider the merge recommendation after the High finding is prevented or disproved and the proposed safety-property test passes on a new immutable head.
The report itself is not submitted until the maintainer approves the range, findings, checks, and residual risk [E8].

## Traceability

| Material conclusion | Evidence |
|---|---|
| Immutable range and reviewed head | E1 |
| Intent and complete changed-file coverage | E2 |
| Repeated call without request options | E3 |
| Missing idempotency assertion | E4 |
| Unknown timeout outcome and required deduplication key | E5 |
| Executed test result and unexecuted provider simulation | E6 |
| High and Medium severity plus `request changes` rule | E7 |
| Pending repository-maintainer submission gate | E8 |
