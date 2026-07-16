---
title: "Harden an untrusted TypeScript boundary"
description: "Replace unchecked type assumptions with runtime narrowing and verified state models while preserving documented public behavior and compatibility."
---

# Harden an untrusted TypeScript boundary

## Objective

Transform an inventory of unsafe TypeScript assumptions into explicit boundary narrowing, state models, and a before-and-after validation record.
The primary quality constraint is that runtime inputs, public signatures, accepted values, error precedence, and observable behavior remain unchanged unless separately approved.

## When to use

- An untrusted parser, network response, storage record, environment value, or message payload is cast directly to a domain type.
- Broad unions, nullable fields, or unchecked indexing allow impossible internal states.
- Compiler suppressions or assertions conceal a runtime invariant that can be validated or modeled.
- Public type declarations differ from a documented runtime contract and need a bounded compatibility-preserving correction.

## When not to use

- Runtime shapes, accepted values, and error behavior cannot be observed or established from attributable evidence.
- The requested outcome is a new public contract or behavior rather than a compatibility-preserving safety change.
- The target has no meaningful static boundary or the unsafe value never crosses into typed domain logic.
- Existing compiler or behavior failures are unbounded, so a before-and-after result cannot be attributed to the scoped change.

## Required inputs

- **Immutable unsafe-construct inventory:** Record the target revision, exact files, symbols, casts, broad types, non-null assertions, suppressions, unchecked access, and compiler diagnostics.
  This defines the remediation scope.
  Validate it with reproducible searches and compiler output, and review each hit to exclude comments and generated files.
- **Runtime input and error contract:** Provide accepted shapes, invalid shapes, coercion rules, value ranges, missing-field behavior, error messages or codes, and precedence when several fields are invalid.
  This prevents a type cleanup from silently changing runtime behavior.
  Validate the contract against schemas, tests, public documentation, or an authorized owner decision.
- **Public compatibility boundary and consumer inventory:** List exported function signatures, declaration output, downstream packages or call sites, and compatibility constraints.
  This identifies which type changes require approval or migration.
  Validate consumers at the immutable revision and state when the inventory is incomplete.
- **Baseline commands and results:** Supply exact typecheck, behavior-test, negative-case, declaration or consumer check, and unsafe-search commands with environment, exit codes, and retained output.
  This separates pre-existing conditions from the change.
  Validate the baseline from a clean checkout or label it as supplied but not rerun.

## Optional inputs

- An authoritative runtime schema can become the single parser source after its accepted and rejected shapes are compared with the contract.
- Sanitized real boundary fixtures can reveal shapes absent from documentation without exposing secrets or personal data.
- Third-party declaration sources and minimized runtime observations can justify a narrow local augmentation.
- Compiler strictness diagnostics can prioritize follow-up work outside the current boundary.

## Preconditions

- The target revision and named source paths resolve and generated files are excluded from manual edits.
- Accepted inputs, rejected inputs, coercion policy, error behavior, and error precedence are attributable.
- Baseline typecheck and scoped behavior tests have recorded outcomes.
- Public signatures and known consumers are listed before implementation.
- The allowed file scope and any owner approvals are explicit.

## Workflow

### 1. Freeze scope and baseline

Record the immutable revision, target symbols, public signatures, consumer list, commands, and initial unsafe-search results.
Classify each hit as boundary risk, impossible-state risk, justified invariant, generated code, or false positive.
Advance when every targeted construct has a location and risk statement.
Stop if the inventory mixes unrelated modules or unbounded baseline failures.

### 2. Model the runtime contract

Create a table of accepted, rejected, missing, null, malformed, out-of-range, and multi-invalid inputs with exact outputs or errors.
Record coercion rules and validation precedence.
Advance when every branch in the planned narrowing has an attributable expected result.
Stop if a proposed branch requires inventing behavior.

### 3. Identify trust boundaries and invariants

Trace each value from untrusted origin through parsing to domain use.
Classify it as `unknown` at the boundary until a schema, predicate, or constructor establishes the domain type.
For internal assertions, write the invariant and the code path that enforces it.
Advance when every target has either a runtime validation point or a proved internal invariant.
Stop on an assertion whose invariant cannot be observed.

### 4. Design the narrowest model

