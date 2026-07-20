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

The [complete synthetic input](examples/input.md) supplies an unchecked YAML boundary with its exact error contract, a public consumer boundary, the implemented patch, the tests, and the post-change command results.
The [complete expected output](examples/expected-output.md) records a finished, compatibility-preserving change, not a plan.
