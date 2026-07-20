---
title: "Harden an untrusted TypeScript boundary"
description: "Replace unchecked type assumptions at an untrusted TypeScript boundary with runtime narrowing and verified state models, keeping documented public behavior and compatibility intact."
---

# Harden an untrusted TypeScript boundary

## Objective

Start from an inventory of unsafe TypeScript assumptions, the casts and assertions that paper over what the compiler cannot see.
End with explicit narrowing at the boundary, state models that replace those assumptions, and a before-and-after validation record.
One constraint outranks all others: runtime inputs, public signatures, accepted values, error precedence, and observable behavior stay unchanged unless a change is separately approved.

## When to use

- A value from an untrusted parser, network response, storage record, environment value, or message payload is cast straight to a domain type.
- Broad unions, nullable fields, or unchecked indexing let the code represent internal states that should be impossible.
- A compiler suppression or assertion is hiding a runtime invariant that could instead be validated or modeled.
- Public type declarations disagree with a documented runtime contract, and the fix needs to be a bounded, compatibility-preserving correction.

## When not to use

- You cannot observe or establish the runtime shapes, accepted values, and error behavior from attributable evidence.
- What is actually wanted is a new public contract or new behavior, not a compatibility-preserving safety change.
- The target has no meaningful static boundary, or the unsafe value never crosses into typed domain logic.
- Compiler or behavior failures already exist without a known bound, so a before-and-after result could not be attributed to your scoped change.

## Required inputs

- **Immutable unsafe-construct inventory:** Pin the target revision, then record the named files and symbols along with every cast, broad type, non-null assertion, suppression, unchecked access, and compiler diagnostic.
  This inventory is your remediation scope, nothing more and nothing less.
  Validate it with reproducible searches and compiler output, and review each hit so that comments and generated files are excluded.
- **Runtime input and error contract:** Write down which shapes are accepted, which are invalid, the coercion rules, value ranges, missing-field behavior, the error messages or codes, and the precedence when several fields are invalid at once.
  Without this, a type cleanup can silently change runtime behavior, which is exactly what this recipe must not do.
  Validate the contract against schemas, tests, public documentation, or an authorized owner decision.
- **Public compatibility boundary and consumer inventory:** List the exported function signatures, the declaration output, the downstream packages or call sites, and the compatibility constraints.
  This is how you know which type changes need approval or a migration.
  Validate the consumers at the immutable revision, and say so plainly when the inventory is incomplete.
- **Baseline commands and results:** Supply the exact typecheck, behavior-test, negative-case, declaration or consumer check, and unsafe-search commands, together with the environment, exit codes, and retained output.
  This baseline is what lets you separate pre-existing conditions from your change.
  Validate it from a clean checkout, or label it as supplied but not rerun.

## Optional inputs

- An authoritative runtime schema can become the single parser source, once you have compared its accepted and rejected shapes against the contract.
- Sanitized fixtures from the real boundary can reveal shapes the documentation never mentions, without exposing secrets or personal data.
- A third-party declaration source, paired with a minimized runtime observation, can justify a narrow local augmentation.
- Compiler strictness diagnostics can help you prioritize follow-up work that sits outside the current boundary.

## Preconditions

- The target revision and named source paths resolve, and generated files are excluded from manual edits.
- Accepted inputs, rejected inputs, coercion policy, error behavior, and error precedence can all be attributed to evidence.
- Baseline typecheck and scoped behavior tests have recorded outcomes.
- Public signatures and known consumers are listed before implementation starts.
- The allowed file scope and any owner approvals are explicit.

## Workflow

### 1. Freeze scope and baseline

Record the immutable revision, the target symbols, the public signatures, the consumer list, the commands, and the initial unsafe-search results.
Then classify each hit: boundary risk, impossible-state risk, justified invariant, generated code, or false positive.
Move on when every targeted construct has a location and a risk statement.
Stop if the inventory mixes unrelated modules or if baseline failures have no known bound.

### 2. Model the runtime contract

Build a table of inputs and their exact outputs or errors: accepted, rejected, missing, null, malformed, out-of-range, and multiple-invalid.
Record the coercion rules and the validation precedence alongside it.
Move on when every branch in the planned narrowing has an expected result you can attribute to evidence.
Stop if a proposed branch would require inventing behavior.

### 3. Identify trust boundaries and invariants

Trace each value from its untrusted origin, through parsing, to the point of domain use.
Treat it as `unknown` at the boundary until a schema, predicate, or constructor establishes the domain type.
For each internal assertion, write down the invariant and the code path that enforces it.
Move on when every target has either a runtime validation point or a proved internal invariant.
Stop when you hit an assertion whose invariant cannot be observed.

### 4. Design the narrowest model

Pick whatever the contract calls for: discriminated unions, exact object checks, predicates, exhaustive switches, branded constructors, or a local declaration augmentation.
Preserve the accepted values and the error order, and do not introduce coercion that the baseline does not already have.
Move on when the model represents every valid state and rejects only states the contract itself marks invalid.
Stop if a public type or an accepted runtime shape would have to change without approval.

### 5. Implement incrementally

Remove one unsafe assumption at a time, at a named path, adding only the minimum runtime validation or state model it needs.
Run the focused typecheck and the behavior cases after each logical change.
Move on when the unsafe construct is gone and observable results still match the baseline.
Stop and revert the logical change if an error message, an accepted value, a public declaration, or a consumer result changes unexpectedly.

### 6. Add negative and precedence tests

