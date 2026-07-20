---
title: "Produce an evidence-backed API reference"
description: "Turn one approved public API contract revision and its matching handler, validator, and test evidence into a versioned reference, an example execution report, and a register of contract discrepancies."
---

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

See the [example input](#complete-example-input) and the [expected output](#complete-expected-output).

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/document-api/1.0.0",
  "title": "API documentation output contract",
  "description": "Validates the operation reference, request and response examples, execution report, discrepancy register, approvals, limitations, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "api-reference.md",
        "audience": "API integrators and API owners",
        "requires_title": true,
        "required_headings": [
          "Operation",
          "Authentication",
          "Request example",
          "Success response",
          "Error response",
          "Behavior, limits, and side effects",
          "Example execution report",
          "Contract discrepancy register",
          "Approval state",
          "Follow-up",
          "Assumptions and limitations",
          "Traceability"
        ],
        "required_literals": [
          "| Property | Value | Evidence |",
          "| Field | Type | Required | Allowed values | Evidence |",
          "| Status | Media type | Code | Body | Evidence |",
          "| Check | Status | Environment | Result | Evidence |",
          "| Action | Owner role | Dependency | Exit criterion | Status |",
          "| Claim group | Evidence | Disposition |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This synthetic scenario documents one stable operation at immutable commit `c40aa12000000000000000000000000000000000` for server integrators using API version `1.4`.
The objective is to publish a reference for `getItem` without documenting other operations, inferring an invalid-identifier response, or claiming that a curl request was executed.

## Scope and environment

- Operation: `GET /v1/items/{itemId}` with operation ID `getItem`.
- Base URL for the synthetic example: `https://sandbox.api.example.test`.
- Source revision: `c40aa12000000000000000000000000000000000` for contract, handler, validator, and tests.
- Test environment: isolated contract-test fixture with synthetic item records.
- Direct request environment: unavailable because no sandbox bearer token was supplied.

## Evidence inventory

### E1 - Approved OpenAPI operation

The retained OpenAPI source at `c40aa12000000000000000000000000000000000` declares API version `1.4`, server template `https://{environment}.api.example.test`, and operation `GET /v1/items/{itemId}` with operation ID `getItem`.
It requires `Authorization: Bearer <token>` and a required string `itemId` matching `^[A-Z0-9]{6}$`.
Its `200` JSON response requires `id` as a string and `state` as either `ready` or `held`.
Its `404` JSON response requires `code` with value `ITEM_NOT_FOUND` and `message` as a string.
No request body, response header, pagination field, rate-limit header, or other error response is defined for this operation.

### E2 - Handler and validator inspection

The retained `src/items/get-item.ts` and `src/items/item-id.ts` at `c40aa12000000000000000000000000000000000` enforce the E1 identifier pattern and return the two E1 response shapes.
The handler reads one item and has no mutation path, so repeating the request does not write state.
The inspected code does not promise that repeated responses remain byte-for-byte identical when item state changes between reads.
The inspected files define no pagination behavior or rate-limit header and contain no public error shape beyond E1.

### E3 - Contract-test result

In the isolated fixture at `c40aa12000000000000000000000000000000000`, `pnpm test:contract -- get-item` exited `0`.
The retained assertions cover valid ID `AB12CD` returning `200` with `{"id":"AB12CD","state":"ready"}` and missing ID `ZZ99ZZ` returning `404` with `{"code":"ITEM_NOT_FOUND","message":"Item ZZ99ZZ was not found"}`.
The test result verifies these fixture responses, not a live sandbox request.

### E4 - Direct example execution constraint

No sandbox bearer token is available, so a curl request to `https://sandbox.api.example.test` cannot be executed.
The host, token, and identifiers in the documentation example must remain explicitly synthetic.

### E5 - Publication scope and approval

The API owner approved the E1 contract for API version `1.4` and approved publication of a reference for server integrators limited to `getItem` at `c40aa12000000000000000000000000000000000`.
No expansion beyond E1 is approved.
Because every example value is synthetic and no log or traffic sample is used, security or privacy review is not required for this scenario.

## Constraints

- Document only operation `getItem` at `c40aa12000000000000000000000000000000000`.
- Use the synthetic sandbox host and token shown in E4.
- Label the curl request unexecuted.
- Distinguish contract-test results from direct request execution.
- Do not define invalid-identifier behavior, rate limits, pagination, headers, or side effects absent from E1 and E2.

## Complete expected output

Reference status: approved for API version `1.4` with an unexecuted direct request example. [E4, E5]

Audience: server integrators. [E5]

## Operation

`GET /v1/items/{itemId}` retrieves one item without modifying it. [E1, E2]

| Property | Value | Evidence |
|---|---|---|
| Operation ID | `getItem` | E1 |
| API version | `1.4` | E1, E5 |
| Synthetic base URL | `https://sandbox.api.example.test` | E1, E4 |
| Request body | None defined | E1 |

## Authentication

Send a bearer token in the `Authorization` header. [E1]
The token in the request example is synthetic and must be replaced only when an approved sandbox token is available. [E4]

## Path parameter

| Name | Type | Required | Validation | Evidence |
|---|---|---|---|---|
| `itemId` | string | Yes | Exactly six uppercase letters or digits matching `^[A-Z0-9]{6}$` | E1, E2 |

## Request example

```sh
API_BASE_URL='https://sandbox.api.example.test'
curl --request GET \
  --header 'Authorization: Bearer synthetic-token' \
  "$API_BASE_URL/v1/items/AB12CD"
```

Execution status: unexecuted because no sandbox bearer token was supplied. [E4]
The identifier satisfies the documented path pattern, but this curl command has no retained response. [E1, E4]

## Success response

Status: `200`. [E1, E3]
Media type: `application/json`. [E1]

| Field | Type | Required | Allowed values | Evidence |
|---|---|---|---|---|
| `id` | string | Yes | Contract does not define a narrower set | E1 |
| `state` | string | Yes | `ready`, `held` | E1 |

Contract-test example:

```json
{"id":"AB12CD","state":"ready"}
```

This response was observed in the isolated contract-test fixture, not through the unexecuted curl request. [E3, E4]

## Error response

| Status | Media type | Code | Body | Evidence |
|---|---|---|---|---|
| `404` | `application/json` | `ITEM_NOT_FOUND` | Required string fields `code` and `message` | E1 |

Contract-test example:

```json
{"code":"ITEM_NOT_FOUND","message":"Item ZZ99ZZ was not found"}
```

The fixture asserted this exact response for missing ID `ZZ99ZZ`. [E3]

## Behavior, limits, and side effects

- The inspected handler reads one item and performs no mutation. [E2]
- Idempotency disposition: repeating the request has no mutation side effect, but no response-stability guarantee is supplied when item state changes between reads. [E2]
- No pagination field or rate-limit header is defined for this operation. [E1, E2]
- No response header or error response other than `404` is defined in the supplied contract. [E1]
- The supplied evidence does not define the response for an identifier that fails the path pattern.

## Example execution report

| Check | Status | Environment | Result | Evidence |
|---|---|---|---|---|
| Contract test for `getItem` | Executed | Isolated fixture at `c40aa12000000000000000000000000000000000` | Exit `0`; asserted the documented `200` and `404` examples | E3 |
| Curl request | Unexecuted | Synthetic sandbox target | Blocked by unavailable bearer token | E4 |

## Contract discrepancy register

No discrepancy is identified among the supplied OpenAPI operation, handler, validator, and contract-test assertions for the fields and responses documented here. [E1, E2, E3]
This disposition does not establish behavior absent from those sources.

## Approval state

The API owner approved the version `1.4` contract and a reference limited to `getItem` at `c40aa12000000000000000000000000000000000`. [E5]
No public-contract expansion is included.
Security or privacy review is not applicable because the artifact uses only synthetic values and no observed traffic or logs. [E4, E5]

## Follow-up

| Action | Owner role | Dependency | Exit criterion | Status |
|---|---|---|---|---|
| Execute the documented curl request in an approved sandbox | API owner | Sandbox bearer token and retained safe target approval | Execution report records command, environment, status, and a schema-matching response or discrepancy | Optional and blocked by E4 |

## Assumptions and limitations

- The reference covers only `getItem` at commit `c40aa12000000000000000000000000000000000`. [E5]
- The synthetic host and token do not demonstrate network reachability or live authentication. [E4]
- The fixture responses establish contract-test behavior only and do not claim live sandbox execution. [E3, E4]
- Invalid-identifier behavior, additional errors, response headers, pagination, rate limits, and other operations remain undocumented because the supplied contract does not define them. [E1]

## Traceability

| Claim group | Evidence | Disposition |
|---|---|---|
| Version, operation, authentication, parameter, response schemas, and absent contract fields | E1 | Defined by approved contract |
| Runtime validation, read-only implementation, and absent implementation behavior | E2 | Inspected at the same revision |
| `200` and `404` fixture examples | E3 | Contract test passed |
| Synthetic host, token, and direct request status | E4 | Curl remains unexecuted |
| Audience, publication boundary, and approval | E5 | Approved within stated scope |
