# Review an API contract change

## Objective

Take the released contract and the proposed one, both immutable, together with implementation behavior, any supplied runtime observations, client evidence, and the versioning policy.
Turn them into a bidirectional compatibility report, a finding register, and a rollout decision.
The primary quality constraint is traceability: every wire-level difference and every client-impact claim must be traced, never assumed from a generated schema's picture of runtime behavior or from guesses about unknown consumers.

## When to use

- An HTTP, event, or library contract will change before release.
- Producer and consumer teams need a decision on compatibility and deprecation.
- A deprecated field or version is approaching removal, and the decision needs evidence of retained usage and of its owners.

## When not to use

- The previous contract or the proposed contract is unavailable.
- Runtime behavior cannot be reconciled with generated schemas.
- The change is an internal refactor with no observable contract effect.
- Required client evidence or approval is absent, and the request is to ship or remove behavior immediately anyway.

## Required inputs

- **Immutable released and proposed wire contracts with protocol revisions:** Supply the complete OpenAPI, AsyncAPI, protobuf, event schema, or library signature artifacts, plus immutable identifiers for the released and candidate revisions.
  This evidence defines what the contract declares: requests, responses, errors, headers, content types, nullability, defaults, and version selection.
  Parse both artifacts, and confirm their provenance and completeness for the surface under review.
- **Handler, serializer, default, error, and routing behavior evidence:** Supply the exact implementation diffs for every changed contract element, including runtime-only defaults and error mapping.
  When deployed or local runtime behavior is part of the requested conclusion, also supply executed response observations.
  Source evidence establishes what the code implements; retained execution results are what establish observed runtime behavior.
  Map each changed implementation branch to a contract element, label unexecuted behavior as implementation-derived, and stop if material behavior remains undocumented.
- **Applicable compatibility, deprecation, and severity policy:** Supply the producer and consumer compatibility rules, the minimum notice or support window, the removal conditions, and the release disposition for each severity.
  This is what turns raw wire differences into decisions a reviewer can act on.
  Confirm the policy version and the API surface it applies to.

## Optional inputs

- **Known-client parser contract inventory, ownership, and contract-test results:** For each identified consumer, this replaces assumptions with the exact accepted content types, fields, nullability, and versions, while keeping declared parser behavior separate from an executed failure.
- **Sanitized usage metrics:** These establish field or version use, but only when the aggregation, retention, and privacy controls behind them are documented.
- **Rollout capability and rollback evidence:** This constrains recommendations to the routing, version, feature-flag, or deployment mechanisms that actually exist, so the plan never leans on infrastructure you do not have.

## Preconditions

- Old and new contract snapshots are immutable and parseable.
- The transport protocol and the compatibility policy are known.
- Proposed runtime behavior is mapped to the candidate contract.
- Sensitive payload examples are sanitized.
- Shipping and removal decisions can name the API owner, the affected client owners, and the release manager.

## Workflow

1. **Freeze the comparison boundary.**
   Record the released and candidate artifact identifiers, the protocol version, the API surface, the implementation revision, the applicable policies, and any exclusions.
   Parse both contract artifacts and inventory every operation or message under review.
   Advance only when provenance and syntax both pass; otherwise stop under F1.
2. **Build the wire-difference ledger.**
   Compare methods or topics, version selectors, status codes, content types, fields, requiredness, nullability, defaults, numeric ranges, enums, headers, ordering, pagination, idempotency, and errors.
   Record unchanged elements too, wherever you need them to interpret a difference.
   Advance when every contract delta has a stable identifier and no generated-only noise is left unexplained.
3. **Reconcile implementation and observed runtime behavior.**
   Trace each ledger item through handlers, validators, serializers, error mapping, defaults, and routing.
   Keep implementation-derived behavior separate from observed responses, and state whether each source matches released behavior, candidate behavior, both, or neither.
   Do not describe a client or server runtime failure as observed unless a retained execution result establishes it.
   Stop under F2 when the candidate contract and the implementation disagree.
4. **Classify producer compatibility.**
   For every delta, determine whether the new producer can accept old requests and emit an old-compatible response.
   Treat changed defaults and error formats as wire behavior, even when the success schema is unchanged.
   Cite contract and implementation evidence for each classification.
5. **Classify consumer compatibility.**
   Map every known client parser, version selector, field assumption, and owner onto the ledger.
   Record contract-level incompatibility separately from executed parser results and from inferred runtime impact, and keep unlisted consumers marked unknown.
   Do not infer acceptance from permissive schema generation without parser evidence; a schema that tolerates a shape is not proof that a parser does.
6. **Validate both directions.**
   Evaluate the supplied producer contract tests and representative client parsing tests against both the released and candidate forms.
   For every executed check, identify the command, revision, fixture, and result.
   Label missing checks as proposed, and keep the classifications they affect unverified.
7. **Choose a supported compatibility path.**
   Apply the supplied policy and the available routing mechanisms to choose among in-place compatibility, an additive transition, an explicit version, a deprecation window, or rejection of the change.
   Identify the client migrations, owner roles, notice, exit evidence, and how long old behavior is retained.
   Do not recommend per-client routing when only version-level routing exists.
   When clients select an explicit version path, require each affected client owner to approve and verify that adoption; gateway routing on its own does not make a client cohort.