Choose discriminated unions, exact object checks, predicates, exhaustive switches, branded constructors, or local declaration augmentation according to the contract.
Preserve accepted values and error order, and avoid coercion not present in the baseline.
Advance when the model represents all valid states and rejects only contract-invalid states.
Stop if a public type or accepted runtime shape must change without approval.

### 5. Implement incrementally

Remove one unsafe assumption at a time at a named path and add the minimum runtime validation or state model needed.
Run the focused typecheck and behavior cases after each logical change.
Advance when the unsafe construct disappears and observable results match baseline.
Stop and revert the logical change if an error message, accepted value, public declaration, or consumer result changes unexpectedly.

### 6. Add negative and precedence tests

Add cases for missing, malformed, out-of-range, no-coercion, and multiple-invalid inputs from the contract.
Ensure each case exercises the public boundary rather than the helper implementation.
Advance when every new validation branch has an observable case and the intended error precedence is protected.
Stop if a test encodes a behavior with no attributable source.

### 7. Validate compatibility and unsafe residue

Run typecheck, focused behavior tests, declaration or consumer checks, and scoped searches for the targeted casts, `any`, double casts, non-null assertions, and suppressions.
Compare exported signatures and public errors with baseline.
Advance when commands pass, target hits are removed or justified, and the final diff remains in scope.
Stop if a public or runtime contract difference appears without approval.

### 8. Deliver the change record

Report baseline facts, trust-boundary analysis, named patch, test additions, before-and-after unsafe inventory, command results, compatibility, approvals, assumptions, and residual uncertainty.
Separate observed runtime evidence from inferred invariants and recommendations.
The artifact is complete when every result and compatibility claim is traceable.

## Decision points

- If a value originates from parsing, I/O, storage, environment, or an external API, treat it as `unknown` and narrow it before domain use.
- If an assertion depends on an invariant that cannot be traced to validation or construction, replace it with validation or stop until contract evidence exists.
- If narrowing would accept a previously rejected value through coercion, reject the design unless the runtime contract explicitly authorizes that behavior.
- If two fields are invalid and the baseline defines error precedence, validate them in that order and protect it with a regression case.
- If a public type or accepted runtime shape must change, pause and obtain maintainer approval with a consumer migration plan.
- If a third-party declaration contradicts observed runtime values, add the narrowest local augmentation only with a sanitized fixture, runtime test, and upstream source.
- If typecheck passes but behavior or consumer checks change, treat the change as incompatible and revert or obtain approval.

## Safety guardrails

- Never perform **introducing explicit or implicit any** in the target, helpers, fixtures, or public declarations.
- Never perform **using double casts non-null assertions or suppression comments to hide uncertainty** from the compiler.
- Never perform **changing runtime behavior silently**, including accepted shapes, coercion, validation order, or public errors.
- Parse untrusted values as `unknown` and validate before logging or domain use.
- Do not log raw parser, request, configuration, storage, or message payloads that may contain secrets.
- Keep changes within the approved file and consumer scope, and do not combine type hardening with unrelated refactoring.
- Stop on an unexplained behavior, declaration, or consumer difference and restore the last verified checkpoint.

## Human approval gates

- Before **changing a public type or accepted runtime shape**, the repository maintainer approves the current contract, consumer inventory, proposed signature or shape, migration plan, compatibility tests, and rollback.
- Before **changing documented public error behavior**, the API owner approves the old and new errors, precedence, user impact, versioning disposition, and regression tests.
- Before adding runtime coercion, the API owner confirms that the public contract already permits the coerced form and reviews negative cases.

## Expected output

Produce one Markdown type-safety change record containing:

1. Status, immutable revision, approved scope, and public compatibility boundary.
2. Baseline unsafe inventory, compiler state, behavior state, and consumer state.
3. Trust-boundary analysis that separates observed facts from inferred invariants.
4. Implemented boundary-narrowing patch at named paths with relevant code or diff.
5. Added negative and error-precedence tests at named paths.
6. Before-and-after unsafe-construct and compatibility report.
7. Typecheck, behavior, negative-case, unsafe-search, and consumer validation record with commands and exit codes.
8. Approval disposition, assumptions, limitations, residual risk, and evidence traceability.

Any unexecuted change or command must be labeled proposed rather than included in a completed result.

## Completion criteria

