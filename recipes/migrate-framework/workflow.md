# Migrate a framework through controlled vertical slices

## Objective

Transform a versioned application and its current behavior evidence into a compatibility register, an ordered set of independently recoverable migration slices, and a traffic and rollback dossier.
Preserve the public contract at every checkpoint and retain the old path until measured observation and role-based approval establish that removal is safe.

## When to use

- Use this workflow when current and target framework versions are exact and the target can coexist with the current path for a bounded user flow.
- Use it when contracts, supported integrations, traffic controls, and operational thresholds can be verified slice by slice.
- Use it for migrations whose risk requires explicit staging, canary, rollback, and final old-path retirement gates.

## When not to use

- Do not begin a slice when its target runtime or required integration support is unknown, unofficial, or outside the project's support policy.
- Do not use this recipe when public behavior lacks a reproducible baseline or the selected slice cannot be routed back to the current path.
- Do not use it to justify an unrestricted rewrite, an architecture redesign, or unrelated feature development.
- Do not switch traffic when monitoring, abort controls, responsible roles, or observation windows are absent.
- Do not remove the old path while any consumer, migration slice, or rollback dependency remains unresolved.

## Required inputs

- **Immutable application revision with exact current, target framework, runtime, and coupled dependency versions:** provide manifests, lockfiles, runtime policy, deployment artifact identity, and every framework-specific plugin or middleware version.
  This freezes the compatibility question.
  Validate the revision and reconcile the supplied versions with resolved artifacts rather than version ranges alone.
- **Public behavior contract, route or component inventory, and reproducible characterization baseline:** provide request and response schemas, status codes, headers, errors, side effects, user flows, commands, environment, results, and current operational measurements for every slice candidate.
  These records define behavior that the migration must preserve.
  Reject a slice whose contract or baseline cannot be exercised independently.
- **Official migration guidance with a local compatibility disposition for every framework-coupled surface:** retain attributable target-framework and integration records, then map each route, middleware, plugin, lifecycle hook, template, or state facility to supported, adapter-required, replacement-required, blocked, or unknown.
  Stop when a required surface is unknown or unsupported without an approved alternative.
- **Coexistence, traffic, checkpoint, observation, approval, and rollback controls:** provide routing mechanism, deployment topology, traffic increments, health signals, thresholds, observation durations, abort conditions, owner roles, last-known-good identity, and tested restoration procedure.
  Validate these controls in a non-production environment before requesting production traffic.

## Optional inputs

- Comparable latency, error-rate, saturation, and resource measurements create quantitative checkpoint gates.
  Without a metric, report that dimension as unassessed and do not claim improvement.
- A consumer inventory and deprecation policy can determine when the old path or compatibility facade may be retired.
- A privacy-reviewed production trace can improve characterization for rare flows without authorizing disclosure of user data.

## Preconditions

- The immutable revision resolves, and deployed baseline artifacts identify that revision.
- Target framework and every integration required by the selected slice have attributable support for the retained runtime.
- Current-path contract checks pass, or every existing failure has an owner and disposition.
- The selected slice has a stable routing key and can coexist with the current implementation.
- Traffic can return to the current path without a data migration or irreversible side effect.
- Monitoring and abort signals use comparable methods and have been exercised outside production.
- Required approver roles and the authority of each traffic gate are recorded.

## Workflow

### Phase 1 - Establish the migration boundary

1. Record the immutable application revision, current and target framework versions, runtime, deployment artifacts, route or component inventory, and excluded redesign work.
   Produce a scope ledger that separates framework migration from product changes.
   Advance only when the working tree and deployed baseline reconcile with the recorded revision; stop on unexplained drift.
2. Capture public contracts, side effects, dependencies, and baseline command and telemetry results for each candidate user flow.
   Produce a characterization matrix tied to the current framework.
   Advance only when at least one low-coupling flow has objective contract and rollback checks.

### Phase 2 - Resolve compatibility and order slices

3. Map complete official migration guidance and each framework-coupled package to actual local usage.
   Classify every surface as supported, adapter-required, replacement-required, blocked, or unknown, with a source and verification method.
   Stop when the first selected slice depends on a blocked or unknown surface.
4. Group routes or components into vertical slices that each deliver one observable flow through the target framework.
   Order them by dependency and operational risk rather than file type.
   Advance only when every slice has an owner role, contract, changed paths, checkpoint commands, traffic gate, and rollback unit.
5. Select the smallest low-risk pilot and define exact success thresholds, observation duration, traffic increments, stop conditions, and last-known-good target.
   Validate routing and monitoring controls in an isolated or staging environment.
   Stop when a signal cannot distinguish current and target paths.

### Phase 3 - Implement and validate one slice

6. Implement the target path behind the coexistence seam while leaving the current path deployable.
   Change only the selected vertical flow, its framework adapter, focused tests, and routing configuration.
   Stop on unrelated behavior changes or a new irreversible data dependency.
7. Run static checks, unit tests, public contract tests, side-effect checks, and comparable performance measurements for both paths.
   Produce a per-slice implementation and validation record.
   Advance only when the target path satisfies every contract and threshold; otherwise execute rollback and correct the slice.
8. Exercise application and traffic rollback outside production, then restore the target slice and rerun its focused checks.
   Retain timestamps only when provided by the environment, plus artifact identities and command results.
   Stop if either restoration or reapplication fails.

### Phase 4 - Observe controlled traffic

9. Obtain the approval required for the next traffic environment and submit contract, measurement, routing, monitoring, and rollback evidence.
   Change only the approved traffic percentage for the selected slice.
   Do not infer production approval from a staging approval.
