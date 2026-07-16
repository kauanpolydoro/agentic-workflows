# Produce an evidence-backed API reference

## Objective

Transform an approved public contract and matching implementation and test evidence into a versioned API reference, example execution report, and discrepancy register.
The primary quality constraint is that every operation, field, status code, limit, side effect, and execution claim must be traceable to evidence at one immutable revision.

## When to use

Use this workflow to create or refresh reference documentation for stable operations whose approved public contract, implementation, validators, and contract tests can be inspected at the same revision.
Use it when consumers need request and response examples whose execution status and version scope are explicit.

## When not to use

Do not use when the API version or operation scope is unknown, the proposed contract is not approved, evidence revisions do not match, or safe examples would require production credentials or customer data.
Use an API contract review workflow first when the contract itself is changing or when a breaking compatibility decision remains unresolved.

## Required inputs

- **Public contract:** provide an immutable OpenAPI document or equivalent schema, its revision, and exact operation identifiers; this defines the publishable surface, and integrity requires that the source resolves and has API owner approval.
- **Implementation evidence:** provide handler and validator paths at the same revision; this confirms validation and side effects, and integrity requires that every path and referenced revision resolves.
- **Contract-test evidence:** provide the exact command, isolated environment, exit status, and relevant assertions; this supports observed examples, and integrity requires retained output tied to the contract revision.
- **Publication scope:** provide supported API version, base URL shape, intended audience, included operations, and exclusions; this prevents accidental expansion, and integrity requires agreement with the contract source.

## Optional inputs

- **Version-matched client examples:** use sanitized examples to improve task guidance after checking every field against the contract.
- **Sanitized error observations:** use them to identify a potential documentation gap, but never establish a public error contract from an observation alone.
- **Compatibility policy:** use it to classify contract discrepancies and determine whether publication must stop.

## Preconditions

- Contract, handler, validator, and tests resolve to the same immutable revision.
- The exact operation identifiers, supported API version, base URL shape, audience, and exclusions are recorded.
- Authentication values can be represented with synthetic data and no live secret.
- Mutating examples, if any, have an approved isolated non-production target and cleanup procedure.

## Workflow

1. **Freeze publication scope:** record the revision, API version, base URL shape, audience, included operations, and exclusions; advance only when every operation identifier resolves in the approved contract, and stop on any mismatch.
2. **Build an operation evidence matrix:** map authentication, parameters, validation, request bodies, success responses, errors, headers, limits, idempotency, and side effects to contract, implementation, and test evidence; advance only when every concern has attributable evidence or an explicit non-applicable status, and stop if a material concern remains unmapped.
3. **Reconcile sources:** compare contract, handler, validator, and tests field by field; advance only when each discrepancy has an owner and disposition or is marked as a publication blocker, and stop publication of an affected claim until disposition exists.
4. **Draft the reference:** use the approved contract for public semantics and matching implementation evidence for operational notes; advance only when every draft claim maps to the evidence matrix, and stop on any unsupported endpoint, field, status, limit, or operational note.
5. **Construct examples:** use synthetic identifiers, tokens, payloads, and hosts; advance only when every value validates against the documented schema and each example is labeled proposed or observed, and stop if safe synthetic data cannot represent the contract.
6. **Verify examples:** execute safe examples in an isolated fixture when credentials and cleanup are available, retaining command, environment, exit status, and response; advance with either retained execution evidence or an explicit unexecuted label and missing prerequisite, and stop if an execution claim lacks that evidence.
7. **Review security and compatibility:** check redaction, authentication wording, internal error leakage, pagination, idempotency, rate limits, versioning, and side effects against the evidence matrix; advance only when each check has a disposition, and stop on undocumented public expansion or unsafe disclosure.
8. **Obtain approvals:** submit new or expanded public behavior with the contract diff, evidence matrix, test results, compatibility impact, and discrepancy register to the API owner; advance when every applicable approval is recorded or explicitly non-applicable, and stop publication while a required approval is pending or denied.
9. **Deliver and reconcile:** provide the reference, example execution report, discrepancy register, evidence traceability, assumptions, limitations, and approval state; complete only when every completion criterion maps to the artifact, and stop handoff if any criterion remains unsupported.

