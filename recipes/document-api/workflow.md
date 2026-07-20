# Produce an evidence-backed API reference

## Objective

Turn an approved public contract, plus the implementation and test evidence that matches it, into a versioned API reference, an example execution report, and a discrepancy register.
The rule everything else depends on: every operation, field, status code, limit, side effect, and execution claim must be traceable to evidence at one immutable revision.

## When to use

Use this workflow to create or refresh reference documentation for stable operations, when the approved public contract, the implementation, the validators, and the contract tests can all be inspected at the same revision.
Use it when consumers need request and response examples that state plainly whether they were executed and which API version they cover.

## When not to use

Do not use this workflow when the API version or operation scope is unknown, when the proposed contract is not approved, when the evidence revisions do not match, or when safe examples would require production credentials or customer data.
If the contract itself is changing, or a breaking compatibility decision is still open, run an API contract review workflow first.

## Required inputs

- **Public contract:** an immutable OpenAPI document or equivalent schema, its revision, and the exact operation identifiers.
  This defines the surface you may publish, so the source must resolve and carry API owner approval.
- **Implementation evidence:** the matching handler and validator paths at that same revision.
  These confirm validation and side effects, so every path and referenced revision must resolve.
- **Contract-test evidence:** the exact command, the isolated environment it ran in, its exit status, and the relevant assertions.
  This is what lets an example be called observed, so the retained output must be tied to the contract revision.
- **Publication scope:** the supported API version, the base URL shape, the intended audience, the included operations, and the exclusions.
  This is what keeps the reference from quietly expanding, so it must agree with the contract source.

## Optional inputs

- **Version-matched client examples:** sanitized examples can improve task guidance, once you have checked every field against the contract.
- **Sanitized error observations:** these can point to a potential documentation gap, but never establish a public error contract from an observation alone.
- **Compatibility policy:** use it to classify contract discrepancies and to decide whether publication must stop.

## Preconditions

- The contract, handler, validator, and tests resolve to the same immutable revision.
- The exact operation identifiers, supported API version, base URL shape, audience, and exclusions are recorded.
- Authentication values can be represented with synthetic data and no live secret.
- Any mutating example has an approved isolated non-production target and a cleanup procedure.

## Workflow

1. **Freeze the publication scope:** record the revision, API version, base URL shape, audience, included operations, and exclusions.
   Advance only when every operation identifier resolves in the approved contract.
   Stop on any mismatch.
2. **Build an operation evidence matrix:** map authentication, parameters, validation, request bodies, success responses, errors, headers, limits, idempotency, and side effects to contract, implementation, and test evidence.
   Advance only when every concern has attributable evidence or an explicit non-applicable status.
   Stop if a material concern remains unmapped.
3. **Reconcile the sources:** compare the contract, handler, validator, and tests field by field.
   Advance only when each discrepancy has an owner and a disposition, or is marked as a publication blocker.
   Until a disposition exists, do not publish an affected claim.
4. **Draft the reference:** use the approved contract for public semantics and the matching implementation evidence for operational notes.
   Advance only when every draft claim maps to the evidence matrix.
   Stop on any unsupported endpoint, field, status, limit, or operational note.
5. **Construct the examples:** use synthetic identifiers, tokens, payloads, and hosts throughout.
   Advance only when every value validates against the documented schema and each example is labeled proposed or observed.
   Stop if safe synthetic data cannot represent the contract.
6. **Verify the examples:** when credentials and cleanup are available, execute the safe examples in an isolated fixture, retaining the command, environment, exit status, and response.
   Advance with either retained execution evidence or an explicit unexecuted label that names the missing prerequisite.
   Stop if an execution claim lacks that evidence.
7. **Review security and compatibility:** check redaction, authentication wording, internal error leakage, pagination, idempotency, rate limits, versioning, and side effects against the evidence matrix.
   Advance only when each check has a disposition.
   Stop on undocumented public expansion or unsafe disclosure.
8. **Obtain approvals:** submit any new or expanded public behavior to the API owner, along with the contract diff, evidence matrix, test results, compatibility impact, and discrepancy register.
   Advance when every applicable approval is recorded or explicitly non-applicable.
   Stop publication while a required approval is pending or denied.
