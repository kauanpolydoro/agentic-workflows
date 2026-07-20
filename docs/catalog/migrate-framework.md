---
title: "Migrate a framework through controlled vertical slices"
description: "Migrate a versioned application to a supported framework through coexisting slices, each held to contract checkpoints and measured traffic stages, with rollback retained throughout."
---

# Migrate a framework through controlled vertical slices

## Objective

Start from one versioned application and the evidence of how it behaves today.
Turn that into a compatibility register, an ordered set of migration slices that can each be recovered on their own, and a traffic and rollback dossier.
Preserve the public contract at every checkpoint.
Keep the old path in place until measured observation and role-based approval establish that removing it is safe.

## When to use

- Use this workflow when the current and target framework versions are pinned exactly, and the target can coexist with the current path for a bounded user flow.
- Use it when you can verify contracts, supported integrations, traffic controls, and operational thresholds one slice at a time.
- Use it for migrations risky enough to require explicit staging, canary, rollback, and final old-path retirement gates.

## When not to use

- Do not begin a slice while support for its target runtime, or for an integration it requires, is unknown, unofficial, or outside the project's support policy.
- Do not use this recipe when public behavior has no reproducible baseline, or when the selected slice cannot be routed back to the current path.
- Do not use it to justify an unrestricted rewrite, an architecture redesign, or unrelated feature development.
- Do not switch traffic when monitoring, abort controls, responsible roles, or observation windows are missing.
- Do not remove the old path while any consumer, migration slice, or rollback dependency is still unresolved.

## Required inputs

- **Immutable application revision with exact current, target framework, runtime, and coupled dependency versions:** provide the manifests, lockfiles, runtime policy, deployment artifact identity, and the version of every framework-specific plugin or middleware.
  Pinning all of this freezes the compatibility question, so you reason about one snapshot instead of a moving target.
  Validate the revision, and reconcile the supplied versions against resolved artifacts rather than version ranges alone.
- **Public behavior contract, route or component inventory, and reproducible characterization baseline:** for every slice candidate, provide request and response schemas, status codes, headers, errors, side effects, user flows, commands, environment, results, and current operational measurements.
  These records define the behavior the migration must preserve.
  Reject any slice whose contract or baseline cannot be exercised independently.
- **Official migration guidance with a local compatibility disposition for every framework-coupled surface:** retain attributable target-framework and integration records, then map each route, middleware, plugin, lifecycle hook, template, or state facility to supported, adapter-required, replacement-required, blocked, or unknown.
  Stop when a required surface is unknown or unsupported and no approved alternative exists.
- **Coexistence, traffic, checkpoint, observation, approval, and rollback controls:** provide the routing mechanism, deployment topology, traffic increments, health signals, thresholds, observation durations, abort conditions, owner roles, the last-known-good identity, and a tested restoration procedure.
  Validate these controls in a non-production environment before requesting any production traffic.

## Optional inputs

- Comparable latency, error-rate, saturation, and resource measurements turn each checkpoint into a quantitative gate.
  When a metric is missing, report that dimension as unassessed and do not claim improvement.
- A consumer inventory and a deprecation policy can determine when the old path, or a compatibility facade, may be retired.
- A privacy-reviewed production trace can improve characterization for rare flows, without authorizing any disclosure of user data.

## Preconditions

- The immutable revision resolves, and the deployed baseline artifacts identify that revision.
- The target framework, and every integration the selected slice requires, have attributable support for the retained runtime.
- Current-path contract checks pass, or every existing failure has an owner and a disposition.
- The selected slice has a stable routing key and can coexist with the current implementation.
- Traffic can return to the current path without a data migration or an irreversible side effect.
- Monitoring and abort signals use comparable methods, and they have been exercised outside production.
- The required approver roles, and the authority of each traffic gate, are recorded.

## Workflow

### Phase 1 - Establish the migration boundary

1. Record the immutable application revision, the current and target framework versions, the runtime, the deployment artifacts, the route or component inventory, and the redesign work you are explicitly excluding.
   Produce a scope ledger that keeps the framework migration separate from product changes.
   Advance only when the working tree and the deployed baseline reconcile with the recorded revision; stop on unexplained drift.
