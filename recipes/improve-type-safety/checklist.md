# Harden an untrusted TypeScript boundary checklist

## Unsafe inventory and contract

- [ ] The immutable revision, target files, symbols, and generated-file exclusions are recorded.
- [ ] Casts, `any`, non-null assertions, suppressions, broad unions, and unchecked access are inventoried with reproducible searches.
- [ ] Each inventory hit is classified as a boundary risk, impossible-state risk, justified invariant, generated code, or false positive.
- [ ] Accepted, rejected, missing, null, malformed, and out-of-range inputs have attributable outcomes.
- [ ] Coercion policy and precedence for multiple invalid fields are explicit.
- [ ] Public signatures and all known consumers are recorded before editing.

## Boundary and model design

- [ ] Every parser, I/O, storage, environment, or external API value enters the target model as `unknown`.
- [ ] Runtime narrowing occurs before domain use, persistence, or sensitive logging.
- [ ] The chosen predicate, schema, constructor, or union represents every contract-valid state.
- [ ] Every rejected branch corresponds to a documented invalid state.
- [ ] Internal assertions cite the constructor or control flow that enforces their invariant.
- [ ] No unapproved coercion, default, or error-order change is introduced.

## Implementation and tests

- [ ] Each logical patch removes one named unsafe assumption and stays within approved paths.
- [ ] Negative cases cover the root-value guard, missing fields, malformed fields, both sides of numeric ranges, no-coercion, and precedence behavior where applicable.
- [ ] Tests exercise the public boundary rather than private helper calls.
- [ ] Public type or error changes have their required owner approval and migration evidence.
- [ ] Raw untrusted payloads and secrets never appear in diagnostics or fixtures.

## Validation and delivery

- [ ] Typecheck has a recorded post-change command, environment, and exit code.
- [ ] Focused behavior and negative-case tests have recorded results.
- [ ] Declaration output or known-consumer checks match the baseline.
- [ ] Scoped searches show no replacement `any`, double cast, non-null assertion, or suppression.
- [ ] Public signatures, accepted inputs, rejected inputs, error text, and precedence are compared with baseline.
- [ ] The final diff contains only approved source and test paths.
- [ ] Facts, inferred invariants, approvals, limitations, and residual risks are separated.
- [ ] The final artifact satisfies every completion criterion.
