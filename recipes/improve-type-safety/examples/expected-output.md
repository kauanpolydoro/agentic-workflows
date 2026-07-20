# Type-safety change record: YAML configuration boundary

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