## Decision points

- If the approved contract and runtime implementation disagree, document neither as resolved, record the exact discrepancy, and require API owner disposition before publishing the affected claim.
- If an example requires production credentials, customer data, or an uncontrolled mutation, replace it with a validated synthetic example or omit it.
- If a response field, status code, header, or limit lacks contract evidence, exclude it from the public reference and record the gap.
- If contract tests do not cover a material documented response, label that response unverified and request a contract test before claiming observed behavior.
- If newly observed behavior would expand the public contract, pause publication until the API owner approves the contract change and compatibility impact.

## Safety guardrails

- Never copy secrets, credentials, tokens, customer identifiers, or private endpoints into the artifact.
- Never invent response fields, endpoints, parameters, status codes, headers, limits, examples, or execution results.
- Never present internal stack traces as API errors or imply that implementation details are a supported contract.
- Use read-only requests or isolated fixtures unless an approved sandbox and cleanup procedure control mutations.
- Stop if evidence revisions differ, an operation is unapproved, or destructive side effects cannot be isolated.
- Do not publish a discrepancy as resolved without the responsible owner's recorded disposition.

## Human approval gates

- Before publishing new or expanded public API behavior, the API owner must review the contract diff, operation evidence matrix, contract-test results, compatibility impact, and discrepancy disposition.
- Before publishing an example derived from logs or observed traffic, the security or privacy owner must review its provenance, sanitization record, synthetic substitutions, and intended audience.
- Before executing a mutating example, the sandbox owner must approve the isolated target, test data, rollback or cleanup procedure, and acceptable side effects.

## Expected output

Produce a versioned Markdown API reference with audience and scope, base URL shape, authentication, operation summary, parameters, request example, success response schema and example, error table, behavior and side-effect notes, limits, example execution status, discrepancy register, approval state, assumptions, limitations, and evidence traceability.
The example execution report must distinguish contract-test evidence from commands that were directly executed while producing the reference.

## Completion criteria

- Every operation, parameter, field, status code, header, limit, and side-effect statement maps to supplied evidence.
- Every example contains synthetic data and is labeled executed or unexecuted with its environment and result or blocking prerequisite.
- Every discrepancy has an owner, compatibility impact, and disposition or explicitly blocks publication.
- The documented version, operation identifiers, and source paths all resolve at the immutable revision.
- No sensitive value, internal-only trace, or unsupported behavior appears in the artifact.
- Every required approval and non-applicable gate is recorded with its evidence basis.

## Failure modes

- **F1:** Contract, implementation, validator, or test evidence resolves to different revisions.
- **F2:** Authentication or a mutating example cannot be exercised safely.
- **F3:** The approved contract and implementation disagree about public behavior.
- **F4:** Tests do not cover a material documented response or error.
- **F5:** The contract omits information required to write a usable example or operation description.

## Recovery procedure

- **R1:** Obtain matching immutable revisions, verify every source path, discard the mixed evidence matrix, and restart scope freezing.
- **R2:** Use a validated mock or synthetic unexecuted request, record the missing prerequisite, and resume without claiming live execution.
- **R3:** Record the exact mismatch and compatibility impact, obtain API owner disposition, and resume drafting only for approved claims.
- **R4:** Mark the response unverified, request a named contract test with objective assertions, and rerun verification before changing its status.
- **R5:** Record the contract gap, omit the unsupported detail, request a contract clarification from the API owner, and resume only after the approved contract changes.

## Example

The complete synthetic example documents `GET /v1/items/{itemId}` for server integrators from an OpenAPI operation, matching handler and validator evidence, and a passing contract test at commit `c40aa12000000000000000000000000000000000`.
Its curl request remains explicitly unexecuted because no sandbox token is available.

See [example input](examples/input.md) and [expected output](examples/expected-output.md).
