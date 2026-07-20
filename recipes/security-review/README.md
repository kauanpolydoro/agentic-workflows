# Perform a defensive security review

Produce an authorization-bounded defensive assessment whose findings identify exact controls, protected assets, attacker prerequisites, safe verification, and residual uncertainty.

## Primary use cases

- An authorized local application needs a defensive control review.
- A release needs risk-ranked findings for authentication, authorization, input handling, or secrets.
- A security owner needs a review of source, route wiring, configuration, and tests at one immutable revision.

## When not to use

- Written authorization or system boundaries are absent.
- Validation would require traffic to a real system or access to production secrets.
- The request asks for persistence, evasion, credential theft, or exploitation.
- A conclusion depends on deployed behavior that cannot be reconciled with the supplied revision and configuration.

## Required evidence

- **Authorization and revision:** Approving security-owner role, allowed techniques and paths, exclusions, review period, immutable revision, active-test scope, disclosure boundary, stop conditions, cleanup, and rollback.
- **Threat context:** Protected assets, data classifications, actors, attacker capabilities, entry points, trust boundaries, and control requirements.
- **Complete control evidence:** Security-relevant source, middleware order, route and deployment wiring, configuration, and positive and negative tests.
- **Validation records:** When available, isolated target, approved command, revision, result, cleanup, and stop-condition evidence.

## Produced artifacts

- An authorized defensive assessment with scope, assets, boundaries, assumptions, and threat summary.
- A finding register with evidence, impact, severity, confidence, recommendation, verification, and disposition.
- A remediation, verification, and residual-risk plan with owners, gates, rollback, and objective exit evidence.

## Primary risks

- Never target non-local systems or use production credentials.
- Never retain offensive payloads, raw secrets, or personal data in the report.
- Keep tests inside the authorized fixture and stop on unexpected network access.
- Obtain explicit security-owner approval before any active testing, including local fixture execution.
- Do not claim exploitability from pattern matching alone.
- Stop any approved local validation that reaches an unexpected destination or modifies unapproved state.

## How to use this recipe

1. Verify authorization, immutable revision, techniques, exclusions, and disclosure boundary before inspecting sensitive material.
2. Build the protected-asset, trust-boundary, control, route, configuration, and test inventory.
3. Follow [workflow.md](workflow.md) to separate observations, reachability inferences, severity, confidence, and safe validation.
4. Use [checklist.md](checklist.md) to control sensitive evidence, active-test gates, remediation quality, and disclosure.
5. Compare report structure with the synthetic [example input](examples/input.md) and [expected output](examples/expected-output.md), without reusing its conclusions.
6. Obtain security-owner approval before any active validation, including local fixture execution, or disclosure, and release-manager approval for any temporary risk acceptance that affects deployment.

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
Static evidence can establish a missing control in the supplied code, but it may leave runtime reachability or deployed compensating controls unverified.

See the repository [recipe quality standard](../../docs/quality/recipe-quality-standard.md) and [adapter sources](../../docs/research/adapter-sources.md).