8. **Design rollout, observation, and rollback.**
   Record baseline metrics, privacy-safe signals, abort thresholds, the observation window, the traffic steps, and the exact supported boundary for rollback.
   Cover every material contract change with an approved signal and threshold, or keep traffic to the uncovered change blocked.
   Retain old behavior until the client and observation gates pass.
9. **Package and approve the decision.**
   Deliver the compatibility matrix, the finding and client-impact registers, verification, the versioning or deprecation plan, monitoring, rollback, assumptions, limitations, and traceability.
   Obtain API-owner and affected-client approval before a breaking shipment, and API-owner approval before removing deprecated behavior.

## Decision points

- If the prior wire contract cannot be recovered, stop compatibility approval and reconstruct it from released artifacts or tests.
- If the candidate implementation or a retained runtime observation contradicts the proposed contract, correct whichever source of truth is inconsistent and rerun the entire wire comparison before approval.
- If a known client rejects the new shape, classify the change as breaking for that client and require a compatibility path.
- If client ownership is unknown, preserve the old behavior while you collect privacy-safe usage evidence.
- If a proposed routing strategy is unavailable in the supplied gateway or deployment capability, reject that strategy and choose a supported version or deployment boundary.
- If a client has not adopted the selected version path, keep that client on the released path and do not count it as migrated just because the new route exists.
- If a material contract change lacks a privacy-safe monitoring signal, baseline, or abort threshold, keep traffic to that behavior blocked until those controls are approved.
- If the deprecation window or the zero-use evidence is incomplete, keep the deprecated field or version available.
- If monitoring would require retaining response bodies, personal data, or internal errors, redesign the signal before rollout.

## Safety guardrails

- Do not expose internal errors in public API responses.
- Do not assume generated schemas represent runtime defaults or error behavior.
- Do not include personal data or internal stack details in contract examples.
- Do not silently change defaults, error shapes, or nullability.
- Do not log or retain request or response bodies merely to infer client compatibility.
- Keep rollout and rollback within the documented version, gateway, deployment, or feature-flag capabilities.
- Do not describe a release cohort unless the supplied routing or client-selection evidence establishes how that cohort is selected.
- Preserve the released contract artifact and the old handler until the migration and observation gates pass.
- Stop a removal when the deprecation window or the client evidence is incomplete.

## Human approval gates

- Before shipping a breaking change, the API owner and every identified affected client owner approve the wire-difference evidence, migration instructions, support window, verification results, rollout, and rollback; the release manager then approves the traffic changes.
- Before removing a deprecated field, the API owner approves the completed notice, the elapsed deprecation window, the privacy-safe zero-use evidence, the client-owner dispositions, and the rollback boundary.

## Expected output

- **Bidirectional API compatibility report and finding register:** Every wire difference carries its old and new forms, producer and consumer classifications, evidence, impact, severity, confidence, recommendation, verification, and disposition.
- **Observed and unknown client-impact register:** Each client entry records the version, owner role, parser assumption, migration status, and evidence source, and the register states the unknown-consumer limitation explicitly.
- **Versioning, deprecation, rollout, monitoring, and rollback plan:** The supported routing mechanism, client path-adoption steps, dependencies, owners, notice and observation windows, objective exit criteria, per-change privacy-safe signals, abort thresholds, approvals, assumptions, and limitations.

The artifact must keep observations, inferences, recommendations, executed checks, proposed checks, assumptions, limitations, and next actions distinct from one another.
Material claims must cite example evidence IDs.

## Completion criteria

- Every wire-level difference is classified in both the producer and consumer directions.
- Known clients are identified, and unknown ownership is stated explicitly.
- Candidate implementation and contract behavior agree for every changed element, and any claimed runtime equivalence has a retained observation; otherwise runtime remains explicitly unverified.
- Recommendations cite contract, implementation, client, policy, test, and rollout-capability evidence as applicable.
- Executed and proposed tests are clearly separated, and any classification without a result stays unverified.
- Contract incompatibilities, implementation-derived behavior, inferred runtime impact, and observed runtime failures are labeled separately.
- Every material changed behavior has an approved monitoring signal and threshold, or its rollout remains explicitly blocked.
- Breaking changes have an approved compatibility or versioning path before they ship.
- Deprecated behavior is retained until the notice, usage, client, and approval gates pass.

## Failure modes

- **F1:** The previous contract is unavailable.
- **F2:** The candidate implementation or retained runtime behavior contradicts the proposed schema.
- **F3:** Client ownership or usage is unknown.
- **F4:** The selected rollout or rollback mechanism does not exist.

## Recovery procedure

- **R1:** Recover the released schema, examples, and version selector from immutable release artifacts or retained tests, verify their provenance, and restart at workflow step 1.
- **R2:** Halt approval, verify the provenance and environment of any retained response observation, and decide with the API owner whether the contract, the implementation, or the observation boundary is the incorrect one.
  Align the authoritative artifacts, then restart at workflow step 2 before rerunning the producer and consumer contract tests.
- **R3:** Preserve the old behavior, assign an owner-discovery action, collect approved privacy-safe evidence of version or field use, and resume at workflow step 5 while keeping unknown consumers explicit.
- **R4:** Reject the unsupported strategy, inventory the actual version, gateway, deployment, and feature-flag boundaries, then restart at workflow step 7 with a mechanism that has retained rollback evidence.

## Example

The complete synthetic example is in [examples/input.md](examples/input.md), and its complete artifact is in [examples/expected-output.md](examples/expected-output.md).
It demonstrates evidence traceability without relying on external sources.