- Every targeted unsafe construct is removed or retained with a documented and enforceable runtime invariant.
- Every untrusted value is narrowed before it becomes a domain object.
- Accepted values, rejected values, coercion policy, error precedence, public signatures, and known-consumer results match baseline unless approved.
- Typecheck, focused behavior tests, negative cases, declaration or consumer checks, and scoped unsafe searches have recorded post-change results.
- No new `any`, double cast, non-null assertion, or suppression hides uncertainty.
- The final diff contains only approved paths and every material claim cites evidence.

## Failure modes

- **F1:** The runtime input shape, coercion policy, or error precedence cannot be established.
- **F2:** A third-party declaration contradicts sanitized observed runtime values.
- **F3:** Narrowing changes an accepted value, public error, declaration, or consumer result.
- **F4:** The target unsafe construct disappears but a new cast, `any`, assertion, or suppression replaces it.

## Recovery procedure

- **R1:** Stop implementation, collect authoritative contract evidence or sanitized fixtures, obtain owner disposition where needed, and restart contract modeling.
- **R2:** Minimize the mismatch, add a runtime test, document the upstream declaration source, and use a narrow local augmentation only after maintainer review.
- **R3:** Revert to the last behavior-compatible checkpoint, compare exact before-and-after outputs, and redesign validation to preserve the established contract.
- **R4:** Reject the substitution, return the boundary value to `unknown`, add explicit narrowing, and rerun the complete unsafe-search and validation set.

## Example