Add cases straight from the contract: missing fields, malformed values, out-of-range values, inputs that must not be coerced, and inputs where several fields are invalid at once.
Make each case exercise the public boundary, not the helper implementation behind it.
Move on when every new validation branch has an observable case and the intended error precedence is protected.
Stop if a test would encode behavior that has no attributable source.

### 7. Validate compatibility and unsafe residue

Run the typecheck, the focused behavior tests, the declaration or consumer checks, and scoped searches for the targeted casts, `any`, double casts, non-null assertions, and suppressions.
Compare the exported signatures and the public errors with the baseline.
Move on when the commands pass, the targeted hits are removed or justified, and the final diff stays in scope.
Stop if any public or runtime contract difference appears without approval.

### 8. Deliver the change record

Report the baseline facts, the trust-boundary analysis, the named patch, the test additions, the before-and-after unsafe inventory, the command results, the compatibility outcome, the approvals, the assumptions, and the residual uncertainty.
Keep observed runtime evidence clearly separate from inferred invariants and recommendations.
The record is complete when every result and every compatibility claim can be traced to its evidence.

## Decision points

- If a value originates from parsing, I/O, storage, the environment, or an external API, treat it as `unknown` and narrow it before any domain use.
- If an assertion rests on an invariant you cannot trace to validation or construction, replace the assertion with validation or stop until contract evidence exists.
- If the narrowing would accept a previously rejected value through coercion, reject that design unless the runtime contract explicitly authorizes the coercion.
- If two fields are invalid and the baseline defines an error precedence, validate them in that order and protect the order with a regression case.
- If a public type or an accepted runtime shape must change, pause and obtain maintainer approval along with a consumer migration plan.
- If a third-party declaration contradicts observed runtime values, add the narrowest local augmentation and do so only with a sanitized fixture, a runtime test, and the upstream source.
- If the typecheck passes but a behavior or consumer check changes, treat the change as incompatible and either revert or obtain approval.

## Safety guardrails

- **Introducing explicit or implicit any** is forbidden anywhere, whether in the target, its helpers, the fixtures, or the public declarations.
- **Using double casts non-null assertions or suppression comments to hide uncertainty** from the compiler is forbidden as well.
- **Changing runtime behavior silently** is forbidden too, and that covers accepted shapes, coercion, validation order, and public errors.
- Parse untrusted values as `unknown` and validate them before logging or any domain use.
- Do not log raw parser, request, configuration, storage, or message payloads, since they may contain secrets.
- Keep every change inside the approved file and consumer scope, and do not mix type hardening with unrelated refactoring.
- Stop on any unexplained behavior, declaration, or consumer difference, and restore the last verified checkpoint.

## Human approval gates

- Before **changing a public type or accepted runtime shape**, the repository maintainer approves the current contract, the consumer inventory, the proposed signature or shape, the migration plan, the compatibility tests, and the rollback.
- Before **changing documented public error behavior**, the API owner approves the old and new errors, the precedence, the user impact, the versioning disposition, and the regression tests.
- Before adding runtime coercion, the API owner confirms that the public contract already permits the coerced form and reviews the negative cases.

## Expected output

Produce one Markdown type-safety change record containing:

1. Status, the immutable revision, the approved scope, and the public compatibility boundary.
2. The baseline unsafe inventory, compiler state, behavior state, and consumer state.
3. A trust-boundary analysis that separates observed facts from inferred invariants.
4. The implemented boundary-narrowing patch at named paths, with the relevant code or diff.
5. The added negative and error-precedence tests at named paths.
6. The before-and-after unsafe-construct and compatibility report.
7. A typecheck, behavior, negative-case, unsafe-search, and consumer validation record, with commands and exit codes.
8. The approval disposition, assumptions, limitations, residual risk, and evidence traceability.

Any unexecuted change or command must be labeled as proposed, never included in a completed result.

## Completion criteria

- Every targeted unsafe construct is either removed or retained with a documented, enforceable runtime invariant.
- Every untrusted value is narrowed before it becomes a domain object.
- Accepted values, rejected values, the coercion policy, the error precedence, the public signatures, and the known-consumer results all match the baseline, unless a change was approved.
- The typecheck, the focused behavior tests, the negative cases, the declaration or consumer checks, and the scoped unsafe searches all have recorded post-change results.
- No new `any`, double cast, non-null assertion, or suppression hides uncertainty.
- The final diff touches only approved paths, and every material claim cites its evidence.

## Failure modes

- **F1:** You cannot establish the runtime input shape, the coercion policy, or the error precedence.
- **F2:** A third-party declaration contradicts sanitized, observed runtime values.
- **F3:** The narrowing changes an accepted value, a public error, a declaration, or a consumer result.
- **F4:** The targeted unsafe construct disappears, but a new cast, `any`, assertion, or suppression takes its place.

## Recovery procedure

- **R1:** Stop implementing, collect authoritative contract evidence or sanitized fixtures, obtain an owner disposition where one is needed, and restart the contract modeling.
- **R2:** Minimize the mismatch, add a runtime test, document the upstream declaration source, and use a narrow local augmentation only after maintainer review.
- **R3:** Revert to the last behavior-compatible checkpoint, compare the exact before-and-after outputs, and redesign the validation so it preserves the established contract.
- **R4:** Reject the substitution, return the boundary value to `unknown`, add explicit narrowing, and rerun the complete unsafe-search and validation set.

## Example

The [complete synthetic input](#complete-example-input) supplies an unchecked YAML boundary with its exact error contract, a public consumer boundary, the implemented patch, the tests, and the post-change command results.
The [complete expected output](#complete-expected-output) records a finished, compatibility-preserving change, not a plan.

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
