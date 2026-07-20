# Migrate a framework through controlled vertical slices

Use this recipe to move a maintained application from one exact framework version to another without treating a passing build as proof of migration safety.
It organizes work around observable user flows, coexistence, comparable contracts, measured traffic gates, and a tested return to the old path.

## Primary use cases

- Migrate server routes, UI flows, jobs, or other framework-owned behavior through low-risk vertical slices.
- Evaluate framework plugins and middleware against exact runtime and target versions before changing traffic.
- Retain a reviewable pilot, canary, rollback, and old-path retirement history across a long migration.

## When not to use

- The request is a big-bang rewrite, the target is unsupported, the flow lacks characterization, or deployment cannot route back safely.
- Consumer inventory, production observation, deprecation obligations, or approval is incomplete and the request requires removing the old framework path.

## Required evidence

Provide immutable source and deployed artifact identities plus exact current framework, target framework, runtime, plugin, middleware, and lockfile versions.

Provide route or component contracts, callers, side effects, baseline commands, current telemetry, and a supported-environment matrix.

Provide complete official migration guidance and an evidence-backed local disposition for every framework-coupled surface.

Provide coexistence topology, routing key, traffic increments, thresholds, observation windows, monitoring and abort ownership, approval state, last-known-good identity, and exercised recovery commands.

## Produced artifacts

The recipe produces a compatibility-gap register and an ordered vertical-slice migration map.

For each implemented slice, it produces an implementation contract, static and behavioral validation, comparable measurements, traffic observation, approval state, rollback evidence, residual risks, and traceability.

The dossier can truthfully end in a planned, implemented, observed, blocked, or retired state without confusing one completed pilot with completion of the entire migration.

## Primary risks

The main risks are unsupported integrations, contract drift hidden by framework defaults, inconsistent current and target side effects, traffic without useful abort signals, irreversible state divergence, and removal of the only reliable recovery path.

The workflow requires the old path to remain available until the applicable observation and approval gates close.

## How to use this recipe

1. Freeze versions, artifacts, contracts, metrics, topology, and exclusions at the current path.
2. Follow [workflow.md](workflow.md) to build the compatibility register and choose the smallest low-coupling user flow.
3. Implement one coexistence slice and validate current and target paths with comparable methods.
4. Exercise application and traffic rollback outside production before requesting any production gate.
5. Use [checklist.md](checklist.md) for every slice and traffic change.
6. Compare the result with the [synthetic migration evidence](examples/input.md) and [complete pilot dossier](examples/expected-output.md).

The `8h` metadata duration approximates one characterized pilot slice.
A full application migration normally requires multiple separately estimated executions of this procedure.

## Files

- [recipe.yml](recipe.yml) defines catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- [workflow.md](workflow.md) is the canonical compatibility, slice, validation, traffic, recovery, and retirement procedure.
- [checklist.md](checklist.md) controls evidence gaps at version, contract, integration, traffic, and approval boundaries.
- [output.schema.json](output.schema.json) defines the machine-readable contract for the delivered artifact set.
- [examples/input.md](examples/input.md) contains a self-contained synthetic service migration evidence set.
- [examples/expected-output.md](examples/expected-output.md) demonstrates a complete first-slice checkpoint dossier with honest remaining blockers.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

This procedure cannot make an integration supported when the framework or integration owner provides no attributable contract.

It cannot guarantee production behavior from staging evidence, and it cannot safely dual-run an irreversible side effect without a domain-specific reconciliation design.

Threshold selection and final old-path removal still require accountable human judgment supported by representative evidence.

See the [recipe quality standard](../../docs/quality/recipe-quality-standard.md), [security guidance](../../docs/guide/security.md), and [verification model](../../docs/guide/verification.md).
