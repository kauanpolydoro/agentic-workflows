# Example input

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
