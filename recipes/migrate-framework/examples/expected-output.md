# Express-to-Fastify S0 migration checkpoint dossier

> Synthetic migration-checkpoint example derived only from the supplied staging evidence.

## Dossier state and boundary

Migration state: S0 observed in staging; production and whole-migration completion blocked by explicit gates.

The application baseline is source commit `6f12a9d000000000000000000000000000000000`, artifact `orders-api-express:6f12a9d000000000000000000000000000000000`, Express 4.18.3, and Node.js 20.18.1 (E1).
The target pilot is Fastify 5.2.1 artifact `orders-api-fastify:fw-s0-17` on the same runtime (E1, E7).

Only `GET /health` and the four E7 paths belong to S0.
All product features, data-schema changes, authentication redesign, public contract changes, and non-health route implementations remain outside this checkpoint (E2, E7).

## Compatibility-gap register

| Surface | Local use | Disposition | Required evidence before migration | Owner role | Evidence |
| --- | --- | --- | --- | --- | --- |
| Fastify 5 runtime | all target slices | supported for supplied Node.js 20 runtime | attributed vendor record `fastify-5.2.1-runtime-support.json`, matching manifest identity, and target checks | repository maintainer | E1, E8 |
| health response serialization | S0 | implemented and verified | dual-framework contract cases | repository maintainer | E2, E7, E8 |
| request-ID adapter | S1 and S2 | available for slice design | existing dual-framework contract evidence must accompany each slice | repository maintainer | E3 |
| authentication and authorization | S2 and S3 | blocked | approved Fastify adapter and passing auth contract fixtures | security owner | E3, E11 |
| raw-body signature verification | S4 | unknown | official target integration support plus signature fixtures | integration owner | E3, E11 |
| global error mapping | S1 through S4 | incomplete | old-to-target error-body characterization per group | repository maintainer | E3, E11 |

No compatibility conclusion for S2 through S4 is inferred from the passing health pilot (E3, E11).

## Ordered vertical-slice map

| Order | Slice | Observable flow | State | Dependency or exit condition | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | S0 | unauthenticated health response | staging observation passed | production release-manager gate remains closed | E2, E7, E8, E10 |
| 2 | S1 | three read-only catalog routes | planned | implement route contracts and retain store-call checks | E3, E11 |
| 3 | S2 | three authenticated order routes | blocked | security owner accepts passing Fastify auth contracts | E3, E11 |
| 4 | S3 | two role-protected admin routes | blocked | S2 auth adapter plus authorization fixtures pass | E3, E11 |
| 5 | S4 | provider webhook verification | blocked | target raw-body support and signature fixtures pass | E3, E11 |

| Slice | Owner role | Ownership evidence |
| --- | --- | --- |
| S0 | repository maintainer | E10, E11 |
| S1 | repository maintainer | E11 |
| S2 | security owner | E11 |
| S3 | security owner | E11 |
| S4 | integration owner | E11 |

This ordering reflects integration risk and does not authorize later implementation (E3, E10, E11).

## S0 implementation contract

The Fastify path must return `200`, `content-type: application/json; charset=utf-8`, and `{"status":"ok"}` for `GET /health` (E2).
It must make zero authentication, storage, and external-service calls (E2, E6).

Checkpoint `fw-s0-17` implements the target bootstrap, health route, dual-framework health contract test, and staging health-weight configuration (E7).
Express remains deployable and unchanged (E7).

## Incremental validation record

| Check | Required result | Observed result | Disposition | Evidence |
| --- | --- | --- | --- | --- |
| lint | exit 0 | exit 0 | pass | E8 |
| typecheck | exit 0 | exit 0 | pass | E8 |
| unit tests | 124 pass | 124 pass | pass | E4, E8 |
| health contract | four cases on both paths | four cases pass on both paths | pass | E6, E8 |
| health side effects | zero auth, store, or external calls | zero calls on both paths | pass | E6, E8 |
| artifact identity | source checkpoint equals `fw-s0-17` | identity matches | pass | E7, E8 |

The broader 42-case HTTP baseline remains recorded for Express, but only the four health cases are target-framework evidence in this slice (E4, E8).

## Staging traffic and observation

The approved error ceiling is 0.30 percent, calculated from the 0.10 percent Express baseline plus 0.20 percentage points (E4, E6).
The approved p95 ceiling is 14.4 ms, calculated as a 20 percent increase over 12.0 ms (E4, E6).
The baseline and target stages used the same node class, runtime, `/health` request generator, 200-request-per-second total load, request distribution, error definition, duration metric, telemetry query, and absence of concurrent non-health work; only routing weight and target artifact changed (E4, E8).

| Stage | Fastify requests | Error rate | p95 | Result | Evidence |
| --- | --- | --- | --- | --- | --- |
| Express baseline, 60 minutes | not applicable | 0.10% | 12.0 ms | comparison baseline | E4 |
| 10% Fastify, 30 minutes | 36,000 | 0.12% | 12.7 ms | within both thresholds | E5, E8 |
| 50% Fastify, 30 minutes | 180,000 | 0.14% | 13.1 ms | within both thresholds | E5, E8 |

No staging abort condition occurred (E8).
These results do not constitute production evidence or approval (E10).

## Rollback dossier

Traffic rollback sets Fastify weight to zero and Express weight to 100 percent, targeting `orders-api-express:6f12a9d000000000000000000000000000000000` (E5).

In a disposable environment, the traffic and application drill restored the Express artifact and passed its health contract (E9).
Reapplying the target pilot restored Fastify and passed all four dual-framework health cases (E9).

If a future stage breaches any E6 threshold, the service operator must immediately return the health route to 100 percent Express, verify the E2 contract and E5 artifact identity, and preserve the failing telemetry before another checkpoint request (E2, E5, E6, E9).

## Approval and retirement gates

The repository maintainer approved S0 for staging, and the service operator approved and observed the two staging steps (E10).
No threshold exception was required because both stages remained within E6 (E8, E10).

Production traffic remains prohibited until the release manager reviews the exact artifact, contract results, staging sample, thresholds, monitoring ownership, and rollback evidence (E10).
Express removal remains prohibited until S0 through S4, production observation, consumer reconciliation, and the repository maintainer gate are complete (E10, E11).

## Residual risks, ownership, and closing criteria

| Risk or limitation | Current consequence | Owner role | Closing criterion | Evidence |
| --- | --- | --- | --- | --- |
| Authentication target contract absent | S2 and S3 remain on Express | security owner | approved adapter passes authentication and authorization fixtures | E3, E11 |
| Raw-body support unconfirmed | S4 remains on Express | integration owner | attributable support and provider signature fixtures pass | E3, E11 |
| Global target error mapping incomplete | non-health error compatibility is unknown | repository maintainer | each route group passes old-to-target error-body characterization | E3, E11 |
| No production traffic evidence | S0 cannot advance beyond staging | release manager | approve and observe a bounded production stage against E6 | E10 |

S0 is complete only as a staging-observed checkpoint.
The entire framework migration is not complete, and no date or estimate for later slices is asserted (E10, E11).

## Traceability summary

- Versions and artifacts: E1.
- HTTP contract: E2.
- Route and integration inventory: E3.
- Current baseline: E4.
- Coexistence controls: E5.
- Thresholds: E6.
- Implemented pilot: E7.
- Validation and observation: E8.
- Rollback: E9.
- Approvals: E10.
- Remaining ownership and exit conditions: E11.
