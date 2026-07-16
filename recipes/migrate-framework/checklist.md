# Framework migration checkpoint checklist

## Version and contract baseline

- [ ] Immutable source and deployed artifact revisions reconcile with the current framework baseline.
- [ ] Current framework, target framework, runtime, plugins, middleware, and lockfile versions are exact.
- [ ] Every in-scope route or component has status, output, error, header, side-effect, and caller contracts as applicable.
- [ ] Baseline commands and telemetry identify method, environment, sample size, and result.
- [ ] Product changes, schema migrations, redesign work, and unrelated upgrades are excluded from each slice.

## Compatibility and slice design

- [ ] Every framework-coupled surface has an official source and one local disposition.
- [ ] Unknown, unsupported, or replacement-required integrations remain visible blockers.
- [ ] Each slice crosses the target framework as one observable user flow rather than one technical layer.
- [ ] Each slice names changed paths, owner role, prerequisites, contract checks, traffic gate, and rollback unit.
- [ ] No slice depends on an unimplemented later slice to compile, route, or recover.

## Implementation and validation

- [ ] The old and target paths can run side by side for the selected routing key.
- [ ] Static, unit, contract, error, and side-effect checks pass on both paths.
- [ ] Target measurements use the same method and load shape as the current-path baseline.
- [ ] Every threshold calculation has been recomputed from the supplied baseline.
- [ ] Any difference is classified as regression, approved product change, measurement limitation, or blocker.
- [ ] Application rollback and target reapplication both pass outside production.

## Traffic and observation safety

- [ ] The traffic percentage, artifact identity, window, monitoring owner, and abort conditions are explicit before routing changes.
- [ ] Staging approval is not presented as production approval.
- [ ] Observation covers the full approved window and records sample size and comparable signals.
- [ ] Abort thresholds route to a named last-known-good state without waiting for discretionary review.
- [ ] Production payloads, credentials, private endpoints, and sensitive telemetry are absent from the dossier.

## Approvals and retirement

- [ ] The release manager approved the exact evidence package before any production traffic switch.
- [ ] Every threshold exception has service-owner impact, duration, containment, rollback, and follow-up evidence.
- [ ] The repository maintainer approved each slice boundary and validation result before merge.
- [ ] Old-path removal remains blocked until all consumers, production windows, deprecations, and recovery obligations close.
- [ ] Blocked slices and residual risks have owner roles and measurable exit conditions.
- [ ] The dossier distinguishes pilot completion from whole-migration completion and satisfies every criterion in `workflow.md`.
