# Produce an evidence-backed API reference

Use this recipe to turn a fixed public contract and matching implementation evidence into a versioned reference that makes source, execution status, discrepancies, and limitations visible to API consumers.

## Primary use cases

- Create reference documentation for an approved stable operation.
- Refresh stale request, response, validation, error, or authentication documentation at a known revision.
- Produce synthetic examples whose contract-test coverage and direct execution status are distinguished.

## When not to use

- The API version, immutable revision, operation identifiers, or intended audience are unknown.
- The public contract is proposed, unapproved, or undergoing a breaking design review.
- Contract, implementation, validator, and test evidence come from different revisions.
- Safe examples require production credentials, customer data, or uncontrolled mutations.

## Required evidence

Provide the approved public contract, exact operation identifiers, matching handler and validator paths, retained contract-test results, supported API version, base URL shape, audience, and exclusions.
Every source must resolve at one immutable revision, and each executed check must retain its command, environment, exit status, and relevant output.

## Produced artifacts

- A versioned API reference with synthetic requests and responses.
- An example execution report that separates contract-test evidence from direct example execution.
- A contract discrepancy and evidence traceability register.
- Approval state, assumptions, limitations, and required follow-up.

## Primary risks

The main risks are leaking secrets, publishing implementation details as public contract, inventing fields or status codes, hiding a compatibility mismatch, and claiming an unexecuted example succeeded.

## How to use this recipe

1. Confirm that the contract is approved and that all required sources resolve at the same immutable revision.
2. Freeze the operation, version, base URL shape, audience, and exclusions.
3. Execute `workflow.md` and use `checklist.md` while building the evidence matrix and reference.
4. Compare the artifact with the self-contained synthetic example under `examples/`.
5. Run recipe, content, formatting, and relative-link validation before requesting API owner approval.

## Files

| File | Purpose |
|---|---|
| `recipe.yml` | Declares catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states. |
| `workflow.md` | Defines the canonical contract reconciliation, example verification, approval, and recovery procedure. |
| `checklist.md` | Controls operation coverage, evidence alignment, synthetic values, discrepancies, safety, and delivery omissions. |
| `output.schema.json` | Defines the machine-readable contract for the delivered artifact set. |
| `examples/input.md` | Supplies a synthetic operation, matching implementation and test records, environment, and approval constraints. |
| `examples/expected-output.md` | Demonstrates a complete API reference whose material claims map to the evidence inventory. |

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

The workflow cannot choose between conflicting sources or expand the public contract without API owner approval.
It labels examples unexecuted when safe sandbox access is unavailable and does not infer undocumented rate limits, headers, or errors.

See [the project recipe quality standard](../../docs/quality/recipe-quality-standard.md).
