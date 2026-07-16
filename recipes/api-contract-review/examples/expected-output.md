# API contract compatibility report

> Synthetic contract-review example derived only from the companion evidence package.

## Scope

Endpoint: `GET /v1/users/{id}`.
Released revision: `users-v1@c100` at `/v1` [E1].
Candidate revision: `users-v1@c200`, proposed in place at `/v1` [E2].
Implementation revision `impl@d200` matches both candidate changes and contains no compatibility branch [E3].

## Compatibility matrix

| Difference | Released form | Candidate form | Producer direction | Consumer direction | Evidence |
|---|---|---|---|---|---|
| 404 content type and body | `text/plain` string | `application/json` object with constant code | The candidate implementation emits only the new form, so its source does not satisfy the released response contract; no response was executed. | The CLI v2 parser contract accepts only the released content type; the web v5 parser contract accepts both; no parser execution ran and unlisted clients are unknown. | E1, E2, E3, E4, E6 |
| Required `email` value | Non-null string | String or null | The candidate implementation may emit null and cannot guarantee the released non-null contract; no response was executed. | The CLI v2 parser contract requires a non-null string; the web v5 parser contract accepts null; no parser execution ran and unlisted clients are unknown. | E1, E2, E3, E4, E6 |

Both differences are consumer-breaking under the supplied policy [E5].

## Findings

| Severity | Confidence | Finding | Evidence | Impact | Recommendation | Verification | Disposition |
|---|---|---|---|---|---|---|---|
| Medium | High for contract incompatibility; runtime untested | Replacing `/v1` in place creates a 404 contract that is incompatible with the retained CLI v2 parser contract. | E1, E2, E3, E4, E5, E6 | Inference: if CLI v2 behaves as its retained parser contract states, the candidate content type would cause its missing-user flow to reject the response. No client failure was observed, and the supplied policy classifies a retained parser-contract incompatibility without executed failure as Medium. | Preserve released `/v1`; expose the candidate behavior only through `/v2` after supported client path adoption, or add a policy-approved compatibility response. | Replay released and candidate 404 fixtures through CLI v2 and producer contract tests. No test ran. | Blocking in-place release and pending CLI-owner migration approval |
| Medium | High for contract incompatibility; runtime untested | The candidate makes required `email` nullable; the CLI v2 parser contract requires non-null, the web v5 parser contract accepts null, and other consumers are unknown. | E1, E2, E3, E4, E5, E6 | Inference: CLI v2 could receive a value outside its model if it adopted `/v2`; impact on unlisted consumers cannot be quantified. No null-handling failure was observed. | Put nullable behavior behind `/v2`, publish migration examples, require explicit path adoption by each known client, and retain `/v1` until client, usage, and monitoring gates pass. | Replay non-null and null fixtures through both known parsers and define a privacy-safe null-handling signal, baseline, and threshold. No test, usage collection, or null-handling monitor exists. | Open compatibility risk; blocking in-place release and `/v2` traffic until monitoring is complete |

## Recommendation

Do not replace the existing behavior in place.
Preserve released behavior on `/v1` and propose the candidate contract on `/v2`, because the gateway supports separate version routes but not per-client routing [E1, E2, E7].
Provide both known client owners with old and new success and error fixtures, migration requirements, and the 30-day removal policy [E4, E5].
Require the web v5 owner to approve and verify changing its requested path from `/v1` to `/v2`; parser compatibility alone does not adopt the new path [E4, E7].
Do not schedule `/v1` removal until notice has elapsed, privacy-safe zero-use evidence exists, and client dispositions are approved [E5, E7].

## Verification plan

### Executed

No producer, consumer, integration, or rollout command was executed [E6].

### Proposed

- Validate both OpenAPI artifacts and run producer tests for released text 404, candidate JSON 404, non-null email, and null email [E1, E2, E6].
- Replay all four fixtures through CLI v2 and web v5 and retain parser results by client version [E4, E6].
- Verify `/v1` remains on the released handler while `/v2` serves only the candidate handler, then rehearse atomic `/v2` rollback [E7].
- Define and approve a privacy-safe signal, baseline, and abort threshold for null-email handling before any client sends traffic to `/v2` [E7].
- Verify the CLI and web path changes separately; the gateway cannot migrate either client by identity [E4, E7].

The rollout remains blocked until these results exist, null-email monitoring is defined, and the API owner and affected client owners approve the versioning and path-adoption design.

## Limitations

Only CLI v2 and web v5 appear in the supplied inventory [E4].
No conclusion is made about compatibility, ownership, or usage for unlisted consumers.
The implementation diff is supplied as complete for the two changes, but no runtime response was observed [E3, E6].

## Decision record

The release decision remains blocked until the API owner approves the versioned endpoint design [E7].
The decision must include migration evidence from the CLI owner because the CLI v2 parser contract accepts only the released 404 content type and models email as non-null [E4].
Web v5 needs no parser-shape change for the supplied responses, but its owner must still approve and verify `/v2` path adoption [E4, E7].
Neither client owner has approved a migration plan [E7].

## Monitoring and rollback

1. Keep `/v2` traffic blocked while producer and parser tests, API-owner approval, client-owner path-adoption approvals, and a null-email signal and threshold are missing [E6, E7].
2. After those gates pass, each approved client owner changes that client's requested path to `/v2`; the gateway cannot create a client cohort or migrate a client by identity [E4, E7].
3. For each approved path adoption, monitor the aggregate 404 parse-failure counter by API and client version for 30 minutes using the retained baseline method and one-minute counter resolution, without retaining bodies, emails, user IDs, or internal errors [E7].
4. Abort the adoption if the 404 parse-failure rate reaches 1.5 percent, compared with the retained 100-of-10,000 baseline from `2026-01-10T14:00:00Z` through `2026-01-10T14:30:00Z`, or if the separately approved null-email threshold or another approved client signal is breached [E7].
5. Roll back `/v2` atomically to its previous handler revision and direct the affected client owner to restore `/v1`; do not claim per-client gateway rollback because that capability does not exist [E7].
6. Keep `/v1` and its handler until the 30-day notice, zero-use evidence, client-owner dispositions, and API-owner removal approval all pass [E5, E7].

## Client-impact register

| Client | Retained parser contract | Impact | Owner and migration status | Evidence |
|---|---|---|---|---|
| CLI v2 | `/v1`, text 404, non-null email | Parser contract is incompatible with both candidate differences; runtime result untested | CLI owner identified; parser and `/v2` path migration not approved or tested | E4, E6, E7 |
| Web v5 | `/v1`, accepts both 404 forms and nullable email | Parser contract is compatible with both shapes; runtime result untested | Web owner identified; `/v2` path adoption not approved or tested | E4, E6, E7 |
| Unlisted consumers | Unknown | Unknown | Owner discovery and privacy-safe usage evidence required | E4, E5 |

## Traceability

| Material conclusion | Evidence |
|---|---|
| Released wire shape and `/v1` selector | E1 |
| Candidate nullable email, JSON error, and in-place proposal | E2 |
| Candidate implementation matches the candidate contract without compatibility behavior; runtime is unobserved | E3, E6 |
| Known parser contracts, owners, unexecuted status, and unknown consumers | E4, E6 |
| Breaking classification, severity, and 30-day removal policy | E5 |
| Required tests were not executed | E6 |
| Version routing, absence of cohort routing, complete 404 baseline method and sample, 404-only monitoring coverage, and pending approvals | E7 |
