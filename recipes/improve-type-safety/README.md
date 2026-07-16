# Harden an untrusted TypeScript boundary

Use this recipe to replace unchecked casts and impossible states with explicit runtime narrowing while preserving documented behavior and public compatibility.
It is intended for TypeScript maintainers working on one bounded trust boundary, with an approximate duration of one hour when the runtime contract is already known.

## Primary use cases

- Validate parser, network, storage, environment, or message data before domain use.
- Replace unchecked casts, non-null assertions, suppressions, or broad states with an enforceable model.
- Protect accepted values, rejection behavior, coercion rules, and error precedence while strengthening compile-time guarantees.
- Correct a third-party declaration mismatch through a narrow, tested local augmentation.

## When not to use

- Runtime shapes or public error behavior cannot be established.
- The real objective is to redesign the public contract rather than preserve it.
- Existing compiler or behavior failures are too broad to attribute to the target change.
- The selected code has no untrusted or statically meaningful boundary.

## Required evidence

- Immutable target revision, exact files and symbols, and reproducible unsafe-construct inventory.
- Accepted, rejected, non-object root, missing, malformed, boundary, out-of-range, coercion, and error-precedence behavior.
- Exported signatures, declaration output, known consumers, and compatibility constraints.
- Baseline typecheck, focused behavior, negative-case, consumer, and unsafe-search commands with results.

## Produced artifacts

- An implemented boundary-narrowing patch at named paths.
- Negative and precedence tests tied to the public runtime contract.
- A before-and-after unsafe inventory and public-compatibility report.
- Typecheck, behavior, negative-case, consumer, and unsafe-search validation evidence.

## Primary risks

- Satisfying the compiler with a wider cast, `any`, suppression, or non-null assertion.
- Adding coercion or changing validation order while claiming behavior preservation.
- Breaking public declarations or downstream consumers through a narrower type.
- Logging an untrusted payload that contains credentials or personal data.

## How to use this recipe

1. Confirm the attributable runtime contract, consumer inventory, and preconditions in [workflow.md](workflow.md).
2. Inventory unsafe constructs and trace each value from its trust boundary to domain use.
3. Model valid states and implement one compatibility-preserving narrowing change at a time.
4. Add public-boundary negative and precedence tests, then run compiler, behavior, consumer, and residue checks.
5. Use [checklist.md](checklist.md) to control hidden coercion, error, scope, and validation changes.
6. Compare the result with the [synthetic input](examples/input.md) and [complete change record](examples/expected-output.md).

## Files

- [recipe.yml](recipe.yml) declares catalog metadata, inputs, outputs, effects, safety constraints, agent requirements, bundle compatibility, capability status, and source verification states.
- [workflow.md](workflow.md) is the canonical contract-modeling, narrowing, testing, and compatibility procedure.
- [checklist.md](checklist.md) controls unsafe inventory, runtime behavior, public compatibility, and validation omissions.
- [output.schema.json](output.schema.json) defines the machine-readable contract for the delivered artifact set.
- [examples/input.md](examples/input.md) contains a complete synthetic YAML-boundary evidence package and executed results.
- [examples/expected-output.md](examples/expected-output.md) is a finished type-safety change report derived only from that package.

## Verification status

Structural status is `derived` from the current recipe files and validator rules.
Installation status is `untested` because no retained installation evidence is supplied.
External-agent execution status is `untested` because no retained agent run is supplied.
Outcome status is `untested` because no retained outcome-review artifact is supplied.
Bundle compatibility records source-level representability for an adapter, while capability status records whether a target agent's required capabilities were assessed.
Bundle compatibility, capability status, export, installation, execution, and outcome are separate dimensions, and none proves another.

## Limitations

This recipe improves one evidence-backed boundary and does not justify a repository-wide strictness migration.
Compiler success does not prove runtime safety without the supplied behavior and negative-case checks.
The synthetic example covers a flat YAML object and does not establish third-party declaration or nested-schema behavior.

See the repository [recipe quality standard](../../docs/quality/recipe-quality-standard.md) and [adapter source record](../../docs/research/adapter-sources.md).
