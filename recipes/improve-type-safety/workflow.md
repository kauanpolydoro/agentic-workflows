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

The [complete synthetic input](examples/input.md) supplies an unchecked YAML boundary, exact error contract, public consumer boundary, implemented patch, tests, and post-change command results.
The [complete expected output](examples/expected-output.md) records a finished compatibility-preserving change rather than a plan.
