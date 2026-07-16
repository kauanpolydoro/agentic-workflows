---
title: "Review a pull request"
description: "Produce an evidence-linked pull request review with prioritized findings, executed checks, and a defensible merge verdict."
---

# Review a pull request

## Objective

Transform an immutable pull request diff, its intent, and recorded verification evidence into an evidence-linked review report, finding register, and merge recommendation.
The primary quality constraint is that every finding must be reproducible from the reviewed revision and that uncertainty must never be presented as a defect.

## When to use

- A pull request is ready for pre-merge review.
- A focused diff needs correctness, regression, security, compatibility, or test analysis before a merge decision.
- A previously reviewed pull request has a new immutable head and needs a fresh review boundary.

## When not to use

- The immutable base or head revision cannot be resolved.
- The diff, changed-file inventory, intent, or applicable repository instructions are incomplete.
- The request is to implement changes rather than review them.
- The change requires a specialist security, database, or API review that has not been requested or authorized.

## Required inputs

- **Immutable base revision, head revision, and merge base:** Supply full commit IDs or immutable archive identifiers, for example base `a100000000000000000000000000000000000000`, head `b200000000000000000000000000000000000000`, and merge base `a100000000000000000000000000000000000000`.
  These identifiers prevent a moving review boundary.
  Resolve every identifier, recompute the merge base, and stop if any value differs from the supplied record.
- **Complete unified diff and changed-file inventory:** Supply the diff from merge base to head plus the exact list of added, modified, renamed, and deleted paths.
  This evidence defines review coverage and supports line-specific findings.
  Recompute both artifacts from the immutable range and confirm that their paths agree.
- **Pull request intent, acceptance criteria, and repository instructions:** Supply the requested behavior, explicit exclusions, linked acceptance criteria, and every instruction file that governs a changed path.
  These records distinguish a defect from an intentional change and define project-specific constraints.
  Confirm the intent has an owner and map each changed path to the instruction files that apply to it.

## Optional inputs

- **CI run IDs, commands, logs, and test results:** Increase confidence when they identify the reviewed head, environment, exit status, and relevant failures.
- **Architecture decisions and public compatibility contracts:** Add constraints for module boundaries, public behavior, data formats, and supported consumers.
- **Safe reproduction artifacts:** Convert a suspected defect into a demonstrated result when the artifact runs locally without modifying external systems.

## Preconditions

- The base, head, and merge-base identifiers resolve and reproduce the supplied comparison range.
- The changed-file inventory contains every path in the complete diff and no additional path.
- Pull request intent and acceptance criteria are specific enough to classify the changed behavior.
- Applicable repository instructions have been identified for every changed path.
- Review activity can remain read-only except for separately approved local verification artifacts.

## Workflow

1. **Freeze the review boundary.**
   Resolve the supplied base and head, compute the merge base, and record all three immutable identifiers in the review worksheet.
   Recreate the changed-file inventory and compare it with the supplied inventory.
   Advance only when the revisions and path sets agree; otherwise stop under F1 or F2.
2. **Establish intent and governing rules.**
   Break the acceptance criteria into observable behaviors and map each changed path to applicable repository instructions.
   Record exclusions and unresolved intent questions rather than inferring them.
   Advance when every changed path has an intent or an explicit scope concern; stop if a rule or acceptance criterion needed for classification is missing.
3. **Build a change map.**
   For every diff hunk, record the affected public behavior, callers, data flow, side effects, error paths, and associated tests.
   Check renames and deletions as well as added lines so removed protections are not omitted.
   Advance when every changed hunk has a review disposition such as behavior change, test, documentation, generated artifact, or no-op formatting.
4. **Analyze consequential behavior.**
   Trace inputs through validation, authorization, state changes, external writes, concurrency boundaries, and error handling where those concerns apply.
   Compare each observation with the supplied intent and project rules.
   Stop and request specialist review when the change crosses a boundary whose risk cannot be assessed from the supplied evidence.
5. **Evaluate verification coverage.**
   Map each changed branch and failure path to an existing or changed test.
   For every supplied CI result, verify the run ID or command is tied to the reviewed head and record its exact result.
   Mark checks without retained results as proposed, not passing.
6. **Validate candidate findings.**
   For each candidate, state the exact observation, cited diff or rule, user or system impact, severity rationale, confidence, and a falsifiable verification step.
   Try to disprove the candidate against surrounding code and supplied tests.
   Keep it as a finding only when evidence supports the claim; otherwise convert it to a question or remove it.
7. **Derive the merge recommendation.**
   Apply the repository severity and merge policy to unresolved dispositions.
   Record `approve`, `comment`, or `request changes` only when that verdict follows from the supplied policy and findings.
   If no merge policy is supplied, report findings without inventing a verdict rule.
