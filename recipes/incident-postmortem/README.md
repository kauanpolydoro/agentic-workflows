# Produce an evidence-linked blameless incident postmortem

Use this recipe to turn retained incident evidence into a bounded learning record that distinguishes observed facts, causal confidence, system conditions, and proposed corrective actions.

## Primary use cases

- Document a material service or operational incident after containment or stability is confirmed.
- Reconstruct impact and a UTC timeline from retained measurements, alerts, changes, response records, and recovery signals.
- Create verifiable corrective actions linked to evidenced risks and system controls.

## When not to use

- Active mitigation is still in progress or postmortem work would distract responders.
- The incident commander cannot confirm a review boundary or stability condition.
- Legal, security, or privacy handling prohibits the intended distribution.
- Timestamp and impact gaps cannot be represented honestly even as uncertainty.
- The request is an individual performance review or immediate security disclosure.

## Required evidence

Provide the incident ID, affected service, severity basis, UTC boundary, evidence cutoff, audience, timestamped source ledger, impact numerator and denominator, calculation method, mitigation records, recovery signals, and approval state.
Each source must record provenance, timezone, retention status, conflict status, and redaction status.

## Produced artifacts

- An evidence-linked blameless postmortem with a factual executive summary, reproducible impact calculation, and UTC timeline.
- A corrective-action register with owner roles, dependencies, exit criteria, verification signals, safe-stop conditions, and approval states.
- An uncertainty and open-question register.
- A traceability and approval record.

## Primary risks

The main risks are inventing causality or precision, assigning individual blame, exposing sensitive data, obscuring conflicting evidence, and presenting proposed actions as approved commitments.

## How to use this recipe

1. Confirm containment or stability and freeze the incident boundary, audience, and evidence cutoff.
2. Inventory and sanitize retained evidence before calculating impact or drafting a timeline.
3. Execute `workflow.md` and use `checklist.md` during analysis, action design, and approval review.
4. Compare the result with the self-contained synthetic example under `examples/`.
5. Run recipe, content, formatting, and relative-link validation before requesting factual, distribution, action-owner, and publication approval.

## Files

| File | Purpose |
|---|---|
| `recipe.yml` | Declares catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states. |
| `workflow.md` | Defines the canonical evidence, impact, timeline, causal analysis, action, approval, and recovery procedure. |
| `checklist.md` | Controls evidence integrity, arithmetic, blameless language, causal confidence, action quality, and publication safety. |
| `output.schema.json` | Defines the machine-readable contract for the delivered artifact set. |
| `examples/input.md` | Supplies a complete synthetic incident boundary and evidence ledger with approval constraints. |
| `examples/expected-output.md` | Demonstrates a derivable postmortem, uncertainty register, and proposed corrective-action plan. |

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

The workflow cannot recover expired evidence, prove a causal claim when records support only correlation, assign an individual owner without role approval, or make an unsafe artifact suitable for unrestricted publication.

See [the project recipe quality standard](../../docs/quality/recipe-quality-standard.md).
