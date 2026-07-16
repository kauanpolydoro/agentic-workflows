# Example input

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