8. **Package and approve the report.**
   Produce the scope summary, finding register, verification record, assumptions, limitations, residual risks, and traceability table.
   Recheck the head immediately before submission.
   Submit only after the repository maintainer approves the report package at the documented gate.

## Decision points

- If the diff or intent is incomplete, stop and request the missing evidence.
- If the recomputed changed-file inventory differs from the supplied inventory, invalidate the supplied diff and restart from a newly generated immutable comparison.
- If a suspected defect cannot be supported by the diff or a reproduction, report it as a question.
- If a CI result does not identify the reviewed head, label it unrelated and do not use it as verification evidence.
- If a change affects authentication, production data, or a public wire contract beyond the reviewer's evidence, require the relevant specialist review before merge approval.
- If a blocking finding remains open, recommend changes rather than approval.
- If the head changes before submission, discard the verdict and review the new comparison range.

## Safety guardrails

- Never change unrelated files.
- Never approve a change with unverified blocking behavior.
- Do not modify files while performing the review.
- Do not expose secrets found in the diff; reference only a redacted location.
- Do not run commands that write to production, shared infrastructure, external services, or user data.
- Limit local checks to the reviewed repository and record every created artifact for cleanup.
- Do not treat a passing broad test command as proof of an unexercised changed branch.
- Stop when the reviewed head no longer matches the supplied diff.

## Human approval gates

- Before submitting the final review or merge recommendation, the repository maintainer approves the immutable range, path inventory, finding dispositions, executed and proposed checks, and residual risks.
- If specialist review is required, the relevant owner, such as the security owner, database owner, or API owner, approves the boundary-specific evidence before the repository maintainer approves merge.

## Expected output

- **Evidence-linked pull request review report:** Markdown containing the immutable comparison range, intent, changed-file coverage, verdict, assumptions, and limitations.
- **Prioritized finding register with dispositions:** Each row contains finding, evidence, impact, severity, confidence, recommendation, verification, and disposition.
- **Verification record and merge recommendation:** Separate executed checks from proposed checks, state residual risk, identify required approvals, and map material conclusions to evidence IDs.

The artifact must distinguish observations from inferences and recommendations.
It must not claim that a check ran unless the input records its command, reviewed revision, and result.

## Completion criteria

- Every changed file and material behavior is accounted for.
- Every finding cites supplied evidence and has an objective disposition.
- Every severity and confidence rating has a reviewable rationale.
- Executed checks identify the command, reviewed revision, and result, while unexecuted checks are labeled proposed.
- The final verdict follows from the unresolved finding severities.
- Assumptions, limitations, specialist-review needs, and residual risks are explicit.
- The repository maintainer has approved the exact report submitted for the recorded head.

## Failure modes

- **F1:** The comparison range cannot be resolved.
- **F2:** The recreated diff and changed-file inventory do not agree.
- **F3:** A required check cannot run in the available environment.
- **F4:** The pull request head changes during review or before submission.
- **F5:** Pull request intent, acceptance criteria, or governing instructions are incomplete for a changed path.

## Recovery procedure

- **R1:** Obtain resolvable immutable base and head revisions, recompute the merge base, retain the new identifiers, and restart at workflow step 1.
- **R2:** Regenerate both artifacts from the same merge-base-to-head range, retain their path comparison, and restart at workflow step 1; escalate if they still disagree.
- **R3:** Record the missing capability and environment, run only a safe narrower check when it tests the same claim, leave the original check unverified, and resume at workflow step 6.
- **R4:** Discard the stale verdict and findings whose lines changed, capture the new immutable head and diff, and restart the entire review at workflow step 1.
- **R5:** Stop classification for the affected path, obtain the missing owner-confirmed intent, acceptance criterion, or complete instruction map, invalidate conclusions that depended on the gap, and restart at workflow step 2.

## Example

The complete synthetic example is in [#complete-example-input](#complete-example-input), with its complete artifact in [#complete-expected-output](#complete-expected-output).
It demonstrates evidence traceability without relying on external sources.

## Output contract

The expected artifact is validated by the recipe-specific contract below.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://agentic-workflows.dev/output-contracts/review-pull-request/1.0.0",
  "title": "Pull request review output contract",
  "description": "Validates the immutable review scope, evidence-ranked findings, executed and proposed checks, coverage disposition, limitations, approval gate, and traceability in the reference Markdown output.",
  "type": "string",
  "contentMediaType": "text/markdown",
  "x-awf-output-contract": {
    "container": "document",
    "artifacts": [
      {
        "path": "pull-request-review.md",
        "audience": "Pull request authors and repository maintainers",
        "requires_title": true,
        "required_headings": [
          "Scope and verdict",
          "Findings",
          "Checks",
          "Executed",
          "Proposed",
          "Coverage disposition",
          "Assumptions and limitations",
          "Approval and next decision",
          "Traceability"
        ],
        "required_literals": [
          "| Severity | Confidence | Finding | Evidence | Impact | Recommendation | Verification | Disposition |",
          "| Changed file | Reviewed behavior | Evidence | Disposition |",
          "| Material conclusion | Evidence |"
        ],
        "evidence_references": "required",
        "minimum_distinct_evidence_references": 2
      }
    ]
  }
}
```

## Complete example input

This is a synthetic, self-contained scenario.
No external record should be consulted.

## Context

Synthetic PR `#42` changes timeout retry handling for an invoice-delivery client.
The application sends invoice-creation requests to an external provider.