The [complete synthetic input](#complete-example-input) supplies an unchecked YAML boundary, exact error contract, public consumer boundary, implemented patch, tests, and post-change command results.
The [complete expected output](#complete-expected-output) records a finished compatibility-preserving change rather than a plan.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/improve-type-safety/1.0.0",
  "title": "Type-safety improvement output contract",
  "description": "Validates the trust-boundary analysis, implemented narrowing patch, negative cases, before-and-after inventory, validation, compatibility, limitations, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "type-safety-change-record.md",
        "audience": "Repository maintainers and type-system reviewers",
        "requires_title": true,
        "required_headings": [
          "Status and scope",
          "Baseline facts",
          "Boundary analysis",
          "Implemented boundary-narrowing patch",
          "Added behavior and negative cases",
          "Before-and-after safety inventory",
          "Validation record",
          "Compatibility and approval disposition",
          "Recommendation",
          "Residual uncertainty and limitations",
          "Traceability"
        ],
        "required_literals": [
          "| Construct or boundary | Before | After | Disposition |",
          "| Check | Baseline | Post-change | Result | Evidence |",
          "| Material claim or decision | Evidence |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This example is synthetic and self-contained.
No external repository, package documentation, or configuration file is required to produce the expected output.

## Objective

Remove the unchecked `AppConfig` cast at the YAML parser boundary while preserving the exported signature, accepted values, no-coercion rule, validation precedence, and exact public error messages.

## Scope and constraints

- Target revision: `cc33000000000000000000000000000000000000`.
- Only `src/config.ts` and `test/config.test.ts` may remain changed.
- The exported `loadConfig(source: string): AppConfig` signature must remain unchanged.
- No dependency, YAML syntax-error behavior, new configuration field, coercion, default, or error redesign is authorized.
- Commands may be reported as executed only when an evidence item records their result.

## Evidence inventory

### E1 - Baseline boundary code and unsafe inventory

- Target path: `src/config.ts`.
- Relevant baseline code:

```ts
export interface AppConfig {
  mode: "development" | "production";
  port: number;
}

export function loadConfig(source: string): AppConfig {
  const parsed = parseYaml(source) as AppConfig;
  return parsed;
}
```

- `parseYaml(source)` has static return type `unknown`.
- Exact search command: `rg -n 'as AppConfig|as unknown as|\bany\b|@ts-ignore|@ts-expect-error|[A-Za-z0-9_]+!' src/config.ts test/config.test.ts`.
- The command returned one `as AppConfig` match and no occurrence of the `any` keyword, literal `as unknown as` sequence, identifier-adjacent exclamation pattern, `@ts-ignore`, or `@ts-expect-error` in the two scoped files.
- Establishes the exact unchecked boundary and the bounded lexical baseline for the listed patterns.

### E2 - Approved runtime contract and precedence

- `mode` must be the string `development` or `production`.
- Missing, non-string, or other `mode` values throw `Invalid configuration: mode`.
- `port` must be a number, an integer, and within 1 through 65,535 inclusive.
- Missing, non-number, fractional, or out-of-range `port` values throw `Invalid configuration: port`.
- String ports are rejected and never coerced.
- When both fields are invalid, the `mode` error is returned first.
- Additional object keys are ignored by the returned domain object.
- Establishes accepted values, invalid values, coercion, output projection, errors, and precedence.

### E3 - Baseline behavior and compiler results

- Environment: Linux x64, Node.js 22.11.0, TypeScript 5.8.2, and frozen pnpm lockfile.
- The applicable `tsconfig.json` sets `"strict": true`, including `noImplicitAny` enforcement.
- `pnpm typecheck` exited `0` on `cc33000000000000000000000000000000000000`.
- `pnpm vitest run test/config.test.ts` exited `0` with four existing tests.
- Existing tests cover one valid development value, one invalid mode, one missing port, and one out-of-range port.
- Establishes the clean compiler and behavior baseline.

### E4 - Public compatibility and consumer inventory

- Public signature: `loadConfig(source: string): AppConfig`.
- Public error strings are the two exact messages in E2.
- Known workspace consumer: `packages/config-consumer`, compiled by `pnpm --filter config-consumer typecheck`.
- The consumer imports both `loadConfig` and `AppConfig` and does not access parser internals.
- The baseline consumer command exited `0`.
- Establishes the public type, error, and known-consumer boundary.

### E5 - Scope and approval state

- The repository maintainer approves internal runtime validation and tests that preserve E2 and E4.
- No public type, accepted shape, coercion, error text, or validation-precedence change is approved.
- Changing YAML parser dependencies or behavior is outside scope.
- Establishes authorized and prohibited changes.

### E6 - Implemented boundary-narrowing patch

- The retained `src/config.ts` change is:

```ts
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toAppConfig(value: unknown): AppConfig {
  if (
    !isRecord(value) ||
    (value.mode !== "development" && value.mode !== "production")
  ) {
    throw new Error("Invalid configuration: mode");
  }

  if (
    typeof value.port !== "number" ||
    !Number.isInteger(value.port) ||
    value.port < 1 ||
    value.port > 65_535
  ) {
    throw new Error("Invalid configuration: port");
  }

  return { mode: value.mode, port: value.port };
}

export function loadConfig(source: string): AppConfig {
  const parsed: unknown = parseYaml(source);
  return toAppConfig(parsed);
}
```

- Establishes the exact implemented narrowing and validation order.

### E7 - Added contract and negative cases

- Target path: `test/config.test.ts`.
- The four baseline cases remain unchanged.
- The following twelve non-duplicate cases were added through the public `loadConfig` function.

```ts
it.each([
  ["mode: production\nport: 443", { mode: "production", port: 443 }],
  ["mode: development\nport: 1", { mode: "development", port: 1 }],
  ["mode: development\nport: 65535", { mode: "development", port: 65_535 }],
  [
    "mode: development\nport: 3000\nextra: true",
    { mode: "development", port: 3000 },
  ],
])("loads and projects a valid configuration", (source, expected) => {
  expect(loadConfig(source)).toEqual(expected);
});

it.each([
  ["null", "Invalid configuration: mode"],
  ["port: 3000", "Invalid configuration: mode"],
  ["mode: 1\nport: 3000", "Invalid configuration: mode"],
  ["mode: development\nport: 1.5", "Invalid configuration: port"],
  ["mode: development\nport: 0", "Invalid configuration: port"],
  ["mode: development\nport: 65536", "Invalid configuration: port"],
  ["mode: development\nport: '3000'", "Invalid configuration: port"],
  ["mode: preview\nport: 0", "Invalid configuration: mode"],
])("rejects an invalid configuration", (source, message) => {
  expect(() => loadConfig(source)).toThrow(message);
});
```

- The scalar YAML root `null` expects `Invalid configuration: mode`, which exercises the non-record branch.
- Port `65_536` expects `Invalid configuration: port`, which exercises the first value above the inclusive upper bound.
- The both-invalid case expects `Invalid configuration: mode`.
- The extra-key case returns only `{ mode, port }`.
- Establishes exact new coverage for E2 without coupling to the private helper.

### E8 - Post-change validation and unsafe residue

- `pnpm typecheck` exited `0` after E6 and E7.
- `pnpm vitest run test/config.test.ts` exited `0` with 16 tests.
- `pnpm --filter config-consumer typecheck` exited `0`.
- The exact E1 search command was rerun after E6 and E7 and returned no matches in the two scoped files.
- `git diff --name-only` listed only `src/config.ts` and `test/config.test.ts`.
- The emitted public declaration for `loadConfig` and `AppConfig` is textually unchanged from E4.
- Establishes compiler, behavior, consumer, bounded lexical-search, scope, and declaration results.

### E9 - Result matrix and remaining limits

- Valid development, production, lower-bound port, upper-bound port, and extra-key cases returned the E2 domain object.
- The non-record root and every invalid field case returned the exact E2 error, including port `65_536` and `mode` first when both fields were invalid.
- String port `"3000"` was rejected without coercion.
- YAML syntax errors occur inside `parseYaml` before `toAppConfig` and were not changed or newly tested.
- No unknown workspace-external consumer was assessed.
- Establishes observable preservation and residual uncertainty.

## Complete expected output

## Status and scope

Status: implemented and validated for the supplied synthetic revision.

The change replaces the single unchecked `as AppConfig` boundary in `src/config.ts` and adds public-boundary cases in `test/config.test.ts` [E1, E6, E7].
No other file, public signature, accepted shape, coercion rule, error text, or precedence changes [E5, E8, E9].

## Baseline facts

- `parseYaml` returns `unknown`, but baseline code asserts `AppConfig` without inspecting the runtime object [E1].
- The scoped baseline contains one `as AppConfig` and no other listed unsafe construct [E1].
- Baseline typecheck, four configuration tests, and the known workspace consumer all pass [E3, E4].
- The public boundary is `loadConfig(source: string): AppConfig` with the exact mode and port error messages in E2 [E2, E4].

## Boundary analysis

Observation: YAML parser output is untrusted `unknown` at the point where it enters typed configuration logic [E1].
Observation: the runtime contract defines exact accepted values, no string-to-number coercion, mode-before-port error precedence, and projection of only `mode` and `port` [E2].

Inference: a predicate for non-null records followed by ordered field validation can establish `AppConfig` without widening the public type or changing behavior.
This inference is tested by the negative, precedence, projection, declaration, and consumer results in E7 through E9.

## Implemented boundary-narrowing patch

Target: `src/config.ts`.

```ts
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toAppConfig(value: unknown): AppConfig {
  if (
    !isRecord(value) ||
    (value.mode !== "development" && value.mode !== "production")
  ) {
    throw new Error("Invalid configuration: mode");
  }

  if (
    typeof value.port !== "number" ||
    !Number.isInteger(value.port) ||
    value.port < 1 ||
    value.port > 65_535
  ) {
    throw new Error("Invalid configuration: port");
  }

  return { mode: value.mode, port: value.port };
}

export function loadConfig(source: string): AppConfig {
  const parsed: unknown = parseYaml(source);
  return toAppConfig(parsed);
}
```

This is the retained implementation recorded in E6.
It validates mode before port, performs no coercion, and returns only contract fields [E2, E6].

## Added behavior and negative cases

Target: `test/config.test.ts`.

```ts
it.each([
  ["mode: production\nport: 443", { mode: "production", port: 443 }],
  ["mode: development\nport: 1", { mode: "development", port: 1 }],
  ["mode: development\nport: 65535", { mode: "development", port: 65_535 }],
  [
    "mode: development\nport: 3000\nextra: true",
    { mode: "development", port: 3000 },
  ],
])("loads and projects a valid configuration", (source, expected) => {
  expect(loadConfig(source)).toEqual(expected);
});

it.each([
  ["null", "Invalid configuration: mode"],
  ["port: 3000", "Invalid configuration: mode"],
  ["mode: 1\nport: 3000", "Invalid configuration: mode"],
  ["mode: development\nport: 1.5", "Invalid configuration: port"],
  ["mode: development\nport: 0", "Invalid configuration: port"],
  ["mode: development\nport: 65536", "Invalid configuration: port"],
  ["mode: development\nport: '3000'", "Invalid configuration: port"],
  ["mode: preview\nport: 0", "Invalid configuration: mode"],
])("rejects an invalid configuration", (source, message) => {
  expect(() => loadConfig(source)).toThrow(message);
});
```

These twelve non-duplicate additions preserve the four baseline cases and call `loadConfig` rather than the private validation helper [E3, E7].

The scalar YAML root `null` expects `Invalid configuration: mode`, which exercises the non-record guard through the public boundary [E2, E7].
Port `65_536` expects `Invalid configuration: port`, which protects the first value above the inclusive upper bound [E2, E7].
The simultaneous-invalid case expects `Invalid configuration: mode`, which protects the approved precedence [E2, E7].
The string-port case expects `Invalid configuration: port`, which protects the no-coercion rule [E2, E7].

## Before-and-after safety inventory

| Construct or boundary | Before | After | Disposition |
| --- | ---: | ---: | --- |
| `as AppConfig` | 1 | 0 | Replaced by runtime narrowing |
| Explicit `any` keyword in scoped files | 0 | 0 | No occurrence in the exact scoped search |
| Compiler-reported implicit `any` in scoped files | 0 | 0 | `strict` typecheck remained passing |
| Literal `as unknown as` sequence | 0 | 0 | No occurrence in the exact scoped search |
| Identifier-adjacent exclamation pattern | 0 | 0 | No occurrence in the exact scoped search |
| `@ts-ignore` or `@ts-expect-error` | 0 | 0 | No occurrence in the exact scoped search |
| Untrusted parser result | Asserted as domain type | Typed `unknown`, then validated | Boundary hardened |

Sources: E1, E3, and E8.

## Validation record

| Check | Baseline | Post-change | Result | Evidence |
| --- | --- | --- | --- | --- |
| `pnpm typecheck` | Exit `0` | Exit `0` | Pass | E3, E8 |
| `pnpm vitest run test/config.test.ts` | Exit `0`, 4 tests | Exit `0`, 16 tests | Pass | E3, E8 |
| `pnpm --filter config-consumer typecheck` | Exit `0` | Exit `0` | Pass | E4, E8 |
| Exact scoped `rg` unsafe search from E1 | One `as AppConfig` | No matches | Target removed without substitution | E1, E8 |
| Public declaration comparison | Recorded signature | Textually unchanged | Compatible for known declaration | E4, E8 |
| Final file scope | Not applicable | Two approved files | Pass | E5, E8 |

The result matrix confirms a rejected non-record root, both numeric bounds, rejection immediately above the upper bound, exact invalid errors, mode-first precedence, no string coercion, and extra-key projection [E9].
The reproducible search command is `rg -n 'as AppConfig|as unknown as|\bany\b|@ts-ignore|@ts-expect-error|[A-Za-z0-9_]+!' src/config.ts test/config.test.ts` [E1, E8].

## Compatibility and approval disposition

The exported `loadConfig(source: string): AppConfig` signature and `AppConfig` declaration remain unchanged [E4, E8].
The known workspace consumer still typechecks [E8].
The repository maintainer approved internal validation and tests within the two named files [E5].

No approval for a public type, accepted shape, coercion, error, or precedence change was used because none is present in the recorded result [E5, E8, E9].

## Recommendation

Recommend the two-file change for maintainer review because it removes the unchecked parser assertion, preserves the attributable runtime and public contracts, and passes compiler, behavior, negative-case, consumer, residue, and scope checks.
Future boundaries should reuse the same principle of treating parser output as `unknown`, but this evidence does not authorize a repository-wide rewrite.

## Residual uncertainty and limitations

YAML syntax errors occur before the new validation function and were not newly tested or redesigned [E9].
Only the known workspace consumer was checked, so unknown external consumers remain outside the evidence boundary [E4, E9].
The example covers a flat object with two fields and does not establish nested schema behavior.

## Traceability

| Material claim or decision | Evidence |
| --- | --- |
| Baseline code and unsafe inventory | E1 |
| Runtime shapes, errors, coercion, and precedence | E2 |
| Baseline compiler and behavior state | E3 |
| Public declaration and consumer boundary | E4 |
| Authorized paths and prohibited contract changes | E5 |
| Exact retained narrowing implementation | E6 |
| Added public-boundary cases | E7 |
| Post-change compiler, tests, consumer, search, declaration, and scope | E8 |
| Behavior preservation and residual uncertainty | E9 |
