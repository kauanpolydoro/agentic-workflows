# Synthetic Express-to-Fastify pilot evidence

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