2. Capture public contracts, side effects, dependencies, and baseline command and telemetry results for each candidate user flow.
   Produce a characterization matrix tied to the current framework.
   Advance only when at least one low-coupling flow has objective contract and rollback checks.

### Phase 2 - Resolve compatibility and order the slices

3. Map the complete official migration guidance, and each framework-coupled package, to actual local usage.
   Classify every surface as supported, adapter-required, replacement-required, blocked, or unknown, recording a source and a verification method for each.
   Stop when the first selected slice depends on a blocked or unknown surface.
4. Group routes or components into vertical slices, so that each slice delivers one observable flow through the target framework.
   Order the slices by dependency and operational risk, not by file type.
   Advance only when every slice has an owner role, a contract, its changed paths, checkpoint commands, a traffic gate, and a rollback unit.
5. Select the smallest low-risk pilot, then define exact success thresholds, an observation duration, traffic increments, stop conditions, and the last-known-good target.
   Validate the routing and monitoring controls in an isolated or staging environment.
   Stop when a signal cannot tell the current path from the target path.

### Phase 3 - Implement and validate one slice

6. Implement the target path behind the coexistence seam, and leave the current path deployable throughout.
   Change only the selected vertical flow, its framework adapter, its focused tests, and the routing configuration.
   Stop on any unrelated behavior change, or on a new irreversible data dependency.
7. Run static checks, unit tests, public contract tests, side-effect checks, and comparable performance measurements for both paths.
   Produce a per-slice implementation and validation record.
   Advance only when the target path satisfies every contract and threshold; otherwise execute the rollback and correct the slice.
8. Exercise application and traffic rollback outside production, then restore the target slice and rerun its focused checks.
   Retain artifact identities and command results, plus timestamps only when the environment provides them.
   Stop if either the restoration or the reapplication fails.

### Phase 4 - Observe controlled traffic

9. Obtain the approval required for the next traffic environment, submitting contract, measurement, routing, monitoring, and rollback evidence.
   Change only the approved traffic percentage for the selected slice.
   Do not infer production approval from a staging approval.
10. Observe the complete approved window using the declared method, and compare target signals with the current-path baseline.
    Record the sample size, errors, latency or resource results, and abort decisions.
    Advance only when every threshold passes, and route back immediately when an abort condition occurs.
11. Repeat design through observation for later slices only after the current slice closes its checkpoint.
    Keep blocked integrations and unassessed consumers visible in the ordered migration map.

### Phase 5 - Retire the old path

12. After all slices and observation windows pass, reconcile consumer migration, contracts, dependencies, rollback obligations, and deprecation communication.
    Request repository maintainer approval for the specific old-path removal.
    Stop if any consumer, approval, observation, or recovery dependency is incomplete.
13. Remove the old path in a separately revertible change, and run the full application and operational matrix.
    Deliver the compatibility register, slice records, traffic history, approval evidence, rollback dossier, limitations, and follow-up ownership.

## Decision points

- If a target framework or a required integration lacks attributable support for the retained runtime, keep the affected flow on the old path and record the blocker or the approved alternative.
- If a slice cannot coexist or roll back on its own, split it at a lower-risk user-flow boundary before implementation.
- If a target contract result differs from the current path, route no traffic to the target and correct the difference, unless a separately approved product change owns it.
- If any measured checkpoint exceeds its error, latency, saturation, or resource threshold, restore the approved last-known-good traffic state and require service-owner approval for any exception.
- If staging passes but production approval is absent, keep the staging evidence and stop before any production traffic.
- If any consumer or old-path dependency remains, defer old-path removal even when every implemented slice has passing tests.

## Safety guardrails

- Never perform a big-bang framework replacement without independently recoverable vertical slices.
- Never claim framework or integration compatibility without attributable support and contract evidence.
- Never delete the old path, a rollback control, a baseline artifact, or comparable telemetry before the observation gate closes.
- Do not change production traffic without an approved percentage, a monitoring owner, an abort threshold, and a verified restoration command.
- Keep product features, schema migrations, broad architecture redesign, and unrelated dependency upgrades outside the framework slice.
- Do not expose production payloads, credentials, private endpoints, or sensitive telemetry in the dossier.
- Stop when routing cannot isolate the slice, or when an irreversible side effect would diverge between the current and target paths.

