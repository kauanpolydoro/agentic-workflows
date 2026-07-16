# Get an item

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
