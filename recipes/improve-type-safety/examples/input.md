# Synthetic YAML configuration boundary evidence package

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
