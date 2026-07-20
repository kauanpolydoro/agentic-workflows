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

The [synthetic input](examples/input.md) supplies an Express-to-Fastify service inventory, a completed health pilot, a staging observation, a rollback drill, approval states, and blocked later integrations.
The [complete expected output](examples/expected-output.md) shows a finished pilot checkpoint dossier that claims neither production traffic nor completion of the whole migration.