## Human approval gates

- Before switching any production traffic, the release manager reviews the exact target artifact, the contract and performance results, the staging observation, the traffic percentage, the observation window, the monitoring owner, the abort thresholds, and the rollback drill.
- Before removing the old framework path, the repository maintainer reviews the complete consumer inventory, the closed slice checkpoints, the production observation, the deprecation obligations, the full validation matrix, and the recovery plan.
- Before accepting a checkpoint threshold exception, the service owner reviews the comparable measurements, the user impact, the duration, the containment, the rollback, and a follow-up owner with an exit condition.
- Before merging each slice, the repository maintainer reviews its changed-file boundary, compatibility disposition, contract result, and rollback evidence.

## Expected output

Produce one versioned migration dossier that stays complete at each of the `planned`, `implemented`, `observed`, `blocked`, or `retired` states.
It must contain:

- the immutable source and artifact identities, exact versions, runtime, scope, and exclusions;
- a compatibility-gap register for every framework-coupled surface;
- an ordered vertical-slice migration map with owners, dependencies, and state;
- a per-slice implementation contract and incremental validation record;
- baseline and target measurement comparisons, with the methods stated;
- coexistence and traffic checkpoints, approvals, observation results, and abort decisions;
- application and traffic rollback evidence;
- the old-path removal criteria and their current approval state;
- assumptions, limitations, residual risks, follow-up owners, and exit conditions; and
- evidence traceability for every material compatibility or result claim.

A completed checkpoint is not a completed migration, and the dossier must keep that distinction explicit.
It must never present staging observation as production evidence, or a planned command as an executed one.

## Completion criteria

- Every framework-coupled surface has a source-backed compatibility disposition and a local verification method.
- Every implemented slice preserves its public contract and passes its static, test, side-effect, and declared operational thresholds.
- Every traffic change has retained approval, artifact identity, observation results, and a tested route back to the prior state.
- Blocked and unimplemented slices stay explicitly visible, each with an owner role and an exit condition.
- The old framework path stays available until every consumer, production observation window, approval, and removal check is complete.
- Any threshold exception carries service-owner approval, a bounded duration, and corrective follow-up.
- The dossier's state, claims, and limitations match the retained evidence exactly.

## Failure modes

- **F1:** Support for the target framework or for an integration is unknown, conflicting, or outside the retained runtime policy.
- **F2:** The selected slice lacks enough characterization to compare current and target behavior.
- **F3:** A contract, side-effect, latency, error-rate, saturation, or resource check exceeds its checkpoint threshold.
- **F4:** Traffic rollback or application restoration cannot reproduce the last-known-good state.
- **F5:** The retirement review uncovers an old-path consumer or an irreversible dependency.

## Recovery procedure

- **R1:** Keep the affected flow on the old framework, keep the support gap on record, and resume only after an attributable supported path or an approved replacement becomes available.
- **R2:** Stop implementation, add boundary-level characterization on the old path, record a new baseline, and redesign the slice before retrying.
- **R3:** Route traffic to the last-known-good path, preserve the failing results, correct or divide the slice, and rerun the full checkpoint before requesting traffic again.
- **R4:** Freeze further traffic changes, restore service with the reviewed recovery runbook, validate the old-path contract, and redesign the rollback control before continuing.
- **R5:** Cancel the old-path removal, add the consumer or dependency to the migration map, assign an owner and an exit condition, and reopen the required observation and approval gates.

## Example

