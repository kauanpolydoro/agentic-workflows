---
title: "Review an API contract change"
description: "Produce a wire-level compatibility matrix, client-impact register, and evidence-based API rollout decision."
---

# Review an API contract change

## Objective

Transform immutable released and proposed contracts, implementation behavior, supplied runtime observations, client evidence, and versioning policy into a bidirectional compatibility report, finding register, and rollout decision.
The primary quality constraint is that every wire-level difference and client-impact claim must be traced without assuming generated schemas describe runtime behavior or unknown consumers.

## When to use

- An HTTP, event, or library contract will change before release.
- Producer and consumer teams need a compatibility and deprecation decision.
- A deprecated field or version is approaching removal and needs retained usage and owner evidence.

## When not to use

- The previous contract or proposed contract is unavailable.
- Runtime behavior cannot be reconciled with generated schemas.
- The change is an internal refactor with no observable contract effect.
- Required client evidence or approval is absent and the request is to ship or remove behavior immediately.

## Required inputs

- **Immutable released and proposed wire contracts with protocol revisions:** Supply complete OpenAPI, AsyncAPI, protobuf, event schema, or library signature artifacts plus immutable release and candidate identifiers.
  This evidence defines declared requests, responses, errors, headers, content types, nullability, defaults, and version selection.
  Parse both artifacts and confirm their provenance and completeness for the reviewed surface.
- **Handler, serializer, default, error, and routing behavior evidence:** Supply exact implementation diffs for every changed contract element, including runtime-only defaults and error mapping, plus executed response observations when deployed or local runtime behavior is part of the requested conclusion.
  Source evidence establishes implemented behavior, while retained execution results establish observed runtime behavior.
  Map each changed implementation branch to a contract element, label unexecuted behavior as implementation-derived, and stop if material behavior remains undocumented.
- **Applicable compatibility, deprecation, and severity policy:** Supply producer and consumer compatibility rules, minimum notice or support window, removal conditions, and release disposition by severity.
  This evidence turns wire differences into reviewable decisions.
  Confirm the policy version and API surface to which it applies.

## Optional inputs

- **Known-client parser contract inventory, ownership, and contract-test results:** Replaces assumptions with exact accepted content types, fields, nullability, and versions for identified consumers while keeping declared parser behavior separate from an executed failure.
- **Sanitized usage metrics:** Establish field or version use only when aggregation, retention, and privacy controls are documented.
- **Rollout capability and rollback evidence:** Constrains recommendations to routing, version, feature-flag, or deployment mechanisms that actually exist.

## Preconditions

- Old and new contract snapshots are immutable and parseable.
- The transport protocol and compatibility policy are known.
- Proposed runtime behavior is mapped to the candidate contract.
- Sensitive payload examples are sanitized.
- Shipping and removal decisions can identify the API owner, affected client owners, and release manager.

## Workflow

1. **Freeze the comparison boundary.**
   Record released and candidate artifact identifiers, protocol version, API surface, implementation revision, applicable policies, and exclusions.
   Parse both contract artifacts and inventory all reviewed operations or messages.
   Advance only when provenance and syntax pass; otherwise stop under F1.
2. **Create the wire-difference ledger.**
   Compare methods or topics, version selectors, status codes, content types, fields, requiredness, nullability, defaults, numeric ranges, enums, headers, ordering, pagination, idempotency, and errors.
   Record unchanged elements needed to interpret each difference.
   Advance when every contract delta has a stable identifier and no generated-only noise remains unexplained.
3. **Reconcile implementation and observed runtime behavior.**
   Trace each ledger item through handlers, validators, serializers, error mapping, defaults, and routing.
   Record implementation-derived behavior separately from observed responses and state whether each source matches released behavior, candidate behavior, both, or neither.
   Do not describe a client or server runtime failure as observed unless a retained execution result establishes it.
   Stop under F2 when the candidate contract and implementation disagree.
4. **Classify producer compatibility.**
   Determine whether the new producer can accept old requests and emit an old-compatible response for every delta.
   Treat changed defaults and error formats as wire behavior even when the success schema is unchanged.
   Cite contract and implementation evidence for each classification.
