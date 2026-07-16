# Review an API contract change

## Objective

Transform immutable released and proposed contracts, implementation behavior, supplied runtime observations, client evidence, and versioning policy into a bidirectional compatibility report, finding register, and rollout decision.
The primary quality constraint is that every wire-level difference and client-impact claim must be traced without assuming generated schemas describe runtime behavior or unknown consumers.

## When to use

- An HTTP, event, or library contract will change before release.
- Producer and consumer teams need a compatibility and deprecation decision.
- A deprecated field or version is approaching removal and needs retained usage and owner evidence.

## When not to use

- The previous contract or proposed contract is unavailable.
- Runtime behavior cannot be reconciled with generated schemas.
- The change is an internal refactor with no observable contract effect.
- Required client evidence or approval is absent and the request is to ship or remove behavior immediately.

## Required inputs

- **Immutable released and proposed wire contracts with protocol revisions:** Supply complete OpenAPI, AsyncAPI, protobuf, event schema, or library signature artifacts plus immutable release and candidate identifiers.
  This evidence defines declared requests, responses, errors, headers, content types, nullability, defaults, and version selection.
  Parse both artifacts and confirm their provenance and completeness for the reviewed surface.
- **Handler, serializer, default, error, and routing behavior evidence:** Supply exact implementation diffs for every changed contract element, including runtime-only defaults and error mapping, plus executed response observations when deployed or local runtime behavior is part of the requested conclusion.
  Source evidence establishes implemented behavior, while retained execution results establish observed runtime behavior.
  Map each changed implementation branch to a contract element, label unexecuted behavior as implementation-derived, and stop if material behavior remains undocumented.
- **Applicable compatibility, deprecation, and severity policy:** Supply producer and consumer compatibility rules, minimum notice or support window, removal conditions, and release disposition by severity.
  This evidence turns wire differences into reviewable decisions.
  Confirm the policy version and API surface to which it applies.

## Optional inputs

- **Known-client parser contract inventory, ownership, and contract-test results:** Replaces assumptions with exact accepted content types, fields, nullability, and versions for identified consumers while keeping declared parser behavior separate from an executed failure.
- **Sanitized usage metrics:** Establish field or version use only when aggregation, retention, and privacy controls are documented.
- **Rollout capability and rollback evidence:** Constrains recommendations to routing, version, feature-flag, or deployment mechanisms that actually exist.

## Preconditions

- Old and new contract snapshots are immutable and parseable.
- The transport protocol and compatibility policy are known.
- Proposed runtime behavior is mapped to the candidate contract.
- Sensitive payload examples are sanitized.
- Shipping and removal decisions can identify the API owner, affected client owners, and release manager.

## Workflow

1. **Freeze the comparison boundary.**
   Record released and candidate artifact identifiers, protocol version, API surface, implementation revision, applicable policies, and exclusions.
   Parse both contract artifacts and inventory all reviewed operations or messages.
   Advance only when provenance and syntax pass; otherwise stop under F1.
2. **Create the wire-difference ledger.**
   Compare methods or topics, version selectors, status codes, content types, fields, requiredness, nullability, defaults, numeric ranges, enums, headers, ordering, pagination, idempotency, and errors.
   Record unchanged elements needed to interpret each difference.
   Advance when every contract delta has a stable identifier and no generated-only noise remains unexplained.
3. **Reconcile implementation and observed runtime behavior.**
   Trace each ledger item through handlers, validators, serializers, error mapping, defaults, and routing.
   Record implementation-derived behavior separately from observed responses and state whether each source matches released behavior, candidate behavior, both, or neither.
   Do not describe a client or server runtime failure as observed unless a retained execution result establishes it.
   Stop under F2 when the candidate contract and implementation disagree.
4. **Classify producer compatibility.**
   Determine whether the new producer can accept old requests and emit an old-compatible response for every delta.
   Treat changed defaults and error formats as wire behavior even when the success schema is unchanged.
   Cite contract and implementation evidence for each classification.
5. **Classify consumer compatibility.**
   Map every known client parser, version selector, field assumption, and owner to the ledger.
   Record contract-level incompatibility separately from executed parser results and inferred runtime impact, and keep unlisted consumers unknown.
   Do not infer acceptance from permissive schema generation without parser evidence.
6. **Validate both directions.**
   Evaluate supplied producer contract tests and representative client parsing tests against released and candidate forms.
   Identify command, revision, fixture, and result for executed checks.
   Label missing checks as proposed and keep affected classifications unverified.
7. **Choose a supported compatibility path.**
   Apply the supplied policy and available routing mechanisms to in-place compatibility, additive transition, explicit version, deprecation window, or rejection of the change.
   Identify client migrations, owner roles, notice, exit evidence, and old-behavior retention.
   Do not recommend per-client routing when only version-level routing exists.
   When clients select an explicit version path, require each affected client owner to approve and verify that path adoption rather than describing gateway routing as a client cohort.
8. **Design rollout, observation, and rollback.**
   Record baseline metrics, privacy-safe signals, abort thresholds, observation window, traffic steps, and the exact supported boundary for rollback.
   Cover every material contract change with an approved signal and threshold, or keep traffic blocked for the uncovered change.
   Retain old behavior until client and observation gates pass.