The [synthetic input](#complete-example-input) supplies an Express-to-Fastify service inventory, a completed health pilot, a staging observation, a rollback drill, approval states, and blocked later integrations.
The [complete expected output](#complete-expected-output) shows a finished pilot checkpoint dossier that claims neither production traffic nor completion of the whole migration.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/migrate-framework/1.0.0",
  "title": "Framework migration output contract",
  "description": "Validates the compatibility register, ordered slices, implementation contract, validation and traffic records, rollback dossier, gates, residual risk, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "framework-migration-dossier.md",
        "audience": "Repository maintainers, service owners, and release managers",
        "requires_title": true,
        "required_headings": [
          "Dossier state and boundary",
          "Compatibility-gap register",
          "Ordered vertical-slice map",
          "Incremental validation record",
          "Staging traffic and observation",
          "Rollback dossier",
          "Approval and retirement gates",
          "Residual risks, ownership, and closing criteria",
          "Traceability summary"
        ],
        "required_literals": [
          "| Surface | Local use | Disposition | Required evidence before migration | Owner role | Evidence |",
          "| Order | Slice | Observable flow | State | Dependency or exit condition | Evidence |",
          "implementation contract",
          "| Check | Required result | Observed result | Disposition | Evidence |",
          "| Risk or limitation | Current consequence | Owner role | Closing criterion | Evidence |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This scenario is synthetic and self-contained.
Vendor, repository, deployment, and measurement records below are supplied only for the example.

## Scenario

The `orders-api` service at immutable commit `6f12a9d000000000000000000000000000000000` runs Express 4.18.3 on Node.js 20.18.1.
The target is Fastify 5.2.1 on the same runtime.

The migration must preserve the supplied HTTP contract and keep Express available until all route groups complete production observation.
Product features, data-schema changes, authentication redesign, and public contract changes are excluded.

The first authorized slice is `GET /health` through staging observation only.
No production traffic or Express removal is approved.

## Evidence inventory

### E1 - Immutable version and artifact record

- Source commit: `6f12a9d000000000000000000000000000000000`.
- Current deployment artifact: `orders-api-express:6f12a9d000000000000000000000000000000000`.
- Current framework: Express 4.18.3.
- Target framework: Fastify 5.2.1.
- Runtime: Node.js 20.18.1 on Linux x64.
- Package manager: pnpm 9.15.4 with a committed lockfile.
- Starting working tree: clean.

The retained synthetic vendor record is `fastify-5.2.1-runtime-support.json` with source identity `synthetic-vendor://fastify/5.2.1/runtime-support`.
Its SHA-256 is `0f4a7e0d6a2787a4eec32a269fba7f35c98bf5a1e4a269d17f0b50d6ec724811`.
The record identifies Fastify 5.2.1, states support for Node.js 20 or later, and is the complete official-support fixture supplied for this example.
The artifact manifest ties that record to the target package identity used in E1.

### E2 - Public HTTP contract

The supplied OpenAPI contract defines ten routes.

For the pilot, `GET /health` must return status `200`, header `content-type: application/json; charset=utf-8`, and body `{"status":"ok"}`.
It has no authentication, storage access, mutation, or external call.

All remaining route schemas, error bodies, authentication requirements, and side effects are included in the supplied OpenAPI and behavior fixtures, but they are not authorized for implementation in this pilot.

### E3 - Route groups and framework-coupled surfaces

| Slice | Routes | Coupled surfaces | Current compatibility disposition |
| --- | --- | --- | --- |
| S0 | `/health` | response serialization only | target support confirmed by supplied Fastify record |
| S1 | three `/catalog` reads | request ID and catalog store | internal request-ID adapter has dual-framework contract tests; store is framework neutral |
| S2 | three `/orders` routes | request ID, authentication, validation, order store | authentication adapter design exists but has no Fastify contract result |
| S3 | two `/admin` routes | authentication and role authorization | blocked by the same untested authentication adapter |
| S4 | `/webhooks/provider` | raw body and signature verification | target raw-body integration support is not yet confirmed |

The global Express error middleware also lacks a target error-mapping characterization for non-pilot routes.

### E4 - Express baseline

At `orders-api-express:6f12a9d000000000000000000000000000000000` in the staging fixture:

The baseline observation used the same staging load balancer, Linux x64 node class, Node.js 20.18.1 runtime, `/health` request generator, non-2xx error definition, load-balancer duration metric, request distribution, and telemetry query later used for both Fastify stages in E8.
The generator issued 200 requests per second for 60 minutes, with no warm-up exclusion and no concurrent non-health workload.

- `pnpm lint` exited `0`.
- `pnpm typecheck` exited `0`.
- `pnpm test` exited `0` with 124 tests passing.
- `pnpm test:contract` exited `0` with 42 HTTP contract cases passing, including four `/health` cases.
- A 60-minute `/health` sample contained 720,000 requests, calculated as 200 requests per second multiplied by 3,600 seconds, with 0.10 percent errors and 12.0 ms p95 latency.

The telemetry method counts non-2xx responses as errors and measures load-balancer request duration.

### E5 - Coexistence and traffic controls

The staging load balancer routes `/health` independently by deployment weight.
All other routes remain pinned to `orders-api-express:6f12a9d000000000000000000000000000000000`.

The approved staging sequence is 10 percent Fastify for 30 minutes, then 50 percent for 30 minutes.
Traffic rollback sets Fastify weight to zero and Express weight to 100 percent.
The last-known-good target is `orders-api-express:6f12a9d000000000000000000000000000000000`.

The monitoring owner role is service operator.
The release manager owns any future production traffic approval.

### E6 - Pilot checkpoint thresholds

For `/health`:

- all four contract cases must pass against both frameworks;
- Fastify error rate must not exceed the 0.10 percent baseline by more than 0.20 percentage points;
- Fastify p95 latency must not exceed the 12.0 ms baseline by more than 20 percent;
- no request may reach authentication, storage, or an external service; and
- any contract failure or threshold breach immediately returns staging traffic to 100 percent Express.

The derived maximum error rate is 0.30 percent.
The derived maximum p95 latency is 14.4 ms.

### E7 - Implemented S0 artifact

Checkpoint `fw-s0-17` adds a Fastify bootstrap and implements only `GET /health` behind the staging routing key.
The changed paths are `src/fastify/app.ts`, `src/fastify/routes/health.ts`, `test/contract/health.dual-framework.test.ts`, and `deploy/staging-health-weights.yml`.

The target artifact is `orders-api-fastify:fw-s0-17` and identifies source checkpoint `fw-s0-17`.
Express code and deployment remain unchanged and available.

### E8 - Static, contract, and staging observation results

At checkpoint `fw-s0-17`:

- lint, typecheck, and all 124 unit tests exited `0`;
- all four `/health` contract cases passed against both Express and Fastify;
- the side-effect spy recorded zero authentication, storage, and external-service calls for both paths; and
- the target artifact identity matched `fw-s0-17`.

During the approved 10 percent stage, Fastify served 36,000 requests over 30 minutes, calculated as 200 requests per second multiplied by 1,800 seconds and 10 percent, with 0.12 percent errors and 12.7 ms p95.
During the approved 50 percent stage, Fastify served 180,000 requests over 30 minutes, calculated as 200 requests per second multiplied by 1,800 seconds and 50 percent, with 0.14 percent errors and 13.1 ms p95.
Both target observations used the exact E4 node class, runtime, request generator, 200-request-per-second total load, request distribution, error definition, duration metric, telemetry query, and absence of concurrent non-health workload.
Only the routing weight and target artifact differed from the Express baseline.
No abort condition occurred.

### E9 - Application and traffic rollback drill

Before staging observation, a disposable environment switched `/health` from Fastify to 100 percent Express.
The Express health contract passed and artifact identity returned `orders-api-express:6f12a9d000000000000000000000000000000000`.

The environment then restored the Fastify pilot, and all four dual-framework health contract cases passed again.
During staging observation, the service operator also verified the routing command in dry-run mode without changing the approved percentages.

### E10 - Approval state

The repository maintainer approved the S0 changed-file boundary and checkpoint evidence for staging.
The service operator approved and observed the two staging traffic steps.

The release manager has not approved production traffic.
The repository maintainer has not approved Express removal.
No service-owner threshold exception was requested because E8 is within E6.

### E11 - Remaining migration ownership

- S0 owner role: repository maintainer; current exit condition: retain the passing staging dossier while production approval remains pending.
- S1 owner role: repository maintainer; exit condition: implement the three catalog routes with dual-framework contract and store-call evidence.
- S2 and S3 owner role: security owner; exit condition: approve and pass Fastify authentication and authorization contract tests.
- S4 owner role: integration owner; exit condition: retain official raw-body support evidence and pass signature fixtures.
- Global error mapping owner role: repository maintainer; exit condition: pass old-to-target error-body characterization for every non-pilot route group.

No date or completion estimate is supplied for later slices.

## Complete expected output

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