5. **Classify consumer compatibility.**
   Map every known client parser, version selector, field assumption, and owner to the ledger.
   Record contract-level incompatibility separately from executed parser results and inferred runtime impact, and keep unlisted consumers unknown.
   Do not infer acceptance from permissive schema generation without parser evidence.
6. **Validate both directions.**
   Evaluate supplied producer contract tests and representative client parsing tests against released and candidate forms.
   Identify command, revision, fixture, and result for executed checks.
   Label missing checks as proposed and keep affected classifications unverified.
7. **Choose a supported compatibility path.**
   Apply the supplied policy and available routing mechanisms to in-place compatibility, additive transition, explicit version, deprecation window, or rejection of the change.
   Identify client migrations, owner roles, notice, exit evidence, and old-behavior retention.
   Do not recommend per-client routing when only version-level routing exists.
   When clients select an explicit version path, require each affected client owner to approve and verify that path adoption rather than describing gateway routing as a client cohort.
8. **Design rollout, observation, and rollback.**
   Record baseline metrics, privacy-safe signals, abort thresholds, observation window, traffic steps, and the exact supported boundary for rollback.
   Cover every material contract change with an approved signal and threshold, or keep traffic blocked for the uncovered change.
   Retain old behavior until client and observation gates pass.
9. **Package and approve the decision.**
   Deliver the compatibility matrix, finding and client-impact registers, verification, versioning or deprecation plan, monitoring, rollback, assumptions, limitations, and traceability.
   Obtain API-owner and affected-client approval before a breaking shipment and API-owner approval before deprecated behavior removal.

## Decision points

- If the prior wire contract cannot be recovered, stop compatibility approval and reconstruct it from released artifacts or tests.
- If candidate implementation or retained runtime observations contradict the proposed contract, correct the inconsistent source of truth and rerun the entire wire comparison before approval.
- If a known client rejects the new shape, classify the change as breaking for that client and require a compatibility path.
- If client ownership is unknown, preserve the old behavior while collecting privacy-safe usage evidence.
- If a proposed routing strategy is unavailable in the supplied gateway or deployment capability, reject that strategy and choose a supported version or deployment boundary.
- If a client has not adopted the selected version path, keep that client on the released path and do not count it as migrated merely because the new route exists.
- If a material contract change lacks a privacy-safe monitoring signal, baseline, or abort threshold, keep traffic to that behavior blocked until those controls are approved.
- If the deprecation window or zero-use evidence is incomplete, keep the deprecated field or version available.
- If monitoring would require retaining response bodies, personal data, or internal errors, redesign the signal before rollout.

## Safety guardrails

- Do not expose internal errors in public API responses.
- Do not assume generated schemas represent runtime defaults or error behavior.
- Do not include personal data or internal stack details in contract examples.
- Do not silently change defaults, error shapes, or nullability.
- Do not log or retain request or response bodies merely to infer client compatibility.
- Keep rollout and rollback within documented version, gateway, deployment, or feature-flag capabilities.
- Do not describe a release cohort unless the supplied routing or client-selection evidence establishes how that cohort is selected.
- Preserve the released contract artifact and old handler until migration and observation gates pass.
- Stop removal when the deprecation window or client evidence is incomplete.

## Human approval gates

- Before shipping a breaking change, the API owner and every identified affected client owner approve the wire-difference evidence, migration instructions, support window, verification results, rollout, and rollback; the release manager then approves traffic changes.
- Before removing a deprecated field, the API owner approves completed notice, elapsed deprecation window, privacy-safe zero-use evidence, client-owner dispositions, and rollback boundary.

## Expected output

- **Bidirectional API compatibility report and finding register:** Every wire difference has old and new forms, producer and consumer classification, evidence, impact, severity, confidence, recommendation, verification, and disposition.
- **Observed and unknown client-impact register:** Client version, owner role, parser assumption, migration status, evidence source, and explicit unknown-consumer limitation.
- **Versioning, deprecation, rollout, monitoring, and rollback plan:** Supported routing mechanism, client path-adoption steps, dependencies, owners, notice and observation windows, objective exit criteria, per-change privacy-safe signals, abort thresholds, approvals, assumptions, and limitations.

The artifact must distinguish observations, inferences, recommendations, executed checks, proposed checks, assumptions, limitations, and next actions.
Material claims must cite example evidence IDs.

## Completion criteria