10. Observe the complete approved window using the declared method and compare target signals with the current-path baseline.
    Record sample size, errors, latency or resource results, and abort decisions.
    Advance only when every threshold passes; route back immediately when an abort condition occurs.
11. Repeat design through observation for later slices only after the current slice closes its checkpoint.
    Keep blocked integrations and unassessed consumers visible in the ordered migration map.

### Phase 5 - Retire the old path

12. After all slices and observation windows pass, reconcile consumer migration, contracts, dependencies, rollback obligations, and deprecation communication.
    Request repository maintainer approval for the specific old-path removal.
    Stop if any consumer, approval, observation, or recovery dependency is incomplete.
13. Remove the old path in a separately revertible change and run the full application and operational matrix.
    Deliver the compatibility register, slice records, traffic history, approval evidence, rollback dossier, limitations, and follow-up ownership.

## Decision points

- If a target framework or required integration lacks attributable support for the retained runtime, keep the affected flow on the old path and record the blocker or approved alternative.
- If a slice cannot coexist or roll back independently, divide it at a lower-risk user-flow boundary before implementation.
- If a target contract result differs from the current path, route no traffic to the target and correct the difference unless a separately approved product change owns it.
- If any measured checkpoint exceeds its error, latency, saturation, or resource threshold, restore the approved last-known-good traffic state and require service-owner approval for any exception.
- If staging passes but production approval is absent, retain staging evidence and stop before production traffic.
- If any consumer or old-path dependency remains, defer old-path removal even when all implemented slices have passing tests.

## Safety guardrails

- Never perform a big-bang framework replacement without independently recoverable vertical slices.
- Never claim framework or integration compatibility without attributable support and contract evidence.
- Never delete the old path, rollback control, baseline artifact, or comparable telemetry before the observation gate closes.
- Do not change production traffic without an approved percentage, monitoring owner, abort threshold, and verified restoration command.
- Keep product features, schema migrations, broad architecture redesign, and unrelated dependency upgrades outside the framework slice.
- Do not expose production payloads, credentials, private endpoints, or sensitive telemetry in the dossier.
- Stop when routing cannot isolate the slice or when an irreversible side effect would diverge between current and target paths.

## Human approval gates

- Before switching any production traffic, the release manager reviews the exact target artifact, contract and performance results, staging observation, traffic percentage, observation window, monitoring owner, abort thresholds, and rollback drill.
- Before removing the old framework path, the repository maintainer reviews the complete consumer inventory, closed slice checkpoints, production observation, deprecation obligations, full validation matrix, and recovery plan.
- Before accepting a checkpoint threshold exception, the service owner reviews comparable measurements, user impact, duration, containment, rollback, and a follow-up owner with an exit condition.
- Before merging each slice, the repository maintainer reviews its changed-file boundary, compatibility disposition, contract result, and rollback evidence.

## Expected output

Produce one versioned migration dossier that remains complete at `planned`, `implemented`, `observed`, `blocked`, or `retired` states.
It must contain:

- immutable source and artifact identities, exact versions, runtime, scope, and exclusions;
- a compatibility-gap register for every framework-coupled surface;
- an ordered vertical-slice migration map with owners, dependencies, and state;
- a per-slice implementation contract and incremental validation record;
- baseline and target measurement comparisons with stated methods;
- coexistence and traffic checkpoints, approvals, observation results, and abort decisions;
- application and traffic rollback evidence;
- old-path removal criteria and current approval state;
- assumptions, limitations, residual risks, follow-up owners, and exit conditions; and
- evidence traceability for every material compatibility or result claim.

The dossier must distinguish a completed checkpoint from completion of the entire migration.
It must never present staging observation as production evidence or a planned command as executed.

## Completion criteria

- Every framework-coupled surface has a source-backed compatibility disposition and local verification method.
- Every implemented slice preserves its public contract and passes its static, test, side-effect, and declared operational thresholds.
- Every traffic change has retained approval, artifact identity, observation results, and a tested route back to the prior state.
- Blocked and unimplemented slices remain explicitly visible with owner roles and exit conditions.
- The old framework path remains available until every consumer, production observation window, approval, and removal check is complete.
- Any threshold exception has service-owner approval, bounded duration, and corrective follow-up.
- The dossier's state, claims, and limitations exactly match the retained evidence.

## Failure modes

- **F1:** Target framework or integration support is unknown, conflicting, or outside the retained runtime policy.
- **F2:** The selected slice lacks enough characterization to compare current and target behavior.
- **F3:** Contract, side-effect, latency, error-rate, saturation, or resource checks exceed a checkpoint threshold.
- **F4:** Traffic rollback or application restoration cannot reproduce the last-known-good state.
- **F5:** An old-path consumer or irreversible dependency is discovered during retirement review.

## Recovery procedure

- **R1:** Keep the affected flow on the old framework, retain the support gap, and resume only after an attributable supported path or approved replacement is available.
- **R2:** Stop implementation, add boundary-level characterization on the old path, record a new baseline, and redesign the slice before retrying.
- **R3:** Route traffic to the last-known-good path, preserve failing results, correct or divide the slice, and rerun the full checkpoint before another traffic request.
- **R4:** Freeze further traffic changes, use the reviewed recovery runbook to restore service, validate the old-path contract, and redesign the rollback control before continuing.
- **R5:** Cancel old-path removal, add the consumer or dependency to the migration map, assign an owner and exit condition, and reopen the required observation and approval gates.

## Example

The [synthetic input](examples/input.md) supplies an Express-to-Fastify service inventory, completed health pilot, staging observation, rollback drill, approval states, and blocked later integrations.
The [complete expected output](examples/expected-output.md) demonstrates a finished pilot checkpoint dossier without claiming production traffic or whole-migration completion.