## Request

Review the synthetic change and decide whether it is ready to merge.

## Constraints

- Use only the evidence below.
- Treat commands as executed only when their evidence explicitly records a result.
- State assumptions and limitations.
- Do not modify the synthetic code or contact an external provider.

## Evidence inventory

### E1 - Revision record

- Type: Immutable revision record.
- Content: Base `a100000000000000000000000000000000000000`, head `b200000000000000000000000000000000000000`, and merge base `a100000000000000000000000000000000000000` resolve locally.
- Integrity: The supplied diff and test command record both identify head `b200000000000000000000000000000000000000`.
- Establishes: The immutable comparison boundary.

### E2 - Pull request intent and changed-file inventory

- Type: Author request and path inventory.
- Content: The acceptance criterion is "retry one transport timeout only when duplicate invoice creation is prevented, and preserve all non-timeout errors."
- Content: The complete changed-file inventory is `src/delivery.ts` and `src/delivery.test.ts`; there are no renames, deletions, generated files, or other changed paths.
- Integrity: The inventory was generated from `a100000000000000000000000000000000000000...b200000000000000000000000000000000000000`.
- Establishes: Intended behavior, exclusions, and review coverage.

### E3 - Complete production diff for `src/delivery.ts`

- Type: Unified diff.
- Content: The complete production diff is:

```diff
 export async function deliverInvoice(client, invoice) {
-  return client.post(invoice);
+  try {
+    return await client.post(invoice);
+  } catch (error) {
+    if (error.code !== "ETIMEDOUT") throw error;
+    return client.post(invoice);
+  }
 }
```

- No idempotency header or key is created elsewhere in the changed file.
- Integrity: The hunk is from `a100000000000000000000000000000000000000...b200000000000000000000000000000000000000` and accounts for the complete changed production file.
- Establishes: The timeout branch, retry action, and unchanged request arguments.

### E4 - Complete test diff for `src/delivery.test.ts`

- Type: Unified diff.
- Content: The complete test diff is:

```diff
+it("retries ETIMEDOUT once", async () => {
+  client.post
+    .mockRejectedValueOnce(Object.assign(new Error("timeout"), { code: "ETIMEDOUT" }))
+    .mockResolvedValueOnce({ ok: true });
+  await expect(deliverInvoice(client, invoice)).resolves.toEqual({ ok: true });
+  expect(client.post).toHaveBeenCalledTimes(2);
+});
```

- No test models a first request accepted by the provider followed by a local timeout, and no assertion inspects an idempotency key.
- Integrity: The hunk is from `a100000000000000000000000000000000000000...b200000000000000000000000000000000000000` and accounts for the complete changed test file.
- Establishes: The timeout retry-count coverage and the untested duplicate-prevention property.

### E5 - Provider contract and repository instruction

- Type: Public client contract and governing repository rule.
- Content: `client.post(invoice, options?)` creates an invoice and returns its provider identifier.
- Content: The provider only deduplicates repeated creation requests when both calls carry the same `Idempotency-Key` header.
- Content: `ETIMEDOUT` means the client did not receive a response and does not establish whether the provider accepted the first request.
- Content: The repository rule says external invoice writes must not be retried after an unknown outcome without an idempotency key.
- Content: The instruction inventory maps this external-write rule to `src/delivery.ts`, maps the E7 test-coverage and merge policy to `src/delivery.test.ts`, and records that neither changed path has another nested or conflicting instruction.
- Integrity: The contract and instruction map are declared complete for both changed paths at head `b200000000000000000000000000000000000000`.
- Establishes: Write semantics, timeout uncertainty, deduplication requirement, the applicable safety invariant, and the governing-instruction map for both changed files.

### E6 - Command record

- Type: Executed verification record.
- Content: `pnpm test delivery` exited 0 with 8 tests passing on head `b200000000000000000000000000000000000000` in the local Node.js test environment.
- Content: No end-to-end provider test or accepted-first-request simulation was executed.
- Integrity: The record identifies the command, reviewed head, environment class, exit status, and passing count.
- Establishes: The narrow unit-test result and its coverage limitation.