- Every wire-level difference is classified in both producer and consumer directions.
- Known clients are identified and unknown ownership is explicit.
- Candidate implementation and contract behavior agree for every changed element, and any claimed runtime equivalence has a retained observation; otherwise runtime remains explicitly unverified.
- Recommendations cite contract, implementation, client, policy, test, and rollout-capability evidence as applicable.
- Executed and proposed tests are clearly separated, with affected classifications left unverified when no result exists.
- Contract incompatibilities, implementation-derived behavior, inferred runtime impact, and observed runtime failures are labeled separately.
- Every material changed behavior has an approved monitoring signal and threshold, or its rollout remains explicitly blocked.
- Breaking changes have an approved compatibility or versioning path before shipping.
- Deprecated behavior is retained until notice, usage, client, and approval gates pass.

## Failure modes

- **F1:** The previous contract is unavailable.
- **F2:** Candidate implementation or retained runtime behavior contradicts the proposed schema.
- **F3:** Client ownership or usage is unknown.
- **F4:** The selected rollout or rollback mechanism does not exist.

## Recovery procedure

- **R1:** Recover the released schema, examples, and version selector from immutable release artifacts or retained tests, verify provenance, and restart at workflow step 1.
- **R2:** Halt approval, verify the provenance and environment of any retained response observation, and decide with the API owner whether the contract, implementation, or observation boundary is incorrect.
  Align the authoritative artifacts, then restart at workflow step 2 before rerunning producer and consumer contract tests.
- **R3:** Preserve old behavior, assign an owner-discovery action, collect approved privacy-safe version or field-use evidence, and resume at workflow step 5 while keeping unknown consumers explicit.
- **R4:** Reject the unsupported strategy, inventory actual version, gateway, deployment, and feature-flag boundaries, then restart at workflow step 7 with a mechanism that has retained rollback evidence.

## Example