9. **Deliver and reconcile:** hand over the reference, example execution report, discrepancy register, evidence traceability, assumptions, limitations, and approval state.
   Complete only when every completion criterion maps to the artifact.
   Stop the handoff if any criterion remains unsupported.

## Decision points

- If the approved contract and the runtime implementation disagree, document neither side as resolved, record the exact discrepancy, and require API owner disposition before publishing the affected claim.
- If an example would require production credentials, customer data, or an uncontrolled mutation, replace it with a validated synthetic example or omit it.
- If a response field, status code, header, or limit lacks contract evidence, leave it out of the public reference and record the gap.
- If the contract tests do not cover a material documented response, label that response unverified and request a contract test before claiming observed behavior.
- If newly observed behavior would expand the public contract, pause publication until the API owner approves the contract change and its compatibility impact.

## Safety guardrails

- Never copy secrets, credentials, tokens, customer identifiers, or private endpoints into the artifact.
- Never invent response fields, endpoints, parameters, status codes, headers, limits, examples, or execution results.
- Never present internal stack traces as API errors, and never imply that implementation details are a supported contract.
- Use read-only requests or isolated fixtures, unless an approved sandbox and cleanup procedure control mutations.
- Stop if evidence revisions differ, if an operation is unapproved, or if destructive side effects cannot be isolated.
- Do not publish a discrepancy as resolved without a recorded disposition from the responsible owner.

## Human approval gates

- Before publishing new or expanded public API behavior, the API owner must review the contract diff, the operation evidence matrix, the contract-test results, the compatibility impact, and the discrepancy disposition.
- Before publishing an example derived from logs or observed traffic, the security or privacy owner must review its provenance, sanitization record, synthetic substitutions, and intended audience.
- Before executing a mutating example, the sandbox owner must approve the isolated target, the test data, the rollback or cleanup procedure, and the acceptable side effects.

## Expected output

Produce a versioned Markdown API reference containing:

- the audience and scope, base URL shape, and authentication;
- the operation summary, parameters, request example, success response schema and example, error table, behavior and side-effect notes, and limits;
- the example execution status, discrepancy register, approval state, assumptions, limitations, and evidence traceability.

The example execution report must distinguish contract-test evidence from commands that were directly executed while producing the reference.

## Completion criteria

- Every operation, parameter, field, status code, header, limit, and side-effect statement maps to supplied evidence.
- Every example uses synthetic data and is labeled executed or unexecuted, with its environment and result or its blocking prerequisite.
- Every discrepancy has an owner, a compatibility impact, and a disposition, or it explicitly blocks publication.
- The documented version, the operation identifiers, and the source paths all resolve at the immutable revision.
- No sensitive value, internal-only trace, or unsupported behavior appears in the artifact.
- Every required approval, and every gate that does not apply, is recorded with its evidence basis.

## Failure modes

- **F1:** The contract, implementation, validator, or test evidence resolves to different revisions.
- **F2:** Authentication or a mutating example cannot be exercised safely.
- **F3:** The approved contract and the implementation disagree about public behavior.
- **F4:** The tests do not cover a material documented response or error.
- **F5:** The contract omits information needed to write a usable example or operation description.

## Recovery procedure

- **R1:** Obtain matching immutable revisions, verify every source path, discard the mixed evidence matrix, and restart from scope freezing.
- **R2:** Substitute a validated mock or a synthetic unexecuted request, record the missing prerequisite, and resume without claiming live execution.
- **R3:** Record the exact mismatch and its compatibility impact, obtain the API owner's disposition, and resume drafting only for approved claims.
- **R4:** Mark the response unverified, request a named contract test with objective assertions, and rerun verification before changing its status.
- **R5:** Record the contract gap, omit the unsupported detail, ask the API owner for a contract clarification, and resume only after the approved contract changes.

## Example

The complete synthetic example documents `GET /v1/items/{itemId}` for server integrators.
It draws on an OpenAPI operation, matching handler and validator evidence, and a passing contract test, all at commit `c40aa12000000000000000000000000000000000`.
Its curl request stays explicitly unexecuted because no sandbox token is available.

See the [example input](examples/input.md) and the [expected output](examples/expected-output.md).
