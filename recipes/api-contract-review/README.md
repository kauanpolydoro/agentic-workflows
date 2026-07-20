# Review an API contract change

Turn released and proposed wire contracts, implementation behavior, supplied runtime observations, client parser contracts, and versioning policy into a bidirectional compatibility and rollout decision.

## Primary use cases

- An HTTP, event, or library contract will change before release.
- Producer and consumer teams need a compatibility and deprecation decision.
- A deprecated field or version is approaching removal and needs usage, owner, and rollback evidence.

## When not to use

- The previous contract or proposed contract is unavailable.
- Runtime behavior cannot be reconciled with generated schemas.
- The change is an internal refactor with no observable contract effect.
- The request is to ship or remove behavior before required client evidence and approval exist.

## Required evidence

- **Contract boundary:** Immutable released and candidate artifacts, protocol revisions, version selectors, and complete reviewed surface.
- **Implementation and runtime evidence:** Handler, validator, serializer, default, error-mapping, and routing source for every changed element, plus retained response observations for any runtime claim.
- **Decision policy:** Producer and consumer compatibility rules, severity, deprecation window, removal conditions, and release disposition.
- **Client and rollout evidence:** When available, parser contracts, executed parser-test results, owner roles, explicit version-path adoption, per-change privacy-safe usage, supported routing, baselines, abort thresholds, and rollback.

## Produced artifacts

- A bidirectional compatibility matrix and finding register for every wire-level difference.
- An observed and unknown client-impact register with parser assumptions and owner roles.
- A supported versioning, deprecation, rollout, monitoring, approval, and rollback plan.

## Primary risks

- Do not assume generated schemas represent runtime defaults or error behavior.
- Do not include personal data or internal stack details in contract examples.
- Do not silently change defaults, error shapes, or nullability.
- Stop removal when the deprecation window or client evidence is incomplete.
- Do not retain response bodies or personal data to infer compatibility.
- Do not describe a contract incompatibility as an observed client failure without a retained execution result.
- Do not describe version routing as a client cohort or omit monitoring for one of the changed behaviors.

## How to use this recipe

1. Freeze the released and candidate contracts, implementation revision, protocol, policies, and reviewed surface.
2. Follow [workflow.md](workflow.md) to enumerate wire differences, reconcile runtime behavior, and classify both producer and consumer directions.
3. Use [checklist.md](checklist.md) to control unknown clients, runtime-only behavior, test provenance, client path adoption, per-change monitoring, routing capability, and removal gates.
4. Compare artifact structure with the synthetic [example input](examples/input.md) and [expected output](examples/expected-output.md), without copying its client or routing conclusions.
5. Obtain API-owner and affected-client approval before a breaking shipment, and API-owner approval before deprecated behavior removal.

## Files

- `recipe.yml` contains catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- `workflow.md` is the canonical operational procedure.
- `checklist.md` controls evidence, safety, approval, and delivery omissions.
- `output.schema.json` defines the machine-readable contract for the delivered artifact set.
- `examples/input.md` is a synthetic evidence package.
- `examples/expected-output.md` is a complete reference artifact.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

The example proves editorial derivability for a synthetic scenario, not execution through an external agent.
Domain evidence and approvals must be recollected for every real use.
Generated contract compatibility does not establish parser compatibility or deployed runtime behavior without corresponding evidence.

See the repository [recipe quality standard](../../docs/quality/recipe-quality-standard.md) and [adapter sources](../../docs/research/adapter-sources.md).