The complete synthetic example is in [#complete-example-input](#complete-example-input), with its complete artifact in [#complete-expected-output](#complete-expected-output).
It demonstrates evidence traceability without relying on external sources.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/api-contract-review/1.0.0",
  "title": "API contract review output contract",
  "description": "Validates the compatibility report, client-impact register, decision record, and rollout controls in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "api-contract-review.md",
        "audience": "API owners, client owners, and reviewers",
        "requires_title": true,
        "required_headings": [
          "Scope",
          "Compatibility matrix",
          "Findings",
          "Recommendation",
          "Verification plan",
          "Executed",
          "Proposed",
          "Limitations",
          "Decision record",
          "Monitoring and rollback",
          "Client-impact register",
          "Traceability"
        ],
        "required_literals": [
          "| Difference | Released form | Candidate form | Producer direction | Consumer direction | Evidence |",
          "| Severity | Confidence | Finding | Evidence | Impact | Recommendation | Verification | Disposition |",
          "| Client | Retained parser contract | Impact | Owner and migration status | Evidence |",
          "| Material conclusion | Evidence |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This is a synthetic, self-contained scenario.
No external record should be consulted.

## Context

Synthetic HTTP contract change for `GET /v1/users/{id}`.
The released API revision is `users-v1@c100`, and the proposed in-place revision is `users-v1@c200`.

## Request

Classify compatibility and recommend a rollout.

## Constraints

- Use only the evidence below.
- Treat commands as executed only when their evidence explicitly records a result.
- State assumptions and limitations.
- Do not call an API or retain a response body.

## Evidence inventory

### E1 - Complete released OpenAPI contract

- Type: Immutable released OpenAPI 3.1 artifact.
- Content: Revision `users-v1@c100` is the complete contract for the reviewed API surface:

```yaml
openapi: 3.1.0
info:
  title: Synthetic Users API
  version: users-v1@c100
servers:
  - url: https://api.example.test
paths:
  /v1/users/{id}:
    get:
      operationId: getUser
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: User found
          content:
            application/json:
              schema:
                type: object
                required: [id, email]
                properties:
                  id: { type: string }
                  email: { type: string }
        "404":
          description: User not found
          content:
            text/plain:
              schema: { type: string }
```

- Content: This is the only operation in the reviewed artifact, and it defines no security scheme, request body, response header, alternate status code, default response, content negotiation rule, or request or response version header.
- Integrity: Immutable synthetic artifact identifier `users-v1@c100` belongs to the released revision.
- Establishes: Complete released path, method, parameter, success and error wire shapes, content types, and version selector for the reviewed surface.

### E2 - Complete candidate OpenAPI contract

- Type: Immutable candidate OpenAPI 3.1 artifact.
- Content: Revision `users-v1@c200` is the complete candidate contract for the same reviewed surface:

```yaml
openapi: 3.1.0
info:
  title: Synthetic Users API
  version: users-v1@c200
servers:
  - url: https://api.example.test
paths:
  /v1/users/{id}:
    get:
      operationId: getUser
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: User found
          content:
            application/json:
              schema:
                type: object
                required: [id, email]
                properties:
                  id: { type: string }
                  email: { type: [string, "null"] }
        "404":
          description: User not found
          content:
            application/json:
              schema:
                type: object
                required: [code]
                properties:
                  code: { type: string, const: user_not_found }
```

- Content: This is the only operation in the candidate artifact, and it defines no security scheme, request body, response header, alternate status code, default response, content negotiation rule, alternate version selector, or compatibility response.
- Integrity: Immutable synthetic artifact identifier `users-v1@c200` identifies the candidate.
- Establishes: Complete candidate path, method, parameter, nullable success field, JSON error shape, content types, and in-place replacement intent for the reviewed surface.

### E3 - Implementation diff

- Type: Complete behavior diff at implementation revision `impl@d200`.
- Content: The handler changes are:

```diff
 if (!user) {
-  return res.status(404).type("text/plain").send("user not found");
+  return res.status(404).json({ code: "user_not_found" });
 }
 return res.json({
   id: user.id,
-  email: user.email,
+  email: user.email ?? null,
 });
```

- Content: No content negotiation, version branch, compatibility serializer, or other changed error path exists in the complete handler diff.
- Integrity: The diff belongs to candidate contract `users-v1@c200`.
- Establishes: The candidate implementation is written to produce the two proposed wire changes and contains no released-behavior branch; it does not establish an observed response.

### E4 - Client inventory

- Type: Complete known-client parser inventory.
- Content: CLI v2 calls `/v1/users/{id}`, rejects a 404 unless `Content-Type` starts with `text/plain`, and models `email` as a non-null string.
- Content: Web v5 calls `/v1/users/{id}`, accepts either text or `{code:string}` for 404, and models `email` as `string | null`.
- Content: These are retained parser-contract records, not results from executing either client against the candidate response.
- Content: The CLI owner and web owner are identified; the supplied inventory does not claim there are no other consumers.
- Integrity: Parser records identify released client versions `CLI v2` and `web v5`.
- Establishes: Known-client parser contracts, ownership, and unknown-consumer boundary without establishing an observed runtime failure.

### E5 - Versioning policy

- Type: API compatibility, severity, and deprecation policy.
- Content: Changing an error content type or making a required response field nullable is consumer-breaking and requires an explicit API version or a compatibility window.
- Content: A known-client parser-contract incompatibility without an executed parser failure is Medium severity and blocks an in-place release until the incompatibility is removed, safely versioned, or disproved by retained parser execution.
- Content: A known released client failure is High severity and blocks in-place release; unknown-consumer impact is Medium until usage or migration evidence closes it.
- Content: Deprecated behavior requires 30 days of notice and privacy-safe zero-use evidence before removal.
- Establishes: Compatibility classifications, severity, release disposition, and removal gate.

### E6 - Test record

- Type: Verification inventory.
- Content: Proposed producer contract tests cover released text 404, candidate JSON 404, non-null email, and null email.
- Content: Proposed consumer tests replay both response variants through CLI v2 and web v5 parsers.
- Content: No producer, consumer, integration, or rollout command was executed for this example.
- Establishes: Required verification and its unexecuted status.

### E7 - Rollout capability and approval state

- Type: Gateway, monitoring, rollback, and gate record.
- Content: The gateway can route `/v1` and `/v2` to separate handlers and can atomically restore `/v2` to its previous handler revision; it cannot select a contract by individual client identity.
- Content: The gateway has no percentage, cohort, or client-identity traffic selector; a known client reaches `/v2` only after its owner changes that client's requested path.
- Content: The supplied baseline for the old endpoint is 100 parse-failure events among 10,000 CLI v2 `/v1` 404 parse attempts, or 1.0 percent, during the retained 30-minute window from `2026-01-10T14:00:00Z` through `2026-01-10T14:30:00Z`.
- Content: The baseline method is `parse_failure_counter_delta / 404_parse_attempt_counter_delta x 100`, using the same API-version and client-version tags and one-minute counter resolution used for rollout observation; no event or sample was excluded.
- Content: The approved abort threshold is an increase of 0.5 percentage points over that baseline during each 30-minute client-adoption observation window, so the 404 parse-failure abort value is 1.5 percent.
- Content: The signal is an aggregate client-side parse-failure counter tagged by API version and client version; it retains no request body, response body, email, user ID, or internal error.
- Content: No privacy-safe signal, baseline, or abort threshold is supplied for failures caused by a null `email` value.
- Content: The API owner has not approved a versioned endpoint or compatibility window; the release manager owns rollout and rollback after API-owner approval.
- Content: Neither known client owner has approved a migration plan.
- Establishes: Actual version-routing and rollback capability, the absence of cohort routing, monitoring coverage for 404 parsing only, owner roles, and pending approvals.

## Complete expected output

> Synthetic contract-review example derived only from the companion evidence package.

## Scope

Endpoint: `GET /v1/users/{id}`.
Released revision: `users-v1@c100` at `/v1` [E1].
Candidate revision: `users-v1@c200`, proposed in place at `/v1` [E2].
Implementation revision `impl@d200` matches both candidate changes and contains no compatibility branch [E3].

## Compatibility matrix

| Difference | Released form | Candidate form | Producer direction | Consumer direction | Evidence |
|---|---|---|---|---|---|
| 404 content type and body | `text/plain` string | `application/json` object with constant code | The candidate implementation emits only the new form, so its source does not satisfy the released response contract; no response was executed. | The CLI v2 parser contract accepts only the released content type; the web v5 parser contract accepts both; no parser execution ran and unlisted clients are unknown. | E1, E2, E3, E4, E6 |
| Required `email` value | Non-null string | String or null | The candidate implementation may emit null and cannot guarantee the released non-null contract; no response was executed. | The CLI v2 parser contract requires a non-null string; the web v5 parser contract accepts null; no parser execution ran and unlisted clients are unknown. | E1, E2, E3, E4, E6 |

Both differences are consumer-breaking under the supplied policy [E5].

## Findings

| Severity | Confidence | Finding | Evidence | Impact | Recommendation | Verification | Disposition |
|---|---|---|---|---|---|---|---|
| Medium | High for contract incompatibility; runtime untested | Replacing `/v1` in place creates a 404 contract that is incompatible with the retained CLI v2 parser contract. | E1, E2, E3, E4, E5, E6 | Inference: if CLI v2 behaves as its retained parser contract states, the candidate content type would cause its missing-user flow to reject the response. No client failure was observed, and the supplied policy classifies a retained parser-contract incompatibility without executed failure as Medium. | Preserve released `/v1`; expose the candidate behavior only through `/v2` after supported client path adoption, or add a policy-approved compatibility response. | Replay released and candidate 404 fixtures through CLI v2 and producer contract tests. No test ran. | Blocking in-place release and pending CLI-owner migration approval |
| Medium | High for contract incompatibility; runtime untested | The candidate makes required `email` nullable; the CLI v2 parser contract requires non-null, the web v5 parser contract accepts null, and other consumers are unknown. | E1, E2, E3, E4, E5, E6 | Inference: CLI v2 could receive a value outside its model if it adopted `/v2`; impact on unlisted consumers cannot be quantified. No null-handling failure was observed. | Put nullable behavior behind `/v2`, publish migration examples, require explicit path adoption by each known client, and retain `/v1` until client, usage, and monitoring gates pass. | Replay non-null and null fixtures through both known parsers and define a privacy-safe null-handling signal, baseline, and threshold. No test, usage collection, or null-handling monitor exists. | Open compatibility risk; blocking in-place release and `/v2` traffic until monitoring is complete |

## Recommendation

Do not replace the existing behavior in place.
Preserve released behavior on `/v1` and propose the candidate contract on `/v2`, because the gateway supports separate version routes but not per-client routing [E1, E2, E7].
Provide both known client owners with old and new success and error fixtures, migration requirements, and the 30-day removal policy [E4, E5].
Require the web v5 owner to approve and verify changing its requested path from `/v1` to `/v2`; parser compatibility alone does not adopt the new path [E4, E7].
Do not schedule `/v1` removal until notice has elapsed, privacy-safe zero-use evidence exists, and client dispositions are approved [E5, E7].

## Verification plan

### Executed

No producer, consumer, integration, or rollout command was executed [E6].

### Proposed

- Validate both OpenAPI artifacts and run producer tests for released text 404, candidate JSON 404, non-null email, and null email [E1, E2, E6].
- Replay all four fixtures through CLI v2 and web v5 and retain parser results by client version [E4, E6].
- Verify `/v1` remains on the released handler while `/v2` serves only the candidate handler, then rehearse atomic `/v2` rollback [E7].
- Define and approve a privacy-safe signal, baseline, and abort threshold for null-email handling before any client sends traffic to `/v2` [E7].
- Verify the CLI and web path changes separately; the gateway cannot migrate either client by identity [E4, E7].

The rollout remains blocked until these results exist, null-email monitoring is defined, and the API owner and affected client owners approve the versioning and path-adoption design.

## Limitations

Only CLI v2 and web v5 appear in the supplied inventory [E4].
No conclusion is made about compatibility, ownership, or usage for unlisted consumers.
The implementation diff is supplied as complete for the two changes, but no runtime response was observed [E3, E6].

## Decision record

The release decision remains blocked until the API owner approves the versioned endpoint design [E7].
The decision must include migration evidence from the CLI owner because the CLI v2 parser contract accepts only the released 404 content type and models email as non-null [E4].
Web v5 needs no parser-shape change for the supplied responses, but its owner must still approve and verify `/v2` path adoption [E4, E7].
Neither client owner has approved a migration plan [E7].

## Monitoring and rollback

1. Keep `/v2` traffic blocked while producer and parser tests, API-owner approval, client-owner path-adoption approvals, and a null-email signal and threshold are missing [E6, E7].
2. After those gates pass, each approved client owner changes that client's requested path to `/v2`; the gateway cannot create a client cohort or migrate a client by identity [E4, E7].
3. For each approved path adoption, monitor the aggregate 404 parse-failure counter by API and client version for 30 minutes using the retained baseline method and one-minute counter resolution, without retaining bodies, emails, user IDs, or internal errors [E7].
4. Abort the adoption if the 404 parse-failure rate reaches 1.5 percent, compared with the retained 100-of-10,000 baseline from `2026-01-10T14:00:00Z` through `2026-01-10T14:30:00Z`, or if the separately approved null-email threshold or another approved client signal is breached [E7].
5. Roll back `/v2` atomically to its previous handler revision and direct the affected client owner to restore `/v1`; do not claim per-client gateway rollback because that capability does not exist [E7].
6. Keep `/v1` and its handler until the 30-day notice, zero-use evidence, client-owner dispositions, and API-owner removal approval all pass [E5, E7].

## Client-impact register

| Client | Retained parser contract | Impact | Owner and migration status | Evidence |
|---|---|---|---|---|
| CLI v2 | `/v1`, text 404, non-null email | Parser contract is incompatible with both candidate differences; runtime result untested | CLI owner identified; parser and `/v2` path migration not approved or tested | E4, E6, E7 |
| Web v5 | `/v1`, accepts both 404 forms and nullable email | Parser contract is compatible with both shapes; runtime result untested | Web owner identified; `/v2` path adoption not approved or tested | E4, E6, E7 |
| Unlisted consumers | Unknown | Unknown | Owner discovery and privacy-safe usage evidence required | E4, E5 |

## Traceability

| Material conclusion | Evidence |
|---|---|
| Released wire shape and `/v1` selector | E1 |
| Candidate nullable email, JSON error, and in-place proposal | E2 |
| Candidate implementation matches the candidate contract without compatibility behavior; runtime is unobserved | E3, E6 |
| Known parser contracts, owners, unexecuted status, and unknown consumers | E4, E6 |
| Breaking classification, severity, and 30-day removal policy | E5 |
| Required tests were not executed | E6 |
| Version routing, absence of cohort routing, complete 404 baseline method and sample, 404-only monitoring coverage, and pending approvals | E7 |