9. **Package and approve the decision.**
   Deliver the compatibility matrix, finding and client-impact registers, verification, versioning or deprecation plan, monitoring, rollback, assumptions, limitations, and traceability.
   Obtain API-owner and affected-client approval before a breaking shipment and API-owner approval before deprecated behavior removal.

## Decision points

- If the prior wire contract cannot be recovered, stop compatibility approval and reconstruct it from released artifacts or tests.
- If candidate implementation or retained runtime observations contradict the proposed contract, correct the inconsistent source of truth and rerun the entire wire comparison before approval.
- If a known client rejects the new shape, classify the change as breaking for that client and require a compatibility path.
- If client ownership is unknown, preserve the old behavior while collecting privacy-safe usage evidence.
- If a proposed routing strategy is unavailable in the supplied gateway or deployment capability, reject that strategy and choose a supported version or deployment boundary.
- If a client has not adopted the selected version path, keep that client on the released path and do not count it as migrated merely because the new route exists.
- If a material contract change lacks a privacy-safe monitoring signal, baseline, or abort threshold, keep traffic to that behavior blocked until those controls are approved.
- If the deprecation window or zero-use evidence is incomplete, keep the deprecated field or version available.
- If monitoring would require retaining response bodies, personal data, or internal errors, redesign the signal before rollout.

## Safety guardrails

- Do not expose internal errors in public API responses.
- Do not assume generated schemas represent runtime defaults or error behavior.
- Do not include personal data or internal stack details in contract examples.
- Do not silently change defaults, error shapes, or nullability.
- Do not log or retain request or response bodies merely to infer client compatibility.
- Keep rollout and rollback within documented version, gateway, deployment, or feature-flag capabilities.
- Do not describe a release cohort unless the supplied routing or client-selection evidence establishes how that cohort is selected.
- Preserve the released contract artifact and old handler until migration and observation gates pass.
- Stop removal when the deprecation window or client evidence is incomplete.

## Human approval gates

- Before shipping a breaking change, the API owner and every identified affected client owner approve the wire-difference evidence, migration instructions, support window, verification results, rollout, and rollback; the release manager then approves traffic changes.
- Before removing a deprecated field, the API owner approves completed notice, elapsed deprecation window, privacy-safe zero-use evidence, client-owner dispositions, and rollback boundary.

## Expected output

- **Bidirectional API compatibility report and finding register:** Every wire difference has old and new forms, producer and consumer classification, evidence, impact, severity, confidence, recommendation, verification, and disposition.
- **Observed and unknown client-impact register:** Client version, owner role, parser assumption, migration status, evidence source, and explicit unknown-consumer limitation.
- **Versioning, deprecation, rollout, monitoring, and rollback plan:** Supported routing mechanism, client path-adoption steps, dependencies, owners, notice and observation windows, objective exit criteria, per-change privacy-safe signals, abort thresholds, approvals, assumptions, and limitations.

The artifact must distinguish observations, inferences, recommendations, executed checks, proposed checks, assumptions, limitations, and next actions.
Material claims must cite example evidence IDs.

## Completion criteria

- Every wire-level difference is classified in both producer and consumer directions.
- Known clients are identified and unknown ownership is explicit.
- Candidate implementation and contract behavior agree for every changed element, and any claimed runtime equivalence has a retained observation; otherwise runtime remains explicitly unverified.
- Recommendations cite contract, implementation, client, policy, test, and rollout-capability evidence as applicable.
- Executed and proposed tests are clearly separated, with affected classifications left unverified when no result exists.
- Contract incompatibilities, implementation-derived behavior, inferred runtime impact, and observed runtime failures are labeled separately.
- Every material changed behavior has an approved monitoring signal and threshold, or its rollout remains explicitly blocked.
- Breaking changes have an approved compatibility or versioning path before shipping.
- Deprecated behavior is retained until notice, usage, client, and approval gates pass.

## Failure modes

- **F1:** The previous contract is unavailable.
- **F2:** Candidate implementation or retained runtime behavior contradicts the proposed schema.
- **F3:** Client ownership or usage is unknown.
- **F4:** The selected rollout or rollback mechanism does not exist.

## Recovery procedure

- **R1:** Recover the released schema, examples, and version selector from immutable release artifacts or retained tests, verify provenance, and restart at workflow step 1.
- **R2:** Halt approval, verify the provenance and environment of any retained response observation, and decide with the API owner whether the contract, implementation, or observation boundary is incorrect.
  Align the authoritative artifacts, then restart at workflow step 2 before rerunning producer and consumer contract tests.
- **R3:** Preserve old behavior, assign an owner-discovery action, collect approved privacy-safe version or field-use evidence, and resume at workflow step 5 while keeping unknown consumers explicit.
- **R4:** Reject the unsupported strategy, inventory actual version, gateway, deployment, and feature-flag boundaries, then restart at workflow step 7 with a mechanism that has retained rollback evidence.

## Example

The complete synthetic example is in [examples/input.md](examples/input.md), with its complete artifact in [examples/expected-output.md](examples/expected-output.md).
It demonstrates evidence traceability without relying on external sources.