### E7 - Review and merge policy

- Type: Repository policy.
- Content: Repository review policy classifies a plausible duplicate external write as High severity and blocking until prevented or disproved.
- Content: A changed branch without a test for its required safety property is Medium severity when a separate blocking finding already prevents merge.
- Content: Any unresolved High finding requires `request changes`.
- Integrity: The policy is supplied as applicable to PR `#42`.
- Establishes: Severity and merge-disposition rules.

### E8 - Approval state

- Type: Human approval record.
- Content: The repository maintainer has not reviewed or submitted the synthetic report.
- Content: No specialist review was requested because the supplied rule and provider contract fully define the external-write concern for this example.
- Establishes: The pending submission gate and specialist-review disposition.

## Complete expected output

> Synthetic pull-request review derived only from the supplied diff, policy, and verification evidence.

## Scope and verdict

Reviewed merge base `a100000000000000000000000000000000000000` through head `b200000000000000000000000000000000000000` [E1].
The two reviewed paths are `src/delivery.ts` and `src/delivery.test.ts`, which match the complete supplied inventory [E2].
The external-write rule governs `src/delivery.ts`, the supplied test-coverage and merge policy governs `src/delivery.test.ts`, and the instruction inventory records no nested or conflicting rule for either path [E5, E7].
Recommended verdict: `request changes` because one unresolved High finding is blocking under the supplied merge policy [E7].
Submission remains pending repository-maintainer approval [E8].

## Findings

| Severity | Confidence | Finding | Evidence | Impact | Recommendation | Verification | Disposition |
|---|---|---|---|---|---|---|---|
| High | High, because the complete changed production hunk and governing provider contract directly expose both request arguments and the missing required key | The `ETIMEDOUT` branch repeats the invoice-creation call without the idempotency key required to deduplicate an unknown-outcome retry. | E3, E5, E6, E7 | Observation: both attempts use `client.post(invoice)` with no options. Inference: because a timeout does not prove rejection, the provider may create two invoices. The supplied policy classifies this duplicate-write risk as High. | Pass a stable invoice-specific idempotency key on both attempts, or stop retrying when the first outcome is unknown. | Add a local test that models an accepted first call followed by `ETIMEDOUT`, captures both request options, and proves the same non-empty key is sent twice. No such test was executed. | Blocking |
| Medium | High, because the complete changed test hunk shows the only new assertion and the supplied inventory excludes other changed tests | The changed test checks retry count but does not check the required duplicate-prevention property. | E2, E4, E6, E7 | The suite can pass while the acceptance criterion remains violated. | Replace or extend the test with assertions for a stable idempotency key and preserved non-timeout errors. | The existing command passed, but the required assertions are absent from the complete test diff. | Open |

## Checks

### Executed

- `pnpm test delivery` exited 0 with 8 tests passing on head `b200000000000000000000000000000000000000` [E6].

### Proposed

- Run a local accepted-first-request simulation and assert identical non-empty idempotency keys on both calls [E4, E5].
- Exercise a non-timeout error and assert that it is rethrown, as required by the acceptance criterion [E2].

The proposed checks have not been executed [E6].

## Coverage disposition

| Changed file | Reviewed behavior | Evidence | Disposition |
|---|---|---|---|
| `src/delivery.ts` | Timeout classification, repeated external write, and non-timeout rethrow branch | E2, E3, E5 | High finding plus a proposed non-timeout regression check |
| `src/delivery.test.ts` | Timeout retry count and missing duplicate-prevention assertion | E2, E4 | Medium finding |

Governing instructions are E5 for the production path and E7 for the test path, with no additional nested instruction in the supplied complete map [E5, E7].

## Assumptions and limitations

The review relies on the supplied diffs and inventory being complete for head `b200000000000000000000000000000000000000` [E1, E2].
The provider behavior is limited to the supplied contract; no other provider-side protection is assumed [E5].
No end-to-end provider behavior was observed [E6].
The report recommends code and tests but does not claim either was implemented.

## Approval and next decision

The repository maintainer may reconsider the merge recommendation after the High finding is prevented or disproved and the proposed safety-property test passes on a new immutable head.
The report itself is not submitted until the maintainer approves the range, findings, checks, and residual risk [E8].

## Traceability

| Material conclusion | Evidence |
|---|---|
| Immutable range and reviewed head | E1 |
| Intent and complete changed-file coverage | E2 |
| Repeated call without request options | E3 |
| Missing idempotency assertion | E4 |
| Unknown timeout outcome and required deduplication key | E5 |
| Executed test result and unexecuted provider simulation | E6 |
| High and Medium severity plus `request changes` rule | E7 |
| Pending repository-maintainer submission gate | E8 |
